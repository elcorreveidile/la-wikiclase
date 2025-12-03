import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Únete a <span className="text-blue-600">La Wikiclase</span>
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta y comienza a aprender
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                card: "shadow-none",
                headerTitle: "text-2xl font-bold text-gray-900",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton: "border-gray-300 text-gray-700 hover:bg-gray-50",
                formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
          />
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            ¿Ya tienes cuenta?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">¿Qué obtienes con tu cuenta?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Acceso a cursos gratuitos</li>
              <li>• Seguimiento de tu progreso</li>
              <li>• Certificados de finalización</li>
              <li>• Acceso a la comunidad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
