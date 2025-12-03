'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Play, 
  BookOpen, 
  CheckCircle, 
  User,
  Calendar,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  imageUrl?: string;
  price: number;
  currency: string;
  slug: string;
  instructor: {
    id: string;
    firstName: string;
    lastName?: string;
    imageUrl?: string;
  };
  lessons: Lesson[];
  _count: {
    enrollments: number;
    lessons: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isPreview: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-12">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-700 mb-2">
            Curso no encontrado
          </h1>
          <p className="text-gray-500 mb-6">
            El curso que buscas no existe o no está disponible.
          </p>
          <Link href="/cursos">
            <Button>Volver a cursos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        {course.imageUrl && (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-96 object-cover"
          />
        )}
        {!course.imageUrl && (
          <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 text-white p-8">
          <div className="container mx-auto">
            <Link href="/cursos" className="inline-flex items-center gap-2 mb-4 hover:text-blue-200 transition">
              <ArrowLeft className="w-5 h-5" />
              Volver a cursos
            </Link>
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-xl opacity-90">{course.shortDescription || course.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-8">
              <div className="border-b">
                <div className="flex">
                  {[
                    { id: 'overview', label: 'Descripción' },
                    { id: 'lessons', label: 'Lecciones' },
                    { id: 'instructor', label: 'Instructor' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`px-6 py-4 font-medium transition-colors ${
                        selectedTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {selectedTab === 'overview' && (
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                )}

                {selectedTab === 'lessons' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">
                      Contenido del curso ({course.lessons.length} lecciones)
                    </h3>
                    {course.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {lesson.videoUrl ? (
                            <Play className="w-8 h-8 text-blue-600" />
                          ) : (
                            <BookOpen className="w-8 h-8 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{lesson.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            {lesson.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {lesson.duration} min
                              </div>
                            )}
                            {lesson.isPreview && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                Vista previa
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTab === 'instructor' && (
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      {course.instructor.imageUrl ? (
                        <img
                          src={course.instructor.imageUrl}
                          alt={course.instructor.firstName}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {course.instructor.firstName} {course.instructor.lastName || ''}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Experto en enseñanza de español como lengua extranjera y literatura hispánica. 
                        Con más de 10 años de experiencia en educación online.
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course._count.enrollments} estudiantes
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Desde 2024
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="text-3xl font-bold text-gray-900 mb-4">
                {course.currency === 'EUR' ? '€' : course.currency}{course.price}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Acceso de por vida
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {course._count.lessons} lecciones
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Certificado de finalización
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Acceso desde cualquier dispositivo
                </div>
              </div>

              <Button className="w-full mb-4 bg-blue-600 hover:bg-blue-700">
                Inscribirse ahora
              </Button>
              
              <div className="text-center text-sm text-gray-500">
                <p>
                  ¿Tienes dudas?{' '}
                  <Link href="/contacto" className="text-blue-600 hover:underline">
                    Contacta con nosotros
                  </Link>
                </p>
              </div>
            </div>

            {/* Course Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Información del curso</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    Duración
                  </div>
                  <span className="font-medium">
                    {course.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)} minutos
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    Lecciones
                  </div>
                  <span className="font-medium">{course._count.lessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    Estudiantes
                  </div>
                  <span className="font-medium">{course._count.enrollments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4" />
                    Certificado
                  </div>
                  <span className="font-medium">Sí</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
