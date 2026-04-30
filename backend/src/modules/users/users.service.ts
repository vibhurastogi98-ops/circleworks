import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isEmailVerified: true,
        hasCompletedTour: true,
        mfaEnabled: true,
        createdAt: true,
        companies: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
  }

  async updateTourStatus(userId: string, hasCompletedTour: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { hasCompletedTour },
    });
  }

  async getUserPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      hasCompletedTour: user.hasCompletedTour,
      mfaEnabled: user.mfaEnabled,
    };
  }

  async deleteUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }
}
