import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        coursesCreated: true,
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        coursesCreated: true,
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  async update(id: string, updateUserDto: {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    role?: Role;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if user has active enrollments
    const activeEnrollments = await this.prisma.enrollment.findMany({
      where: {
        userId: id,
        status: 'ACTIVE',
      },
    });

    if (activeEnrollments.length > 0) {
      throw new BadRequestException('Cannot delete user with active enrollments');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getUserEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
        payment: true,
        certificate: true,
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });
  }

  async getUserCoursesCreated(userId: string) {
    return this.prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        lessons: true,
        enrollments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserProgress(userId: string, courseId?: string) {
    const whereClause: any = { userId };
    if (courseId) {
      whereClause.courseId = courseId;
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        lessonProgress: {
          include: {
            lesson: true,
          },
        },
      },
    });

    return enrollments.map(enrollment => {
      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = enrollment.lessonProgress.filter(
        progress => progress.completed
      ).length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...enrollment,
        progressPercentage,
        completedLessons,
        totalLessons,
      };
    });
  }

  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          {
            firstName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 10,
    });
  }
}
