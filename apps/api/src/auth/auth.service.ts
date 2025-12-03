import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(clerkId: string, email: string, userData?: {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          clerkId,
          email,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          imageUrl: userData?.imageUrl,
        },
      });
    } else {
      // Update user data if provided
      if (userData) {
        user = await this.prisma.user.update({
          where: { clerkId },
          data: {
            ...(userData.firstName && { firstName: userData.firstName }),
            ...(userData.lastName && { lastName: userData.lastName }),
            ...(userData.imageUrl && { imageUrl: userData.imageUrl }),
          },
        });
      }
    }

    return user;
  }

  async getUserByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { clerkId },
      include: {
        coursesCreated: true,
        enrollments: {
          include: {
            course: true,
            payment: true,
            certificate: true,
          },
        },
      },
    });
  }

  async updateUserRole(clerkId: string, role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT') {
    return this.prisma.user.update({
      where: { clerkId },
      data: { role },
    });
  }

  async deleteUser(clerkId: string) {
    return this.prisma.user.delete({
      where: { clerkId },
    });
  }
}
