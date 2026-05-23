import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AtsService } from './ats.service';
import {
  AutoCreateEmployeeFromAtsDto,
  UpdateCandidateStageDto,
} from './dtos/ats.dto';

@Controller('ats')
@UseGuards(AuthGuard('jwt'))
export class AtsController {
  constructor(private readonly atsService: AtsService) {}

  @Patch('candidates/:id/stage')
  @HttpCode(HttpStatus.OK)
  async updateCandidateStage(
    @Param('id') candidateId: string,
    @Body() body: UpdateCandidateStageDto,
  ) {
    return this.atsService.updateCandidateStage(candidateId, body);
  }

  @Post('candidates/:id/auto-onboard')
  @HttpCode(HttpStatus.CREATED)
  async autoCreateEmployeeFromAts(
    @Param('id') candidateId: string,
    @Body() body: AutoCreateEmployeeFromAtsDto,
  ) {
    return this.atsService.autoCreateEmployeeFromAts(candidateId, body);
  }
}
