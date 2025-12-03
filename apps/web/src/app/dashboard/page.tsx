'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  User, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Enrollment {
  id: string;
  course: {
    id: string;
    title: string;
    imageUrl?: string;
    slug: string;
  };
  progress: number;
  completedAt?: Date;
  createdAt: Date;
}

interface UserStats {
  totalEnrollments: number;
  completedCourses: number;
  totalHours: number;
  certificates: number;
}

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [enrollmentsRes, statsRes] = await Promise.all([
        fetch('/api/enrollments'),
        fetch('/api/analytics/user')
      ]);

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        setEnrollments(enrollmentsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Dashboard</h1>
              <p className="text-gray-600 mt-1">Bienvenido de nuevo a tu área de aprendizaje</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/perfil">
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Mi Perfil
                </Button>
              </Link>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<BookOpen className="w-8 h-8 text-blue-600" />}
              title="Cursos Inscritos"
              value={stats.totalEnrollments}
              color="bg-blue-50"
            />
            <StatCard
              icon={<Award className="w-8 h-8 text-green-600" />}
              title="Cursos Completados"
              value={stats.completedCourses}
              color="bg-green-50"
            />
            <StatCard
              icon={<Clock className="w-8 h-8 text-purple-600" />}
              title="Horas de Estudio"
              value={`${stats.totalHours}h`}
              color="bg-purple-50"
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8 text-orange-600" />}
              title="Certificados"
              value={stats.certificates}
              color="bg-orange-50"
            />
          </div>
        )}

        {/* My Courses */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-900">Mis Cursos</h2>
            <p className="text-gray-600 mt-1">Continúa con tu aprendizaje</p>
          </div>
          
          <div className="p-6">
            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Aún no tienes cursos
                </h3>
                <p className="text-gray-500 mb-6">
                  Explora nuestro catálogo y comienza tu viaje de aprendizaje.
                </p>
                <Link href="/cursos">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Explorar Cursos
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/cursos" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Explorar Más Cursos</h3>
                <p className="text-gray-600 text-sm mt-1">Descubre nuevos contenidos</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
          
          <Link href="/certificados" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Mis Certificados</h3>
                <p className="text-gray-600 text-sm mt-1">Ver tus logros</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
          
          <Link href="/pagos" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Historial de Pagos</h3>
                <p className="text-gray-600 text-sm mt-1">Gestionar suscripciones</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

function CourseCard({ enrollment }: { enrollment: Enrollment }) {
  const progress = enrollment.progress || 0;
  const isCompleted = progress === 100;

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {enrollment.course.imageUrl && (
          <img
            src={enrollment.course.imageUrl}
            alt={enrollment.course.title}
            className="w-full h-48 object-cover"
          />
        )}
        {!enrollment.course.imageUrl && (
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-blue-600" />
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            Completado
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {enrollment.course.title}
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${isCompleted ? 'bg-green-600' : 'bg-blue-600'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <Link href={`/cursos/${enrollment.course.slug}`}>
          <Button className="w-full">
            {isCompleted ? 'Revisar' : 'Continuar'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
