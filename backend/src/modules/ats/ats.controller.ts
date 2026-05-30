import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';

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

@Controller('jobs')
@UseGuards(AuthGuard('jwt'))
export class JobsController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get()
  async list(@Query() query: Record<string, any>) {
    return this.crud.list('jobOpening', query, {
      companyScoped: true,
      filterMap: {
        status: 'status',
        positionId: 'positionId',
        managerId: 'managerId',
      },
      searchFields: ['title', 'description', 'department', 'location'],
      include: { position: true, candidates: true },
    });
  }

  @Post()
  async create(@Body() body: any) {
    return this.crud.create('jobOpening', body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.crud.get('jobOpening', id, {
      include: { position: true, candidates: true, offers: true },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('jobOpening', id, body);
  }

  @Delete(':id')
  async close(@Param('id') id: string) {
    return this.crud.update('jobOpening', id, {
      status: 'closed',
      closedAt: new Date(),
    });
  }

  @Get(':id/candidates')
  async candidates(
    @Param('id') id: string,
    @Query() query: Record<string, any>,
  ) {
    return this.crud.list(
      'candidate',
      { ...query, jobOpeningId: id },
      {
        filterMap: {
          jobOpeningId: 'jobOpeningId',
          currentStage: 'currentStage',
          stage: 'currentStage',
        },
        searchFields: ['firstName', 'lastName', 'email'],
        include: { jobOpening: true, offers: true, interviews: true },
      },
    );
  }
}

@Controller('candidates')
@UseGuards(AuthGuard('jwt'))
export class CandidatesController {
  constructor(
    private readonly crud: PrismaCrudService,
    private readonly atsService: AtsService,
  ) {}

  @Get()
  async list(@Query() query: Record<string, any>) {
    return this.crud.list('candidate', query, {
      companyScoped: true,
      filterMap: {
        currentStage: 'currentStage',
        stage: 'currentStage',
        jobOpeningId: 'jobOpeningId',
      },
      searchFields: ['firstName', 'lastName', 'email'],
      include: { jobOpening: true, offers: true, interviews: true },
    });
  }

  @Post()
  async create(@Body() body: any) {
    return this.crud.create('candidate', body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.crud.get('candidate', id, {
      include: {
        jobOpening: true,
        offers: true,
        interviews: true,
        employee: true,
      },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('candidate', id, body);
  }

  @Post(':id/stage')
  @Put(':id/stage')
  @Patch(':id/stage')
  @HttpCode(HttpStatus.OK)
  async updateStage(
    @Param('id') id: string,
    @Body() body: UpdateCandidateStageDto,
  ) {
    return this.atsService.updateCandidateStage(id, body);
  }
}

@Controller('interviews')
@UseGuards(AuthGuard('jwt'))
export class InterviewsController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get()
  async list(@Query() query: Record<string, any>) {
    return this.crud.list('interview', query, {
      filterMap: {
        candidateId: 'candidateId',
        interviewerId: 'interviewerId',
        status: 'status',
      },
      include: { candidate: true, interviewer: true },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  @Post()
  async create(@Body() body: any) {
    return this.crud.create('interview', body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.crud.get('interview', id, {
      include: { candidate: true, interviewer: true },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('interview', id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.crud.remove('interview', id);
  }
}

@Controller('offers')
@UseGuards(AuthGuard('jwt'))
export class OffersController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get()
  async list(@Query() query: Record<string, any>) {
    return this.crud.list('offer', query, {
      filterMap: {
        candidateId: 'candidateId',
        jobOpeningId: 'jobOpeningId',
        status: 'status',
      },
      include: { candidate: true, jobOpening: true },
    });
  }

  @Post()
  async create(@Body() body: any) {
    return this.crud.create('offer', body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.crud.get('offer', id, {
      include: { candidate: true, jobOpening: true },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const statusPatch =
      body.status === 'accepted'
        ? { acceptedAt: new Date() }
        : body.status === 'rejected'
          ? { rejectedAt: new Date() }
          : {};
    return this.crud.update('offer', id, { ...body, ...statusPatch });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.crud.remove('offer', id);
  }
}
