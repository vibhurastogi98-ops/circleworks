import { Injectable } from '@nestjs/common';
import { WebsocketsService } from '../websockets/websockets.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly websocketsService: WebsocketsService) {}

  async createEmployee(companyId: string, employeeData: any) {
    // Create employee in database...

    // Emit WebSocket event
    this.websocketsService.emitEmployeeCreated(companyId, {
      employee: employeeData,
    });
  }

  async updateEmployee(companyId: string, employeeId: string, changes: any) {
    // Update employee in database...

    // Emit WebSocket event
    this.websocketsService.emitEmployeeUpdated(companyId, {
      employeeId,
      changedFields: Object.keys(changes),
    });
  }

  async terminateEmployee(companyId: string, employeeId: string, lastDay: string) {
    // Terminate employee in database...

    // Emit WebSocket event
    this.websocketsService.emitEmployeeTerminated(companyId, {
      employeeId,
      lastDay,
    });
  }

  async clockIn(companyId: string, employeeId: string, timestamp: string) {
    // Record clock in...

    // Emit WebSocket event
    this.websocketsService.emitEmployeeClockedIn(companyId, {
      employeeId,
      timestamp,
    });
  }

  async clockOut(companyId: string, employeeId: string, timestamp: string, hoursWorked: number) {
    // Record clock out...

    // Emit WebSocket event
    this.websocketsService.emitEmployeeClockedOut(companyId, {
      employeeId,
      timestamp,
      hoursWorked,
    });
  }
}