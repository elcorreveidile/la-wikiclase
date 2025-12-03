import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { EnrollmentStatus } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEnrollmentDto: {
    userId: string;
    courseId: string;
  }) {
    // Check if user is already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: createEnrollmentDto.userId,
          courseId: createEnrollmentDto.courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('User is already enrolled in this course');
    }

    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createEnrollmentDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${createEnrollmentDto.courseId} not found`);
    }

    return this.prisma.enrollment.create({
      data: {
        ...createEnrollmentDto,
        status: EnrollmentStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            lessons: {
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
          },
        },
        payment: true,
        certificate: true,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: {
      userId?: string;
      courseId?: string;
      status?: EnrollmentStatus;
    };
    orderBy?: {
      [key: string]: 'asc' | 'desc';
    };
  }) {
    const { skip = 0, take = 10, where, orderBy = { enrolledAt: 'desc' } } = params || {};

    return this.prisma.enrollment.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        payment: true,
        certificate: true,
      },
    });
  }

  async findOne(id: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                resources: true,
              },
            },
          },
        },
        payment: true,
        certificate: true,
        lessonProgress: {
          include: {
            lesson: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: {
    status?: EnrollmentStatus;
    progress?: number;
    completedAt?: Date;
  }) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return this.prisma.enrollment.update({
      where: { id },
      data: updateEnrollmentDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            lessons: true,
          },
        },
        payment: true,
        certificate: true,
      },
    });
  }

  async remove(id: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return this.prisma.enrollment.delete({
      where: { id },
    });
  }

  async getUserEnrollments(userId: string, status?: EnrollmentStatus) {
    const whereClause: any = { userId };
    if (status) {
      whereClause.status = status;
    }

    return this.prisma.enrollment.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
            lessons: {
              select: {
                id: true,
                title: true,
                duration: true,
                order: true,
              },
            },
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
        lessonProgress: {
          include: {
            lesson: true,
          },
        },
        certificate: true,
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });
  }

  async getCourseEnrollments(courseId: string, status?: EnrollmentStatus) {
    const whereClause: any = { courseId };
    if (status) {
      whereClause.status = status;
    }

    return this.prisma.enrollment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        payment: true,
        certificate: true,
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });
  }

  async updateProgress(enrollmentId: string, progress: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);
    }

    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = Math.round((progress / 100) * totalLessons);

    // Check if all lessons are completed
    const allLessonsCompleted = progress >= 100;

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        ...(allLessonsCompleted && {
          status: EnrollmentStatus.COMPLETED,
          completedAt: new Date(),
        }),
      },
    });
  }

  async completeLesson(enrollmentId: string, lessonId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        lessonProgress: {
          where: { lessonId },
        },
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);
    }

    // Create or update lesson progress
    const lessonProgress = await this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        enrollmentId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    // Calculate overall progress
    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = await this.prisma.lessonProgress.count({
      where: {
        enrollmentId,
        completed: true,
      },
    });

    const progress = Math.round((completedLessons / totalLessons) * 100);
    const allLessonsCompleted = completedLessons === totalLessons;

    // Update enrollment progress
    const updatedEnrollment = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        ...(allLessonsCompleted && {
          status: EnrollmentStatus.COMPLETED,
          completedAt: new Date(),
        }),
      },
    });

    return {
      lessonProgress,
      enrollment: updatedEnrollment,
    };
  }

  async getEnrollmentStats(courseId?: string, userId?: string) {
    const whereClause: any = {};
    if (courseId) whereClause.courseId = courseId;
    if (userId) whereClause.userId = userId;

    const enrollments = await this.prisma.enrollment.findMany({
      where: whereClause,
    });

    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.ACTIVE).length;
    const completedEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.COMPLETED).length;
    const pendingEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.PENDING).length;
    const cancelledEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.CANCELLED).length;

    const averageProgress = totalEnrollments > 0 
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments 
      : 0;

    return {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      pendingEnrollments,
      cancelledEnrollments,
      averageProgress: Math.round(averageProgress),
      completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
    };
  }
}
