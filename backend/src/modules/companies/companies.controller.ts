import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompaniesService } from './companies.service';

@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get(':id')
  async getCompany(@Param('id') companyId: string) {
    return this.companiesService.getCompany(companyId);
  }

  @Post()
  async createCompany(@Body() data: any, @Request() req: any) {
    return this.companiesService.createCompany(data, req.user.id);
  }

  @Put(':id')
  async updateCompany(@Param('id') companyId: string, @Body() data: any) {
    return this.companiesService.updateCompany(companyId, data);
  }

  @Get(':id/users')
  async listCompanyUsers(@Param('id') companyId: string) {
    return this.companiesService.listCompanyUsers(companyId);
  }

  @Post(':id/invitations')
  @HttpCode(HttpStatus.CREATED)
  async inviteUser(
    @Param('id') companyId: string,
    @Body() body: { email: string; role?: string },
  ) {
    return this.companiesService.inviteUser(companyId, body.email, body.role);
  }

  @Post('switch')
  @HttpCode(HttpStatus.OK)
  async switchCompany(@Request() req: any, @Body() body: { companyId: string }) {
    return this.companiesService.switchCompany(req.user.id, body.companyId);
  }
}
