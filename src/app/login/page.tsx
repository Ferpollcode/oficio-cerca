import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <>
      <header className="auth-header">
        <Link className="brand" href="/">
          <Image className="brand-logo" src="/oficios-ya-logo-transparent.png" alt="Oficios Ya" width={1408} height={768} priority />
        </Link>
        <Link className="button" href="/registro">Registro</Link>
      </header>

      <main className="auth-page">
        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-head">
            <h1 id="login-title">Bienvenido</h1>
            <p>Ingresa tus datos para acceder a tu cuenta</p>
          </div>

          <button className="google-button" type="button">
            <span>G</span>
            Iniciar sesion con Google
          </button>

          <div className="auth-separator">
            <span />
            <p>o ingresa con tu cuenta</p>
            <span />
          </div>

          <form className="auth-form">
            <label>
              Usuario o Email
              <input placeholder="Escribi tu usuario o email" type="email" />
            </label>

            <label>
              Contrasena
              <input placeholder="Escribi tu contrasena" type="password" />
            </label>

            <a className="forgot-link" href="#">Olvidaste tu contrasena?</a>

            <button className="auth-submit" type="submit">
              Iniciar sesion
            </button>
          </form>

          <div className="auth-separator">
            <span />
            <p>Sos nuevo?</p>
            <span />
          </div>

          <Link className="create-account-link" href="/registro">
            Crea una cuenta -&gt;
          </Link>
        </section>
      </main>
    </>
  );
}
