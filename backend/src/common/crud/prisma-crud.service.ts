import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

type QueryValue = string | string[] | undefined;

export interface CrudListOptions {
  companyScoped?: boolean;
  defaultLimit?: number;
  maxLimit?: number;
  filterMap?: Record<string, string>;
  searchFields?: string[];
  include?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
}

export interface CrudWriteOptions {
  include?: Record<string, any>;
  defaults?: Record<string, any>;
}

@Injectable()
export class PrismaCrudService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    delegateName: string,
    query: Record<string, QueryValue> = {},
    options: CrudListOptions = {},
  ) {
    const delegate = this.delegate(delegateName);
    const take = this.resolveLimit(query.limit, options);
    const page = this.resolvePage(query.page);
    const where = this.buildWhere(query, options);
    const orderBy = options.orderBy || { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      delegate.findMany({
        where,
        take,
        skip: (page - 1) * take,
        orderBy,
        ...(options.include ? { include: options.include } : {}),
      }),
      delegate.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async get(delegateName: string, id: string, options: CrudWriteOptions = {}) {
    const record = await this.delegate(delegateName).findUnique({
      where: { id },
      ...(options.include ? { include: options.include } : {}),
    });

    if (!record) {
      throw new NotFoundException(`${delegateName} not found`);
    }

    return record;
  }

  async create(
    delegateName: string,
    data: Record<string, any>,
    options: CrudWriteOptions = {},
  ) {
    return this.delegate(delegateName).create({
      data: this.normalizeData({ ...(options.defaults || {}), ...data }),
      ...(options.include ? { include: options.include } : {}),
    });
  }

  async update(
    delegateName: string,
    id: string,
    data: Record<string, any>,
    options: CrudWriteOptions = {},
  ) {
    await this.ensureExists(delegateName, id);
    return this.delegate(delegateName).update({
      where: { id },
      data: this.normalizeData(data),
      ...(options.include ? { include: options.include } : {}),
    });
  }

  async remove(delegateName: string, id: string) {
    await this.ensureExists(delegateName, id);
    return this.delegate(delegateName).delete({ where: { id } });
  }

  async softUpdate(
    delegateName: string,
    id: string,
    data: Record<string, any>,
  ) {
    return this.update(delegateName, id, data);
  }

  async createMany(delegateName: string, rows: Record<string, any>[]) {
    const delegate = this.delegate(delegateName);
    return delegate.createMany({
      data: rows.map((row) => this.normalizeData(row)),
      skipDuplicates: true,
    });
  }

  get prismaClient() {
    return this.prisma;
  }

  normalizeData(data: Record<string, any>) {
    return Object.entries(data || {}).reduce(
      (next, [key, value]) => {
        if (value === undefined || value === '') return next;
        if (Array.isArray(value)) {
          next[key] = value;
          return next;
        }
        if (value && typeof value === 'object') {
          next[key] = value;
          return next;
        }
        if (typeof value === 'string' && this.looksLikeDateField(key)) {
          next[key] = new Date(value);
          return next;
        }
        next[key] = value;
        return next;
      },
      {} as Record<string, any>,
    );
  }

  private async ensureExists(delegateName: string, id: string) {
    const exists = await this.delegate(delegateName).findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`${delegateName} not found`);
    }
  }

  private delegate(delegateName: string) {
    const delegate = (this.prisma as any)[delegateName];
    if (!delegate) {
      throw new BadRequestException(`Unsupported resource: ${delegateName}`);
    }
    return delegate;
  }

  private buildWhere(
    query: Record<string, QueryValue>,
    options: CrudListOptions,
  ) {
    const where: Record<string, any> = { ...(options.where || {}) };
    const filterMap = options.filterMap || {};

    if (options.companyScoped && query.companyId) {
      where.companyId = this.single(query.companyId);
    }

    for (const [queryKey, modelField] of Object.entries(filterMap)) {
      const value = query[queryKey];
      if (value === undefined || value === '') continue;
      where[modelField] = this.coerceFilterValue(value);
    }

    const search = this.single(query.search || query.q);
    if (search && options.searchFields?.length) {
      where.OR = options.searchFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    return where;
  }

  private coerceFilterValue(value: QueryValue) {
    const single = this.single(value);
    if (single === 'true') return true;
    if (single === 'false') return false;
    return single;
  }

  private resolveLimit(raw: QueryValue, options: CrudListOptions) {
    const max = options.maxLimit || 100;
    const parsed = Number(this.single(raw) || options.defaultLimit || 25);
    if (!Number.isFinite(parsed) || parsed < 1)
      return options.defaultLimit || 25;
    return Math.min(parsed, max);
  }

  private resolvePage(raw: QueryValue) {
    const parsed = Number(this.single(raw) || 1);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.floor(parsed);
  }

  private single(value: QueryValue) {
    if (Array.isArray(value)) return value[0];
    return value;
  }

  private looksLikeDateField(key: string) {
    return (
      key.endsWith('At') ||
      key.endsWith('Date') ||
      [
        'weekStart',
        'weekEnd',
        'periodStart',
        'periodEnd',
        'payDate',
        'scheduledAt',
      ].includes(key)
    );
  }
}
