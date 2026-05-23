import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  CandidateStage,
  EmployeeStatus,
  EmploymentType,
  PayType,
} from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { WebsocketsService } from '../websockets/websockets.service';
import { QUEUE_EMAIL_DELIVERY } from '@/queues/queue.constants';
import {
  AutoCreateEmployeeFromAtsDto,
  UpdateCandidateStageDto,
} from './dtos/ats.dto';

const PRE_BOARDING_INVITATION_TEMPLATE_ID = 28;

type CanonicalAtsEmployeeMapping = {
  firstName: string;
  lastName: string;
  personalEmail: string;
  personalPhone?: string | null;
  annualSalary?: number | null;
  startDate?: Date | null;
  jobTitle?: string | null;
  departmentId?: string | null;
  locationId?: string | null;
  employmentType: EmploymentType;
  managerId?: string | null;
};

@Injectable()
export class AtsService {
  private readonly logger = new Logger(AtsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketsService: WebsocketsService,
    @InjectQueue(QUEUE_EMAIL_DELIVERY) private readonly emailQueue: Queue,
  ) {}

  async updateCandidateStage(
    candidateId: string,
    dto: UpdateCandidateStageDto,
  ) {
    const nextStage = this.normalizeCandidateStage(dto.stage);

    if (nextStage === CandidateStage.HIRED) {
      return this.autoCreateEmployeeFromAts(candidateId, dto);
    }

    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        companyId: true,
        currentStage: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const updated = await this.prisma.candidate.update({
      where: { id: candidateId },
      data: { currentStage: nextStage },
    });

    this.websocketsService.emitAtsCandidateStageChanged(candidate.companyId, {
      candidateId,
      fromStage: candidate.currentStage,
      toStage: nextStage,
    });

    return updated;
  }

