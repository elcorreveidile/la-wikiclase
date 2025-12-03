import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CourseStatus } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: {
    title: string;
    description: string;
    shortDescription?: string;
    price: number;
    instructorId: string;
    imageUrl?: string;
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  }) {
    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        status: CourseStatus.DRAFT,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        lessons: true,
        enrollments: true,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: {
      status?: CourseStatus;
      instructorId?: string;
    };
    orderBy?: {
      [key: string]: 'asc' | 'desc';
    };
  }) {
    const { skip = 0, take = 10, where, orderBy = { createdAt: 'desc' } } = params || {};

    return this.prisma.course.findMany({
      skip,
      take,
      where,
      orderBy,
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
            enrollments: true,
            lessons: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
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
          orderBy: { order: 'asc' },
        },
        resources: true,
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
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
          orderBy: { order: 'asc' },
        },
        resources: true,
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with slug '${slug}' not found`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: {
    title?: string;
    description?: string;
    shortDescription?: string;
    price?: number;
    imageUrl?: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    status?: CourseStatus;
    publishedAt?: Date;
  }) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        lessons: true,
        enrollments: true,
      },
    });
  }

  async remove(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (course.enrollments.length > 0) {
      throw new BadRequestException('Cannot delete course with active enrollments');
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }

  async searchCourses(query: string) {
    return this.prisma.course.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            shortDescription: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            keywords: {
              has: query,
            },
          },
        ],
        status: CourseStatus.PUBLISHED,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
      take: 20,
    });
  }

  async getPopularCourses(limit = 10) {
    return this.prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        enrollments: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  async getCoursesByInstructor(instructorId: string) {
    return this.prisma.course.findMany({
      where: {
        instructorId,
      },
      include: {
        lessons: true,
        enrollments: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCourseStats(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          select: {
            status: true,
            completedAt: true,
          },
        },
        lessons: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const totalEnrollments = course.enrollments.length;
    const activeEnrollments = course.enrollments.filter(e => e.status === 'ACTIVE').length;
    const completedEnrollments = course.enrollments.filter(e => e.status === 'COMPLETED').length;
    const totalLessons = course.lessons.length;

    return {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      totalLessons,
      completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
    };
  }

  async createLesson(courseId: string, lessonData: {
    title: string;
    content: string;
    videoUrl?: string;
    duration?: number;
    order: number;
    isPreview?: boolean;
  }) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return this.prisma.lesson.create({
      data: {
        ...lessonData,
        courseId,
      },
    });
  }

  async updateLesson(lessonId: string, updateData: {
    title?: string;
    content?: string;
    videoUrl?: string;
    duration?: number;
    order?: number;
    isPreview?: boolean;
  }) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });
  }

  async deleteLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return this.prisma.lesson.delete({
      where: { id: lessonId },
    });
  }

  async addCourseResource(courseId: string, resourceData: {
    name: string;
    type: string;
    url: string;
    size?: number;
  }) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return this.prisma.courseResource.create({
      data: {
        ...resourceData,
        courseId,
      },
    });
  }
}
