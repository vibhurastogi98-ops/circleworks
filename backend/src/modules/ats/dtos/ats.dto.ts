import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AtsEmployeeOverridesDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  startDate?: string;
}

export class AutoCreateEmployeeFromAtsDto {
  @IsOptional()
  @IsString()
  offerId?: string;

  @IsOptional()
  @IsBoolean()
  ignoreDuplicate?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AtsEmployeeOverridesDto)
  overrides?: AtsEmployeeOverridesDto;
}

export class UpdateCandidateStageDto extends AutoCreateEmployeeFromAtsDto {
  @IsString()
  @IsIn([
    'NEW',
    'SCREENING',
    'INTERVIEW',
    'OFFER',
    'HIRED',
    'REJECTED',
    'WITHDRAWN',
    'New',
    'Screening',
    'Interview',
    'Offer',
    'Hired',
    'Rejected',
    'Withdrawn',
  ])
  stage: string;
}
