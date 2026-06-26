import Link from "next/link";
import Image from "next/image";
import { WorkerRegistrationForm } from "@/components/worker-registration-form";

export default function RegistroPage() {
  return (
    <main className="registration-page">
      <header className="registration-header">
        <Link className="brand" href="/">
          <Image className="brand-logo" src="/oficioya-logo.png" alt="OficioYa" width={230} height={139} priority />
        </Link>
        <Link className="button" href="/">Volver</Link>
      </header>

      <section className="registration-layout">
        <div className="registration-copy">
          <p className="eyebrow">Registro</p>
          <h1>Elegi el tipo de cuenta que queres crear.</h1>
          <p>
            La cuenta cliente sirve para pedir oficios y contactar profesionales. La cuenta
            trabajador permite publicar tu perfil, validar datos y recibir solicitudes.
            El contacto y el acuerdo economico son directos entre ambas partes.
          </p>
        </div>

        <div className="registration-role-grid">
          <div className="panel registration-panel">
            <p className="eyebrow">Cuenta cliente</p>
            <h2>Crear cuenta para pedir trabajos</h2>
            <p>
              Guarda tus datos para pedir servicios, ver profesionales cercanos y consultar
              el seguimiento cuando el trabajador acepte compartir ubicacion.
            </p>
            <form className="client-register-form">
              <label>
                Nombre y apellido
                <input placeholder="Ej: Laura Fernandez" required />
              </label>
              <label>
                Email
                <input placeholder="nombre@email.com" required type="email" />
              </label>
              <label>
                Telefono
                <input placeholder="Ej: +54 9 261 555 1234" required type="tel" />
              </label>
              <label>
                Domicilio principal
                <input placeholder="Ej: Av. San Martin 1120, Ciudad" required />
              </label>
              <button className="button primary" type="submit">Crear cuenta cliente</button>
            </form>
          </div>

          <div className="panel registration-panel">
            <p className="eyebrow">Cuenta trabajador</p>
            <h2>Crear perfil profesional</h2>
            <p>
              Validamos identidad, oficio, matricula, zona de cobertura y consentimiento
              de ubicacion para proteger al cliente y al trabajador.
            </p>
            <WorkerRegistrationForm />
          </div>
        </div>
      </section>
    </main>
  );
}
