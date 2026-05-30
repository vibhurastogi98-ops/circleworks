import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';

@Controller('expenses')
@UseGuards(AuthGuard('jwt'))
export class ExpensesController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get()
  async list(@Query() query: Record<string, any>) {
    return this.crud.list('expense', query, {
      companyScoped: true,
      filterMap: {
        employeeId: 'employeeId',
        status: 'status',
        category: 'category',
      },
      searchFields: ['category', 'description'],
      include: { employee: true },
    });
  }

  @Post()
  async create(@Body() body: any) {
    const submittedAt =
      body.status === 'submitted' && !body.submittedAt
        ? new Date()
        : body.submittedAt;
    return this.crud.create('expense', { ...body, submittedAt });
  }

  @Get('policies')
  async policies() {
    return {
      data: [
        {
          category: 'travel',
          receiptRequiredOver: 25,
          approvalRequiredOver: 250,
        },
        {
          category: 'meals',
          receiptRequiredOver: 25,
          approvalRequiredOver: 150,
        },
        {
          category: 'software',
          receiptRequiredOver: 0,
          approvalRequiredOver: 100,
        },
      ],
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.crud.get('expense', id, { include: { employee: true } });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('expense', id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.crud.remove('expense', id);
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.crud.update('expense', id, {
      status: body.status || 'approved',
      approvedAt: new Date(),
      approvedBy: body.approvedBy || req.user?.id,
    });
  }
}
