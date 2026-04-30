import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async getCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          include: { user: true },
        },
        employees: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async createCompany(data: any, userId: string) {
    const company = await this.prisma.company.create({
      data: {
        ...data,
        users: {
          create: {
            userId,
            role: 'admin',
            isActive: true,
          },
        },
      },
      include: {
        users: true,
      },
    });

    return company;
  }

  async updateCompany(companyId: string, data: any) {
    return this.prisma.company.update({
      where: { id: companyId },
      data,
    });
  }

  async listCompanyUsers(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company.users;
  }

  async inviteUser(companyId: string, email: string, role: string = 'employee') {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create placeholder
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          isEmailVerified: false,
        },
      });
    }

    // Add user to company
    const userCompany = await this.prisma.userCompany.create({
      data: {
        userId: user.id,
        companyId,
        role,
      },
    });

    // Send invitation email (mock)
    // await this.emailService.sendInvitation(email, company.name);

    return userCompany;
  }

  async switchCompany(userId: string, companyId: string) {
    const userCompany = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    if (!userCompany) {
      throw new BadRequestException('User does not have access to this company');
    }

    return {
      message: 'Switched to company',
      companyId,
    };
  }
}
