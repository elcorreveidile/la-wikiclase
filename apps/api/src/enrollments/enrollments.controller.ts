import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentStatus } from '@prisma/client';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Body() createEnrollmentDto: {
    userId: string;
    courseId: string;
  }) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
    @Query('status') status?: EnrollmentStatus
  ) {
    const params = {
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where: {
        ...(userId && { userId }),
        ...(courseId && { courseId }),
        ...(status && { status }),
      },
    };

    return this.enrollmentsService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Get('user/:userId')
  getUserEnrollments(
    @Param('userId') userId: string,
    @Query('status') status?: EnrollmentStatus
  ) {
    return this.enrollmentsService.getUserEnrollments(userId, status);
  }

  @Get('course/:courseId')
  getCourseEnrollments(
    @Param('courseId') courseId: string,
    @Query('status') status?: EnrollmentStatus
  ) {
    return this.enrollmentsService.getCourseEnrollments(courseId, status);
  }

  @Get('stats')
  getEnrollmentStats(
    @Query('courseId') courseId?: string,
    @Query('userId') userId?: string
  ) {
    return this.enrollmentsService.getEnrollmentStats(courseId, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: {
      status?: EnrollmentStatus;
      progress?: number;
      completedAt?: Date;
    }
  ) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Put(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Body() progressData: { progress: number }
  ) {
    return this.enrollmentsService.updateProgress(id, progressData.progress);
  }

  @Post(':id/lessons/:lessonId/complete')
  completeLesson(
    @Param('id') enrollmentId: string,
    @Param('lessonId') lessonId: string
  ) {
    return this.enrollmentsService.completeLesson(enrollmentId, lessonId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}
