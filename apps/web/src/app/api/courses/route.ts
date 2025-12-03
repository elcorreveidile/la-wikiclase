import { NextRequest, NextResponse } from 'next/server'

// Mock courses data for when the backend is not available
const mockCourses = [
  {
    id: '1',
    title: 'Curso Intensivo de Español',
    description: 'Curso intensivo de español de un mes con metodología innovadora. Aprende español de manera rápida y efectiva con nuestras clases dinámicas y prácticas.',
    shortDescription: 'Curso intensivo de español con metodología innovadora',
    price: 99,
    currency: 'EUR',
    slug: 'curso-intensivo-espanol',
    instructor: {
      firstName: 'Javier',
      lastName: 'Benítez'
    },
    _count: {
      enrollments: 45,
      lessons: 12
    }
  },
  {
    id: '2',
    title: 'Producción e Interacción Oral',
    description: 'Curso de tres meses especializado en producción e interacción oral. Mejora tu fluidez y confianza al hablar español.',
    shortDescription: 'Especializado en producción e interacción oral',
    price: 149,
    currency: 'EUR',
    slug: 'produccion-interaccion-oral',
    instructor: {
      firstName: 'Javier',
      lastName: 'Benítez'
    },
    _count: {
      enrollments: 32,
      lessons: 16
    }
  },
  {
    id: '3',
    title: 'Literatura hasta el XVIII',
    description: 'Curso de tres meses sobre literatura española hasta el siglo XVIII. Explora las obras y autores más importantes de la literatura clásica española.',
    shortDescription: 'Literatura española hasta el siglo XVIII',
    price: 129,
    currency: 'EUR',
    slug: 'literatura-hasta-xviii',
    instructor: {
      firstName: 'Javier',
      lastName: 'Benítez'
    },
    _count: {
      enrollments: 28,
      lessons: 20
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = new URLSearchParams()
    
    // Forward all query parameters
    for (const [key, value] of searchParams.entries()) {
      queryParams.append(key, value)
    }
    
    const apiUrl = 'http://localhost:3001'
    
    try {
      const response = await fetch(`${apiUrl}/courses?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (fetchError) {
      console.log('Backend API not available, using mock data:', fetchError)
    }
    
    // If backend is not available, return mock data
    console.log('Returning mock courses data')
    return NextResponse.json(mockCourses)
    
  } catch (error) {
    console.error('Error fetching courses:', error)
    // Return mock data even in case of errors
    return NextResponse.json(mockCourses)
  }
}
