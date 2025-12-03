import Link from 'next/link'
import { BookOpen, GraduationCap, Sparkles, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Bienvenido a{' '}
            <span className="text-blue-600">La Wikiclase</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tu plataforma integral para aprender español, literatura y metodología educativa.
            Cursos profesionales diseñados por Javier Benítez Láinez.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/cursos"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Explorar Cursos
            </Link>
            <Link
              href="/proyectos"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
            >
              Mis Proyectos
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<BookOpen className="w-12 h-12 text-blue-600" />}
            title="Cursos de ELE"
            description="Español como Lengua Extranjera con metodología innovadora"
          />
          <FeatureCard
            icon={<GraduationCap className="w-12 h-12 text-blue-600" />}
            title="Literatura"
            description="Desde el español medieval hasta la literatura contemporánea"
          />
          <FeatureCard
            icon={<Sparkles className="w-12 h-12 text-blue-600" />}
            title="IA Educativa"
            description="Integración de inteligencia artificial en el aprendizaje"
          />
          <FeatureCard
            icon={<Globe className="w-12 h-12 text-blue-600" />}
            title="13 Proyectos"
            description="Accede a todas mis webs educativas y culturales"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar tu aprendizaje?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a la comunidad de estudiantes de La Wikiclase
          </p>
          <Link
            href="/sign-up"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
