import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('courses/:courseId')
  async getCourseAnalytics(@Param('courseId') courseId: string) {
    return this.analyticsService.getCourseAnalytics(courseId);
  }

  @Get('users/:userId')
  async getUserAnalytics(@Param('userId') userId: string) {
    return this.analyticsService.getUserAnalytics(userId);
  }

  @Get('courses/popular')
  async getPopularCourses(@Query('limit') limit?: string) {
    return this.analyticsService.getPopularCourses(limit ? parseInt(limit) : 10);
  }

  @Get('revenue')
  async getRevenueStats(@Query('period') period?: '7d' | '30d' | '90d' | '1y') {
    return this.analyticsService.getRevenueStats(period);
  }
}
