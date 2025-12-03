import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalPayments,
      totalCertificates,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.prisma.payment.count(),
      this.prisma.certificate.count(),
    ]);

    const [
      activeEnrollments,
      completedEnrollments,
      successfulPayments,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
      this.prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { status: 'SUCCEEDED' } }),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
    ]);

    const revenue = totalRevenue._sum.amount || 0;

    // Get stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newUsersLast30Days,
      newEnrollmentsLast30Days,
      newPaymentsLast30Days,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.enrollment.count({
        where: { enrolledAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.payment.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // Get monthly stats for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await this.getMonthlyStats(currentYear);

    return {
      overview: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalPayments,
        totalCertificates,
        activeEnrollments,
        completedEnrollments,
        successfulPayments,
        totalRevenue: Number(revenue),
        completionRate: totalEnrollments > 0 
          ? (completedEnrollments / totalEnrollments) * 100 
          : 0,
        paymentSuccessRate: totalPayments > 0 
          ? (successfulPayments / totalPayments) * 100 
          : 0,
      },
      recentActivity: {
        newUsersLast30Days,
        newEnrollmentsLast30Days,
        newPaymentsLast30Days,
      },
      monthlyStats,
    };
  }

  private async getMonthlyStats(year: number) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    const stats = await Promise.all(
      months.map(async (month) => {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const [
          usersCount,
          enrollmentsCount,
          paymentsCount,
          paymentsSum,
        ] = await Promise.all([
          this.prisma.user.count({
            where: {
              createdAt: {
                gte: startDate,
                lt: endDate,
              },
            },
          }),
          this.prisma.enrollment.count({
            where: {
              enrolledAt: {
                gte: startDate,
                lt: endDate,
              },
            },
          }),
          this.prisma.payment.count({
            where: {
              createdAt: {
                gte: startDate,
                lt: endDate,
              },
              status: 'SUCCEEDED',
            },
          }),
          this.prisma.payment.aggregate({
            where: {
              createdAt: {
                gte: startDate,
                lt: endDate,
              },
              status: 'SUCCEEDED',
            },
            _sum: { amount: true },
          }),
        ]);

        return {
          month,
          monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
          users: usersCount,
          enrollments: enrollmentsCount,
          payments: paymentsCount,
          revenue: Number(paymentsSum._sum.amount || 0),
        };
      })
    );

    return stats;
  }

  async getCourseAnalytics(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            payment: true,
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

    if (!course) {
      throw new Error('Course not found');
    }

    const totalEnrollments = course.enrollments.length;
    const activeEnrollments = course.enrollments.filter(e => e.status === 'ACTIVE').length;
    const completedEnrollments = course.enrollments.filter(e => e.status === 'COMPLETED').length;
    const totalRevenue = course.enrollments
      .filter(e => e.payment?.status === 'SUCCEEDED')
      .reduce((sum, e) => sum + Number(e.payment?.amount || 0), 0);

    const averageProgress = totalEnrollments > 0
      ? course.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments
      : 0;

    return {
      course: {
        id: course.id,
        title: course.title,
        price: Number(course.price),
        currency: course.currency,
        totalLessons: course._count.lessons,
      },
      enrollmentStats: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        completionRate: totalEnrollments > 0 
          ? (completedEnrollments / totalEnrollments) * 100 
          : 0,
        averageProgress,
      },
      revenue: {
        totalRevenue,
        averageRevenuePerStudent: totalEnrollments > 0 
          ? totalRevenue / totalEnrollments 
          : 0,
      },
      recentEnrollments: course.enrollments
        .sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime())
        .slice(0, 10)
        .map(enrollment => ({
          id: enrollment.id,
          user: {
            id: enrollment.user.id,
            name: `${enrollment.user.firstName} ${enrollment.user.lastName || ''}`,
            email: enrollment.user.email,
          },
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
        })),
    };
  }

  async getUserAnalytics(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
                price: true,
                currency: true,
              },
            },
            payment: true,
          },
        },
        certificates: {
          include: {
            enrollment: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const totalEnrollments = user.enrollments.length;
    const activeEnrollments = user.enrollments.filter(e => e.status === 'ACTIVE').length;
    const completedEnrollments = user.enrollments.filter(e => e.status === 'COMPLETED').length;
    const totalSpent = user.enrollments
      .filter(e => e.payment?.status === 'SUCCEEDED')
      .reduce((sum, e) => sum + Number(e.payment?.amount || 0), 0);

    const averageProgress = totalEnrollments > 0
      ? user.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments
      : 0;

    return {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName || ''}`,
        email: user.email,
        joinedAt: user.createdAt,
      },
      enrollmentStats: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        certificates: user.certificates.length,
        completionRate: totalEnrollments > 0 
          ? (completedEnrollments / totalEnrollments) * 100 
          : 0,
        averageProgress,
      },
      financials: {
        totalSpent,
        averageCoursePrice: totalEnrollments > 0 
          ? totalSpent / totalEnrollments 
          : 0,
      },
      recentActivity: user.enrollments
        .sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime())
        .slice(0, 10)
        .map(enrollment => ({
          id: enrollment.id,
          course: enrollment.course,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
        })),
      certificates: user.certificates.map(cert => ({
        id: cert.id,
        certificateNumber: cert.certificateNumber,
        issuedAt: cert.issuedAt,
        course: cert.enrollment.course,
      })),
    };
  }

  async getPopularCourses(limit: number = 10) {
    const courses = await this.prisma.course.findMany({
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
        enrollments: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            progress: true,
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

    return courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      imageUrl: course.imageUrl,
      price: Number(course.price),
      currency: course.currency,
      totalEnrollments: course._count.enrollments,
      completions: course.enrollments.length,
      averageRating: course.enrollments.length > 0
        ? course.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / course.enrollments.length
        : 0,
    }));
  }

  async getRevenueStats(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const averageOrderValue = payments.length > 0 ? totalRevenue / payments.length : 0;

    // Group by day for chart data
    const dailyRevenue = this.groupPaymentsByDay(payments);

    // Top courses by revenue
    const courseRevenue = this.calculateCourseRevenue(payments);

    return {
      summary: {
        totalRevenue,
        totalPayments: payments.length,
        averageOrderValue,
        period,
      },
      dailyRevenue,
      topCourses: courseRevenue.slice(0, 10),
    };
  }

  private groupPaymentsByDay(payments: any[]) {
    const grouped = payments.reduce((acc, payment) => {
      const date = payment.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Number(payment.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateCourseRevenue(payments: any[]) {
    const courseRevenue = payments.reduce((acc, payment) => {
      const courseId = payment.enrollment.course.id;
      const courseName = payment.enrollment.course.title;
      
      if (!acc[courseId]) {
        acc[courseId] = {
          courseId,
          courseName,
          revenue: 0,
          payments: 0,
        };
      }
      
      acc[courseId].revenue += Number(payment.amount);
      acc[courseId].payments += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(courseRevenue).sort((a: any, b: any) => b.revenue - a.revenue);
  }
}
