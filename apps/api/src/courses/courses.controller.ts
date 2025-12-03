import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseStatus } from '@prisma/client';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: CourseStatus,
    @Query('instructorId') instructorId?: string
  ) {
    const params = {
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where: {
        ...(status && { status }),
        ...(instructorId && { instructorId }),
      },
    };

    return this.coursesService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Get('popular')
  getPopularCourses(@Query('limit') limit?: string) {
    return this.coursesService.getPopularCourses(limit ? parseInt(limit) : 10);
  }

  @Get('instructor/:instructorId')
  getCoursesByInstructor(@Param('instructorId') instructorId: string) {
    return this.coursesService.getCoursesByInstructor(instructorId);
  }

  @Get(':id/stats')
  getCourseStats(@Param('id') id: string) {
    return this.coursesService.getCourseStats(id);
  }

  @Get('search')
  searchCourses(@Query('q') query: string) {
    return this.coursesService.searchCourses(query);
  }

  @Post()
  create(@Body() createCourseDto: {
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
    return this.coursesService.create(createCourseDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: {
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
    }
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/lessons')
  createLesson(
    @Param('id') courseId: string,
    @Body() lessonData: {
      title: string;
      content: string;
      videoUrl?: string;
      duration?: number;
      order: number;
      isPreview?: boolean;
    }
  ) {
    return this.coursesService.createLesson(courseId, lessonData);
  }

  @Put('lessons/:lessonId')
  updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() updateData: {
      title?: string;
      content?: string;
      videoUrl?: string;
      duration?: number;
      order?: number;
      isPreview?: boolean;
    }
  ) {
    return this.coursesService.updateLesson(lessonId, updateData);
  }

  @Delete('lessons/:lessonId')
  deleteLesson(@Param('lessonId') lessonId: string) {
    return this.coursesService.deleteLesson(lessonId);
  }

  @Post(':id/resources')
  addCourseResource(
    @Param('id') courseId: string,
    @Body() resourceData: {
      name: string;
      type: string;
      url: string;
      size?: number;
    }
  ) {
    return this.coursesService.addCourseResource(courseId, resourceData);
  }
}
