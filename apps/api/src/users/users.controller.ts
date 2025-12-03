import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id/enrollments')
  getUserEnrollments(@Param('id') id: string) {
    return this.usersService.getUserEnrollments(id);
  }

  @Get(':id/courses')
  getUserCoursesCreated(@Param('id') id: string) {
    return this.usersService.getUserCoursesCreated(id);
  }

  @Get(':id/progress')
  getUserProgress(
    @Param('id') id: string,
    @Query('courseId') courseId?: string
  ) {
    return this.usersService.getUserProgress(id, courseId);
  }

  @Get('search')
  searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: {
      firstName?: string;
      lastName?: string;
      imageUrl?: string;
      role?: Role;
    }
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
