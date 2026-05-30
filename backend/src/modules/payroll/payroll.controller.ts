import {
  Body,
  Controller,
  Get,
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
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';
import { PayrollService } from './payroll.service';

@Controller('payroll')
@UseGuards(AuthGuard('jwt'))
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly crud: PrismaCrudService,
  ) {}

  @Post('runs')
  async createRun(@Body() body: any) {
    return this.payrollService.createRun(body);
  }

  @Get('runs')
  async listRuns(@Query() query: Record<string, any>) {
    return this.payrollService.listRuns(query);
  }

  @Get('history')
  async history(@Query() query: Record<string, any>) {
    return this.payrollService.history(query);
  }

  @Get('schedules')
  async listSchedules(@Query() query: Record<string, any>) {
    return this.payrollService.listSchedules(query);
  }

  @Post('schedules')
  async createSchedule(@Body() body: any) {
    return this.crud.create('payrollSchedule', body);
  }

  @Put('schedules/:id')
  async updateSchedule(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('payrollSchedule', id, body);
  }

  @Get('tax-accounts')
  async listTaxAccounts(@Query() query: Record<string, any>) {
    return this.payrollService.listTaxAccounts(query);
  }

  @Post('tax-accounts')
  async createTaxAccount(@Body() body: any) {
    return this.crud.create('taxAccount', body);
  }

  @Get('garnishments')
  async listGarnishments(@Query() query: Record<string, any>) {
    return this.payrollService.listGarnishments(query);
  }

  @Post('garnishments')
  async createGarnishment(@Body() body: any) {
    return this.crud.create('garnishment', body);
  }

  @Get('runs/:runId')
  async getRun(@Param('runId') runId: string) {
    return this.payrollService.getRun(runId);
  }

  @Put('runs/:runId')
  async updateRun(@Param('runId') runId: string, @Body() body: any) {
    return this.payrollService.updateRun(runId, body);
  }

  @Post('runs/:runId/submit')
  @HttpCode(HttpStatus.OK)
  async submitRun(@Param('runId') runId: string, @Body() body: any) {
    return this.payrollService.submitRun(runId, body.approverIds || []);
  }

  @Post('runs/:runId/approve')
  @HttpCode(HttpStatus.OK)
  async approveRun(
    @Param('runId') runId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.payrollService.approveRun(
      runId,
      body.approvedBy || req.user?.id,
    );
  }

  @Post('runs/:runId/process')
  @HttpCode(HttpStatus.OK)
  async processRun(@Param('runId') runId: string, @Body() body: any) {
    return this.payrollService.processRun(runId, body);
  }

  @Get('runs/:runId/paystubs')
  async listPaystubs(@Param('runId') runId: string) {
    return this.payrollService.listPaystubs(runId);
  }

  @Get('runs/:runId/paystubs/:employeeId')
  async getPaystub(
    @Param('runId') runId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.payrollService.getPaystub(runId, employeeId);
  }
}