  async autoCreateEmployeeFromAts(
    candidateId: string,
    dto: AutoCreateEmployeeFromAtsDto = {},
  ) {
    const ignoreDuplicate = dto.ignoreDuplicate ?? false;
    let previousStage: CandidateStage | null = null;

    const result = await this.prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.findUnique({
        where: { id: candidateId },
        include: {
          company: true,
          jobOpening: {
            include: {
              position: true,
            },
          },
        },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate not found');
      }

      previousStage = candidate.currentStage;

      const offer = dto.offerId
        ? await tx.offer.findFirst({
            where: {
              id: dto.offerId,
              candidateId: candidate.id,
            },
            include: {
              jobOpening: {
                include: {
                  position: true,
                },
              },
            },
          })
        : await tx.offer.findFirst({
            where: {
              candidateId: candidate.id,
              status: { equals: 'accepted', mode: 'insensitive' },
            },
            orderBy: { createdAt: 'desc' },
            include: {
              jobOpening: {
                include: {
                  position: true,
                },
              },
            },
          });

      if (!offer) {
        throw new BadRequestException(
          'An accepted offer is required before moving candidate to Hired',
        );
      }

      if (offer.status.toLowerCase() !== 'accepted') {
        throw new BadRequestException(
          'Offer must be accepted before moving candidate to Hired',
        );
      }

      const job = offer.jobOpening || candidate.jobOpening;
      const mapping = this.mapCandidateOfferToEmployee(
        candidate,
        offer,
        job,
        dto,
      );
      const preflight = this.buildPreflight(mapping);

      if (preflight.missing.length > 0) {
        throw new UnprocessableEntityException({
          error: 'PRE_FLIGHT_REQUIRED_FIELDS_MISSING',
          message: 'Please update missing required fields before hiring',
          preflight,
        });
      }

      const existingEmployee = await tx.employee.findFirst({
        where: {
          companyId: candidate.companyId,
          OR: [
            { email: { equals: mapping.personalEmail, mode: 'insensitive' } },
            {
              personalEmail: {
                equals: mapping.personalEmail,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: { id: true },
      });

      if (existingEmployee && !ignoreDuplicate) {
        throw new ConflictException({
          error: 'CONFLICT',
          message: 'Employee with this email exists — merge or create new?',
          existingEmployeeId: existingEmployee.id,
        });
      }

      const workEmail =
        existingEmployee && ignoreDuplicate
          ? this.buildPendingWorkEmail(mapping.personalEmail, candidate.id)
          : mapping.personalEmail;

      const employee = await tx.employee.create({
        data: {
          companyId: candidate.companyId,
          firstName: mapping.firstName,
          lastName: mapping.lastName,
          email: workEmail,
          personalEmail: mapping.personalEmail,
          phone: mapping.personalPhone || undefined,
          personalPhone: mapping.personalPhone || undefined,
          hireDate: mapping.startDate || new Date(),
          startDate: mapping.startDate || undefined,
          jobTitle: mapping.jobTitle || undefined,
          reportingManagerId: mapping.managerId || undefined,
          managerId: mapping.managerId || undefined,
          departmentId: mapping.departmentId || undefined,
          locationId: mapping.locationId || undefined,
          status: EmployeeStatus.PRE_BOARDING,
          employmentType: mapping.employmentType,
          payType: PayType.SALARY,
          payRate: mapping.annualSalary || 0,
          annualSalary: mapping.annualSalary || undefined,
          compensationHistory: mapping.annualSalary
            ? {
                create: {
                  effectiveDate: mapping.startDate || new Date(),
                  baseSalary: mapping.annualSalary,
                  reason: 'ATS offer accepted',
                },
              }
            : undefined,
        },
      });

      const template = await tx.onboardingTemplate.findFirst({
        where: { companyId: candidate.companyId },
        orderBy: { createdAt: 'asc' },
      });

      const onboardingCase = await tx.onboardingCase.create({
        data: {
          companyId: candidate.companyId,
          employeeId: employee.id,
          candidateId: candidate.id,
          templateId: template?.id,
          startDate: mapping.startDate || undefined,
          status: 'active',
        },
      });

      await tx.candidate.update({
        where: { id: candidate.id },
        data: {
          currentStage: CandidateStage.HIRED,
          employeeId: employee.id,
        },
      });

      return {
        companyId: candidate.companyId,
        companyName: candidate.company.name,
        employee,
        candidate,
        onboardingCase,
        mapping,
        preflight,
      };
    });

    if (previousStage && previousStage !== CandidateStage.HIRED) {
      this.websocketsService.emitAtsCandidateStageChanged(result.companyId, {
        candidateId: result.candidate.id,
        fromStage: previousStage,
        toStage: CandidateStage.HIRED,
      });
    }

    this.websocketsService.emitEmployeeAutoCreatedFromAts(result.companyId, {
      employeeId: result.employee.id,
      candidateId: result.candidate.id,
    });

    await this.sendPreBoardingInvitation(result);

    return {
      success: true,
      employeeId: result.employee.id,
      candidateId: result.candidate.id,
      onboardingCaseId: result.onboardingCase.id,
      event: 'employee.auto_created_from_ats',
      preflight: result.preflight,
      toast: `Employee created and pre-boarding invitation sent to ${result.mapping.personalEmail}`,
      message: `Employee created and pre-boarding invitation sent to ${result.mapping.personalEmail}`,
    };
  }

  private mapCandidateOfferToEmployee(
    candidate: any,
    offer: any,
    job: any,
    dto: AutoCreateEmployeeFromAtsDto,
  ): CanonicalAtsEmployeeMapping {
    const overrides = dto.overrides || {};
    const startDate = overrides.startDate
      ? new Date(overrides.startDate)
      : offer.startDate;

    return {
      firstName: this.clean(overrides.firstName) || candidate.firstName,
      lastName: this.clean(overrides.lastName) || candidate.lastName,
      personalEmail: this.clean(overrides.email) || candidate.email,
      personalPhone: this.clean(overrides.phone) || candidate.phone,
      annualSalary: offer.salary,
      startDate,
      jobTitle: offer.title || offer.position || job?.title,
      departmentId: offer.departmentId || job?.position?.departmentId || null,
      locationId: offer.locationId || null,
      employmentType: this.normalizeEmploymentType(
        offer.employmentType || job?.position?.employmentType,
      ),
      managerId: job?.managerId || null,
    };
  }

  private buildPreflight(mapping: CanonicalAtsEmployeeMapping) {
    const missing: string[] = [];
    const warnings: string[] = [];

    if (!mapping.firstName || !mapping.lastName) {
      missing.push('name');
    }

    if (!mapping.personalEmail) {
      missing.push('email');
    }

    if (!mapping.personalPhone) {
      warnings.push('phone_missing');
    }

    if (!mapping.startDate) {
      warnings.push('start_date_not_confirmed');
    }

    return {
      required: ['name', 'email'],
      missing,
      warnings,
    };
  }

  private async sendPreBoardingInvitation(result: {
    companyName: string;
    mapping: CanonicalAtsEmployeeMapping;
    onboardingCase: { id: string };
  }) {
    try {
      await this.emailQueue.add('pre-boarding-invitation', {
        to: result.mapping.personalEmail,
        templateId: PRE_BOARDING_INVITATION_TEMPLATE_ID,
        templateSlug: 'pre-boarding-invitation',
        variables: {
          company_name: result.companyName,
          start_date:
            result.mapping.startDate?.toISOString().split('T')[0] || 'TBD',
          checklist_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/welcome/${result.onboardingCase.id}`,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to queue pre-boarding invitation: ${message}`);
    }
  }

  private normalizeCandidateStage(stage: string): CandidateStage {
    const upper = stage.toUpperCase();

    if (upper === 'HIRED') return CandidateStage.HIRED;
    if (upper === 'SCREENING') return CandidateStage.SCREENING;
    if (upper === 'INTERVIEW') return CandidateStage.INTERVIEW;
    if (upper === 'OFFER') return CandidateStage.OFFER;
    if (upper === 'REJECTED') return CandidateStage.REJECTED;
    if (upper === 'WITHDRAWN') return CandidateStage.WITHDRAWN;
    return CandidateStage.NEW;
  }

  private normalizeEmploymentType(value?: string | null): EmploymentType {
    const normalized = value?.replace(/[-\s]/g, '_').toUpperCase();

    if (normalized === 'PART_TIME') return EmploymentType.PART_TIME;
    if (normalized === 'CONTRACT' || normalized === 'CONTRACTOR') {
      return EmploymentType.CONTRACT;
    }
    if (normalized === 'TEMPORARY') return EmploymentType.TEMPORARY;
    return EmploymentType.FULL_TIME;
  }

  private clean(value?: string | null) {
    return value?.trim() || undefined;
  }

  private buildPendingWorkEmail(personalEmail: string, candidateId: string) {
    const [localPart, domain] = personalEmail.split('@');

    if (!domain) {
      return `candidate-${candidateId}-${Date.now()}@preboarding.local`;
    }

    return `${localPart}+candidate-${candidateId}-${Date.now()}@${domain}`;
  }
}
