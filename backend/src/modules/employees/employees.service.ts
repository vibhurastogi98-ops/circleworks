import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeStatus } from '@prisma/client';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';
import { WebsocketsService } from '../websockets/websockets.service';
import { WebhooksService } from '../webhooks/webhooks.service';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly crud: PrismaCrudService,
    private readonly websocketsService: WebsocketsService,
    private readonly webhooksService: WebhooksService,
  ) {}

  async listEmployees(query: Record<string, any>) {
    return this.crud.list('employee', query, {
      companyScoped: true,
      defaultLimit: 25,
      filterMap: {
        status: 'status',
        dept: 'departmentId',
        departmentId: 'departmentId',
        type: 'employmentType',
        manager: 'reportingManagerId',
        managerId: 'reportingManagerId',
      },
      searchFields: ['firstName', 'lastName', 'email', 'jobTitle'],
      include: {
        department: true,
        reportingManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async createEmployee(companyId: string, employeeData: any) {
    const employee = await this.crud.create('employee', {
      ...employeeData,
      companyId: companyId || employeeData.companyId,
    });

    this.websocketsService.emitEmployeeCreated(employee.companyId, {
      employee,
    });
    void this.webhooksService.dispatch(employee.companyId, 'employee.created', {
      employee,
    });
    return employee;
  }

  async getEmployee(employeeId: string) {
    return this.crud.get('employee', employeeId, {
      include: {
        department: true,
        reportingManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        compensationHistory: { orderBy: { effectiveDate: 'desc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });
  }

  async updateEmployee(companyId: string, employeeId: string, changes: any) {
    const employee = await this.crud.update('employee', employeeId, changes);

    this.websocketsService.emitEmployeeUpdated(
      companyId || employee.companyId,
      {
        employeeId,
        changedFields: Object.keys(changes),
      },
    );

    return employee;
  }

  async terminateEmployee(
    companyId: string,
    employeeId: string,
    lastDay?: string,
  ) {
    const terminationDate = lastDay ? new Date(lastDay) : new Date();
    const employee = await this.crud.softUpdate('employee', employeeId, {
      status: EmployeeStatus.TERMINATED,
      terminationDate,
      deletedAt: terminationDate,
    });

    this.websocketsService.emitEmployeeTerminated(
      companyId || employee.companyId,
      {
        employeeId,
        lastDay: terminationDate.toISOString(),
      },
    );
    void this.webhooksService.dispatch(
      employee.companyId,
      'employee.terminated',
      {
        employeeId,
        lastDay: terminationDate.toISOString(),
      },
    );

    return employee;
  }

  async listCompensationHistory(employeeId: string) {
    await this.ensureEmployee(employeeId);
    return this.crud.prismaClient.compensationHistory.findMany({
      where: { employeeId },
      orderBy: { effectiveDate: 'desc' },
    });
  }

  async requestCompensationChange(employeeId: string, data: any) {
    const employee = await this.ensureEmployee(employeeId);
    const change = await this.crud.create('compensationHistory', {
      employeeId,
      effectiveDate: data.effectiveDate || new Date().toISOString(),
      baseSalary: data.baseSalary ?? data.annualSalary ?? data.payRate,
      bonusAmount: data.bonusAmount,
      reason: data.reason || 'Compensation change request',
      approvedBy: data.approvedBy,
    });

    if (data.applyImmediately) {
      await this.crud.update('employee', employeeId, {
        payRate: data.payRate ?? data.baseSalary ?? employee.payRate,
        annualSalary:
          data.annualSalary ?? data.baseSalary ?? employee.annualSalary,
      });
    }

    this.websocketsService.emitEmployeeUpdated(employee.companyId, {
      employeeId,
      changedFields: ['compensationHistory'],
    });

    return change;
  }

  async listDocuments(employeeId: string) {
    await this.ensureEmployee(employeeId);
    return this.crud.prismaClient.employeeDocument.findMany({
      where: { employeeId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async uploadDocument(employeeId: string, data: any) {
    await this.ensureEmployee(employeeId);
    return this.crud.create('employeeDocument', {
      employeeId,
      documentType: data.documentType || data.type || 'employee_document',
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: Number(data.fileSize || 0),
      expiresAt: data.expiresAt,
      isRequired: Boolean(data.isRequired),
      uploadedBy: data.uploadedBy,
    });
  }

  async getOrgChart(companyId?: string) {
    const employees = await this.crud.prismaClient.employee.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        jobTitle: true,
        departmentId: true,
        reportingManagerId: true,
        managerId: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    const nodes = new Map(
      employees.map((employee) => [
        employee.id,
        {
          ...employee,
          name: `${employee.firstName} ${employee.lastName}`.trim(),
          reports: [],
        },
      ]),
    );

    const roots = [];
    for (const node of nodes.values()) {
      const managerId = node.reportingManagerId || node.managerId;
      const manager = managerId ? nodes.get(managerId) : undefined;
      if (manager) {
        manager.reports.push(node);
      } else {
        roots.push(node);
      }
    }

    return { data: roots, total: employees.length };
  }

  getBulkTemplate() {
    return [
      'firstName,lastName,email,hireDate,employmentType,payType,payRate,departmentId,jobTitle,managerId',
      'Ada,Lovelace,ada@example.com,2026-06-01,FULL_TIME,SALARY,120000,dept_id,Engineer,manager_id',
    ].join('\n');
  }

  async bulkImport(body: {
    csv?: string;
    rows?: any[];
    companyId?: string;
    commit?: boolean;
  }) {
    const rows = body.rows || this.parseCsv(body.csv || '');
    const preview = rows.map((row, index) => {
      const errors = [];
      if (!row.firstName) errors.push('firstName is required');
      if (!row.lastName) errors.push('lastName is required');
      if (!row.email) errors.push('email is required');
      if (!row.companyId && !body.companyId)
        errors.push('companyId is required');
      if (!row.hireDate) errors.push('hireDate is required');
      if (!row.employmentType) errors.push('employmentType is required');
      if (!row.payType) errors.push('payType is required');
      if (row.payRate === undefined || row.payRate === '')
        errors.push('payRate is required');
      return { rowNumber: index + 1, data: row, errors };
    });

    const invalidRows = preview.filter((row) => row.errors.length > 0);
    if (invalidRows.length > 0 || !body.commit) {
      return {
        commit: false,
        validRows: preview.length - invalidRows.length,
        invalidRows: invalidRows.length,
        preview,
      };
    }

    const created = await this.crud.createMany(
      'employee',
      rows.map((row) => ({
        ...row,
        companyId: row.companyId || body.companyId,
        payRate: Number(row.payRate),
      })),
    );

    return { commit: true, imported: created.count, preview };
  }

  async clockIn(companyId: string, employeeId: string, timestamp: string) {
    // Record clock in...

    // Emit WebSocket event
    this.websocketsService.emitEmployeeClockedIn(companyId, {
      employeeId,
      timestamp,
    });
  }

  async clockOut(
    companyId: string,
    employeeId: string,
    timestamp: string,
    hoursWorked: number,
  ) {
    // Record clock out...

    // Emit WebSocket event
    this.websocketsService.emitEmployeeClockedOut(companyId, {
      employeeId,
      timestamp,
      hoursWorked,
    });
  }

  private async ensureEmployee(employeeId: string) {
    const employee = await this.crud.prismaClient.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  private parseCsv(csv: string) {
    if (!csv.trim()) {
      throw new BadRequestException('csv or rows is required');
    }

    const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
    const headers = headerLine.split(',').map((header) => header.trim());

    return lines.filter(Boolean).map((line) =>
      line.split(',').reduce(
        (row, value, index) => {
          row[headers[index]] = value.trim();
          return row;
        },
        {} as Record<string, string>,
      ),
    );
  }
}
