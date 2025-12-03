import Link from 'next/link'
import { ExternalLink, Github, Globe, BookOpen, Users, Lightbulb } from 'lucide-react'

  export default function ProyectosPage() {
    const proyectos = [
      {
        id: 1,
        titulo: 'Curso Intensivo de Español',
        descripcion: 'Cursos intensivos de español de un mes con metodología innovadora.',
        enlace: 'https://elcorreveidile.github.io/Curso-Intensivo-Espanol/',
        icono: <BookOpen className="w-8 h-8 text-blue-600" />,
        categoria: 'Educación',
        tecnologias: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages']
      },
      {
        id: 2,
        titulo: 'Producción e Interacción Oral',
        descripcion: 'Curso de tres meses especializado en producción e interacción oral.',
        enlace: 'https://elcorreveidile.github.io/Produccion-Oral/',
        icono: <Users className="w-8 h-8 text-green-600" />,
        categoria: 'Educación',
        tecnologias: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages']
      },
      {
        id: 3,
        titulo: 'Literatura hasta el XVIII',
        descripcion: 'Curso de tres meses sobre literatura española hasta el siglo XVIII.',
        enlace: 'https://elcorreveidile.github.io/Literatura/',
        icono: <BookOpen className="w-8 h-8 text-purple-600" />,
        categoria: 'Literatura',
        tecnologias: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages']
      },
      {
        id: 4,
        titulo: 'UGT CLM Granada',
        descripcion: 'Web oficial de la sección sindical de UGT en CLM Granada.',
        enlace: 'https://ugtclmgranada.org',
        icono: <Users className="w-8 h-8 text-red-600" />,
        categoria: 'Sindicato',
        tecnologias: ['WordPress', 'PHP', 'MySQL']
      },
      {
        id: 5,
        titulo: 'La Wikiclase (Antigua)',
        descripcion: 'Versión anterior de La Wikiclase con recursos educativos.',
        enlace: 'https://lawikiclase.com',
        icono: <BookOpen className="w-8 h-8 text-indigo-600" />,
        categoria: 'Educación',
        tecnologias: ['WordPress', 'PHP', 'MySQL']
      },
      {
        id: 6,
        titulo: 'Clases por Zoom',
        descripcion: 'Plataforma Moodle para clases online de español.',
        enlace: 'https://clasesporzoom.com',
        icono: <Globe className="w-8 h-8 text-yellow-600" />,
        categoria: 'E-learning',
        tecnologias: ['Moodle', 'PHP', 'JavaScript']
      },
      {
        id: 7,
        titulo: 'BlablaELE',
        descripcion: 'Web de empresa especializada en enseñanza de español.',
        enlace: 'https://web.blablaele.com',
        icono: <Globe className="w-8 h-8 text-teal-600" />,
        categoria: 'Empresa',
        tecnologias: ['WordPress', 'PHP', 'MySQL']
      },
      {
        id: 8,
        titulo: 'Clínica Lingüística y Cultural',
        descripcion: 'Proyecto metodológico para clínica lingüística y cultural.',
        enlace: 'https://web.blablaele.com/es/clinica-linguistica-y-cultural',
        icono: <Lightbulb className="w-8 h-8 text-orange-600" />,
        categoria: 'Metodología',
        tecnologias: ['WordPress', 'PHP', 'MySQL']
      },
      {
        id: 9,
        titulo: 'Javier Benítez Láinez (Personal)',
        descripcion: 'Web personal 1 con portafolio y proyectos profesionales.',
        enlace: 'https://jblainez.es',
        icono: <Globe className="w-8 h-8 text-blue-800" />,
        categoria: 'Personal',
        tecnologias: ['WordPress', 'PHP', 'MySQL']
      },
      {
        id: 10,
        titulo: 'Javier Benítez Láinez (Blog)',
        descripcion: 'Web personal 2 con blog y artículos académicos.',
        enlace: 'https://jblainez.wordpress.com',
        icono: <BookOpen className="w-8 h-8 text-pink-600" />,
        categoria: 'Blog',
        tecnologias: ['WordPress', 'PHP', 'MySQL']
      },
      {
        id: 11,
        titulo: 'CEELEEME',
        descripcion: 'Web de ELE con recursos y materiales educativos.',
        enlace: 'https://ceeleeme.wordpress.com',
        icono: <BookOpen className="w-8 h-8 text-cyan-600" />,
        categoria: 'Educación',
        tecnologias: ['WordPress', 'PHP', 'MySQL']
      },
      {
        id: 12,
        titulo: 'De Tapas por Granada',
        descripcion: 'Webquest educativa: ruta de tapas por Granada.',
        enlace: 'https://detapasporgranada.wordpress.com',
        icono: <Globe className="w-8 h-8 text-red-600" />,
        categoria: 'Educación',
        tecnologias: ['WordPress', 'PHP', 'MySQL']
      },
      {
        id: 13,
        titulo: 'Olvidos de Granada',
        descripcion: 'Revista cultural sobre la historia y cultura de Granada.',
        enlace: 'https://olvidosdegranada.es',
        icono: <BookOpen className="w-8 h-8 text-gray-800" />,
        categoria: 'Revista',
        tecnologias: ['WordPress', 'PHP', 'MySQL']
      }
    ]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mis Proyectos</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explora los 13 proyectos educativos y culturales que he creado para compartir 
              conocimientos sobre español, literatura y metodología educativa.
            </p>
          </div>
          
          {/* Categorías */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {Array.from(new Set(proyectos.map(p => p.categoria))).map(categoria => (
              <button
                key={categoria}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-blue-600 text-white"
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Proyectos */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {proyectos.map((proyecto) => (
            <div
              key={proyecto.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {proyecto.icono}
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {proyecto.categoria}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {proyecto.titulo}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {proyecto.descripcion}
                </p>
              </div>

              {/* Tecnologías */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {proyecto.tecnologias.map((tecnologia, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white text-xs font-medium text-gray-600 rounded-md border"
                    >
                      {tecnologia}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer con enlace */}
              <div className="px-6 py-4 bg-white">
                <Link
                  href={proyecto.enlace}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group-hover:underline"
                >
                  <span>Visitar proyecto</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Quieres colaborar en algún proyecto?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Si eres desarrollador, educador o simplemente quieres contribuir, ¡me encantaría contar contigo!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="mailto:javier@lawikiclase.com"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
            >
              Contactar
            </Link>
            <Link
              href="https://github.com/elcorreveidile"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent text-white px-8 py-3 rounded-lg font-semibold border-2 border-white hover:bg-white hover:text-blue-600 transition inline-block"
            >
              Ver GitHub
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
