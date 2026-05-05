import './PrivacyPage.css'

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <header className="privacy-header">
          <div className="privacy-logo">🏘️ Hola Vecinos</div>
          <h1>Política de Privacidad</h1>
          <p className="privacy-date">Última actualización: mayo 2025</p>
        </header>

        <div className="privacy-content">

          <section className="privacy-section">
            <h2>1. ¿Quiénes somos?</h2>
            <p>
              <strong>Hola Vecinos</strong> (<a href="https://holavecinos.cl">holavecinos.cl</a>) es un marketplace
              vecinal geolocalizado que permite a usuarios comprar, vender, regalar e intercambiar productos
              y servicios con personas cercanas a su ubicación. El servicio es operado por Maximiliano Basoa,
              contacto: <a href="mailto:mbasoa@mblsol.org">mbasoa@mblsol.org</a>.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Datos que recopilamos</h2>
            <ul>
              <li><strong>Correo electrónico:</strong> al registrarse, para autenticación y comunicaciones.</li>
              <li><strong>Nombre o apodo:</strong> opcional, para mostrar en el perfil.</li>
              <li><strong>Ubicación geográfica (GPS):</strong> para mostrar publicaciones cercanas. Solo se usa mientras usas la app y no se almacena en servidores de forma permanente.</li>
              <li><strong>Imágenes:</strong> las fotos que subes en tus publicaciones o en tu perfil.</li>
              <li><strong>Datos de uso:</strong> páginas visitadas, clics e interacciones, recopilados de forma anónima mediante Google Analytics / Google Tag Manager.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. ¿Para qué usamos tus datos?</h2>
            <ul>
              <li>Permitirte publicar, buscar y contactar vecinos en el marketplace.</li>
              <li>Enviarte correos de verificación de cuenta y notificaciones del servicio.</li>
              <li>Mejorar la experiencia de usuario mediante análisis anónimo de uso.</li>
              <li>Mantener la seguridad de la plataforma y prevenir abusos.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. Compartir datos con terceros</h2>
            <p>No vendemos ni compartimos tus datos personales con terceros con fines comerciales. Utilizamos los siguientes servicios:</p>
            <ul>
              <li><strong>Supabase</strong> (base de datos y almacenamiento) — <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer">Política de Supabase</a></li>
              <li><strong>Vercel</strong> (hosting) — <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Política de Vercel</a></li>
              <li><strong>Google Analytics / GTM</strong> (análisis anónimo) — <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Política de Google</a></li>
              <li><strong>Resend</strong> (envío de correos) — <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noreferrer">Política de Resend</a></li>
              <li><strong>Stadia Maps</strong> (mapas) — <a href="https://stadiamaps.com/privacy-policy/" target="_blank" rel="noreferrer">Política de Stadia Maps</a></li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>5. Cookies y tecnologías de seguimiento</h2>
            <p>
              Utilizamos Google Tag Manager y Google Analytics para recopilar estadísticas anónimas de uso
              (páginas vistas, tiempo en el sitio, dispositivos). Estos servicios pueden usar cookies.
              Al usar Hola Vecinos, aceptas el uso de estas tecnologías.
              Puedes desactivarlas en la configuración de tu navegador.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Retención de datos</h2>
            <ul>
              <li>Las publicaciones expiran automáticamente a las <strong>24 horas</strong> de crearse.</li>
              <li>Tu cuenta y datos de perfil se conservan mientras mantengas tu cuenta activa.</li>
              <li>Puedes solicitar la eliminación de tu cuenta enviando un email a <a href="mailto:mbasoa@mblsol.org">mbasoa@mblsol.org</a>.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>7. Seguridad</h2>
            <p>
              Tus datos se almacenan en servidores seguros con cifrado en tránsito (HTTPS) y en reposo.
              Las contraseñas se almacenan con hash seguro y nunca son legibles por el equipo de Hola Vecinos.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. Tus derechos</h2>
            <p>Como usuario tienes derecho a:</p>
            <ul>
              <li>Acceder a los datos que tenemos sobre ti.</li>
              <li>Corregir datos incorrectos.</li>
              <li>Solicitar la eliminación de tu cuenta y datos.</li>
              <li>Oponerte al procesamiento de tus datos para análisis.</li>
            </ul>
            <p>Para ejercer cualquiera de estos derechos, escríbenos a <a href="mailto:mbasoa@mblsol.org">mbasoa@mblsol.org</a>.</p>
          </section>

          <section className="privacy-section">
            <h2>9. Menores de edad</h2>
            <p>
              Hola Vecinos no está dirigido a menores de 13 años. No recopilamos conscientemente
              datos de menores. Si crees que un menor ha creado una cuenta, contáctanos para eliminarla.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta política ocasionalmente. Los cambios se publicarán en esta página
              con la fecha de actualización. Te notificaremos por email en caso de cambios significativos.
            </p>
          </section>

          <section className="privacy-section privacy-contact">
            <h2>📬 Contacto</h2>
            <p>
              Si tienes preguntas sobre esta política de privacidad, contáctanos en:<br />
              <a href="mailto:mbasoa@mblsol.org">mbasoa@mblsol.org</a>
            </p>
          </section>

        </div>

        <footer className="privacy-footer">
          <a href="/">← Volver a Hola Vecinos</a>
        </footer>
      </div>
    </div>
  )
}
