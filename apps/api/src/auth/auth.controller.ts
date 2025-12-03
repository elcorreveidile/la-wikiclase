import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';

interface ClerkWebhookPayload {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    created_at: number;
  };
  type: 'user.created' | 'user.updated' | 'user.deleted';
  object: 'event';
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('webhook')
  async handleClerkWebhook(@Body() payload: ClerkWebhookPayload) {
    try {
      const { data, type } = payload;

      switch (type) {
        case 'user.created':
          const email = data.email_addresses[0]?.email_address;
          if (!email) {
            throw new Error('Email not found in webhook payload');
          }

          await this.authService.findOrCreateUser(data.id, email, {
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          });
          break;

        case 'user.updated':
          const updatedEmail = data.email_addresses[0]?.email_address;
          if (!updatedEmail) {
            throw new Error('Email not found in webhook payload');
          }

          await this.authService.findOrCreateUser(data.id, updatedEmail, {
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          });
          break;

        case 'user.deleted':
          await this.authService.deleteUser(data.id);
          break;

        default:
          console.log(`Unhandled event type: ${type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Error handling Clerk webhook:', error);
      throw error;
    }
  }

  @Get('user/:clerkId')
  async getUser(@Param('clerkId') clerkId: string) {
    return this.authService.getUserByClerkId(clerkId);
  }

  @Post('user/:clerkId/role')
  async updateUserRole(
    @Param('clerkId') clerkId: string,
    @Body('role') role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  ) {
    return this.authService.updateUserRole(clerkId, role);
  }
}
