import { Controller, Get, Post, Body, Param, Delete, Put, Query, Headers, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  createCheckoutSession(@Body() createPaymentDto: {
    courseId: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    return this.paymentsService.createCheckoutSession(createPaymentDto);
  }

  @Post('webhook')
  async handleWebhook(
    @Body() event: Stripe.Event,
    @Headers('stripe-signature') signature: string
  ) {
    if (!signature) {
      throw new BadRequestException('Stripe signature is required');
    }

    // Verify the webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    try {
      // In a real implementation, you would verify the signature here
      // const stripeEvent = this.paymentsService['stripe'].webhooks.constructEvent(
      //   JSON.stringify(event),
      //   signature,
      //   webhookSecret
      // );
      
      return this.paymentsService.handleWebhook(event);
    } catch (error) {
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('session/:sessionId')
  findBySessionId(@Param('sessionId') sessionId: string) {
    return this.paymentsService.findBySessionId(sessionId);
  }

  @Get('user/:userId')
  getUserPayments(@Param('userId') userId: string) {
    return this.paymentsService.getUserPayments(userId);
  }

  @Get('course/:courseId')
  getCoursePayments(@Param('courseId') courseId: string) {
    return this.paymentsService.getCoursePayments(courseId);
  }

  @Get('stats')
  getPaymentStats(
    @Query('courseId') courseId?: string,
    @Query('userId') userId?: string
  ) {
    return this.paymentsService.getPaymentStats(courseId, userId);
  }

  @Post(':id/refund')
  async refundPayment(
    @Param('id') paymentId: string,
    @Body() refundData?: {
      amount?: number;
      reason?: string;
    }
  ) {
    return this.paymentsService.refundPayment(paymentId, refundData);
  }
}
