import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(createPaymentDto: {
    courseId: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createPaymentDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${createPaymentDto.courseId} not found`);
    }

    // Check if user is already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: createPaymentDto.userId,
          courseId: createPaymentDto.courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('User is already enrolled in this course');
    }

    // Create Stripe checkout session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: course.currency.toLowerCase(),
            product_data: {
              name: course.title,
              description: course.description.substring(0, 500),
              images: course.imageUrl ? [course.imageUrl] : [],
            },
            unit_amount: Math.round(Number(course.price) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: createPaymentDto.successUrl,
      cancel_url: createPaymentDto.cancelUrl,
      client_reference_id: createPaymentDto.userId,
      metadata: {
        courseId: createPaymentDto.courseId,
        userId: createPaymentDto.userId,
      },
    });

    // Create pending enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: createPaymentDto.userId,
        courseId: createPaymentDto.courseId,
        status: 'PENDING' as any,
      },
    });

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        amount: course.price,
        currency: course.currency,
        status: PaymentStatus.PENDING,
        stripeSessionId: session.id,
      },
    });

    return {
      sessionId: session.id,
      paymentUrl: session.url,
      paymentId: payment.id,
    };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      case 'payment_intent.succeeded':
        return this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      case 'payment_intent.payment_failed':
        return this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { received: true };
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        stripeSessionId: session.id,
      },
      include: {
        enrollment: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: session.payment_intent as string,
        paidAt: new Date(),
        receiptUrl: session.receipt_url,
      },
    });

    // Update enrollment status
    await this.prisma.enrollment.update({
      where: { id: payment.enrollmentId },
      data: {
        status: 'ACTIVE' as any,
      },
    });

    return { success: true };
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),
      },
    });

    return { success: true };
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    // Update enrollment status to cancelled
    await this.prisma.enrollment.update({
      where: { id: payment.enrollmentId },
      data: {
        status: 'CANCELLED' as any,
      },
    });

    return { success: true };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findBySessionId(sessionId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripeSessionId: sessionId },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with session ID ${sessionId} not found`);
    }

    return payment;
  }

  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        enrollment: {
          userId,
        },
      },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCoursePayments(courseId: string) {
    return this.prisma.payment.findMany({
      where: {
        enrollment: {
          courseId,
        },
      },
      include: {
        enrollment: {
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async refundPayment(paymentId: string, refundData?: {
    amount?: number;
    reason?: string;
  }) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException('Payment has no associated Stripe payment intent');
    }

    // Create Stripe refund
    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundData?.amount ? Math.round(refundData.amount * 100) : Math.round(Number(payment.amount) * 100),
      reason: refundData?.reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer',
    });

    // Update payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    // Update enrollment status
    await this.prisma.enrollment.update({
      where: { id: payment.enrollmentId },
      data: {
        status: 'CANCELLED' as any,
      },
    });

    return refund;
  }

  async getPaymentStats(courseId?: string, userId?: string) {
    const whereClause: any = {};
    if (courseId) {
      whereClause.enrollment = { courseId };
    }
    if (userId) {
      whereClause.enrollment = { userId };
    }

    const payments = await this.prisma.payment.findMany({
      where: whereClause,
    });

    const totalPayments = payments.length;
    const successfulPayments = payments.filter(p => p.status === PaymentStatus.SUCCEEDED).length;
    const failedPayments = payments.filter(p => p.status === PaymentStatus.FAILED).length;
    const refundedPayments = payments.filter(p => p.status === PaymentStatus.REFUNDED).length;
    const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING).length;

    const totalRevenue = payments
      .filter(p => p.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      refundedPayments,
      pendingPayments,
      totalRevenue,
      successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
    };
  }
}
