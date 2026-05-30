import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeesService } from './employees.service';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';

@Controller('employees')
@UseGuards(AuthGuard('jwt'))
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async listEmployees(@Query() query: Record<string, any>) {
    return this.employeesService.listEmployees(query);
  }

  @Post()
  async createEmployee(
    @Body() body: any,
    @Query('companyId') companyId?: string,
  ) {
    return this.employeesService.createEmployee(
      companyId || body.companyId,
      body,
    );
  }

  @Get('org-chart')
  async getOrgChart(@Query('companyId') companyId?: string) {
    return this.employeesService.getOrgChart(companyId);
  }

  @Get('bulk-template')
  @Header('Content-Type', 'text/csv')
  async getBulkTemplate() {
    return this.employeesService.getBulkTemplate();
  }

  @Post('bulk-import')
  @HttpCode(HttpStatus.OK)
  async bulkImport(@Body() body: any) {
    return this.employeesService.bulkImport(body);
  }

  @Get(':id')
  async getEmployee(@Param('id') employeeId: string) {
    return this.employeesService.getEmployee(employeeId);
  }

  @Put(':id')
  async updateEmployee(
    @Param('id') employeeId: string,
    @Body() body: any,
    @Query('companyId') companyId?: string,
  ) {
    return this.employeesService.updateEmployee(
      companyId || body.companyId,
      employeeId,
      body,
    );
  }

  @Delete(':id')
  async terminateEmployee(
    @Param('id') employeeId: string,
    @Body() body: any,
    @Query('companyId') companyId?: string,
  ) {
    return this.employeesService.terminateEmployee(
      companyId || body?.companyId,
      employeeId,
      body?.lastDay,
    );
  }

  @Get(':id/compensation-history')
  async listCompensationHistory(@Param('id') employeeId: string) {
    return this.employeesService.listCompensationHistory(employeeId);
  }

  @Post(':id/compensation-change')
  async requestCompensationChange(
    @Param('id') employeeId: string,
    @Body() body: any,
  ) {
    return this.employeesService.requestCompensationChange(employeeId, body);
  }

  @Get(':id/documents')
  async listDocuments(@Param('id') employeeId: string) {
    return this.employeesService.listDocuments(employeeId);
  }

  @Post(':id/documents')
  async uploadDocument(
    @Param('id') employeeId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.employeesService.uploadDocument(employeeId, {
      ...body,
      uploadedBy: body.uploadedBy || req.user?.id,
    });
  }
}

@Controller('departments')
@UseGuards(AuthGuard('jwt'))
export class DepartmentsController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get()
  async list(@Query() query: Record<string, any>) {
    return this.crud.list('department', query, {
      companyScoped: true,
      filterMap: { name: 'name' },
      searchFields: ['name', 'description'],
      include: {
        employees: { select: { id: true } },
        positions: { select: { id: true } },
      },
    });
  }

  @Post()
  async create(@Body() body: any) {
    return this.crud.create('department', body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.crud.get('department', id, {
      include: {
        employees: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        positions: true,
      },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('department', id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.crud.remove('department', id);
  }
}

@Controller('positions')
@UseGuards(AuthGuard('jwt'))
export class PositionsController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get()
  async list(@Query() query: Record<string, any>) {
    return this.crud.list('position', query, {
      companyScoped: true,
      filterMap: { departmentId: 'departmentId', level: 'level' },
      searchFields: ['name', 'description', 'level'],
      include: { department: true },
    });
  }

  @Post()
  async create(@Body() body: any) {
    return this.crud.create('position', body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.crud.get('position', id, {
      include: { department: true, jobOpenings: true },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('position', id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.crud.remove('position', id);
  }
}
