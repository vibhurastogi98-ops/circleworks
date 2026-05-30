import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import axios from 'axios';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';

@Controller('search')
@UseGuards(AuthGuard('jwt'))
export class SearchController {
  constructor(
    private readonly crud: PrismaCrudService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async search(@Query('q') q: string, @Query('companyId') companyId?: string) {
    if (!q?.trim()) {
      throw new BadRequestException('q is required');
    }

    const elasticResults = await this.searchElasticsearch(q, companyId);
    if (elasticResults) {
      return elasticResults;
    }

    const [indexed, employees, candidates, jobs] = await Promise.all([
      this.crud.prismaClient.searchIndex.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 20,
        orderBy: { updatedAt: 'desc' },
      }),
      this.crud.prismaClient.employee.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { jobTitle: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.crud.prismaClient.candidate.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.crud.prismaClient.jobOpening.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { department: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    return {
      source: 'postgres',
      query: q,
      data: [
        ...indexed,
        ...employees.map((employee) => this.toSearchHit('employee', employee)),
        ...candidates.map((candidate) =>
          this.toSearchHit('candidate', candidate),
        ),
        ...jobs.map((job) => this.toSearchHit('job', job)),
      ],
    };
  }

  private async searchElasticsearch(q: string, companyId?: string) {
    const rawHost =
      this.config.get<string>('ELASTICSEARCH_URL') ||
      this.config.get<string>('ELASTICSEARCH_HOST');
    if (!rawHost) return null;

    const baseUrl = rawHost.startsWith('http') ? rawHost : `http://${rawHost}`;
    try {
      const response = await axios.post(
        `${baseUrl}/circleworks/_search`,
        {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query: q,
                    fields: ['title^2', 'content', 'entityType'],
                  },
                },
              ],
              filter: companyId ? [{ term: { companyId } }] : [],
            },
          },
          size: 25,
        },
        {
          auth: this.config.get<string>('ELASTICSEARCH_USERNAME')
            ? {
                username: this.config.get<string>('ELASTICSEARCH_USERNAME'),
                password:
                  this.config.get<string>('ELASTICSEARCH_PASSWORD') || '',
              }
            : undefined,
          timeout: 1500,
        },
      );

      return {
        source: 'elasticsearch',
        query: q,
        data:
          response.data?.hits?.hits?.map((hit) => ({
            score: hit._score,
            ...hit._source,
          })) || [],
      };
    } catch {
      return null;
    }
  }

  private toSearchHit(entityType: string, entity: any) {
    return {
      entityType,
      entityId: entity.id,
      companyId: entity.companyId,
      title:
        entity.title ||
        [entity.firstName, entity.lastName].filter(Boolean).join(' '),
      content: entity.email || entity.description || entity.jobTitle,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt || entity.createdAt,
    };
  }
}
