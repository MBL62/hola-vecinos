import './AdBanner.css'

/**
 * AdBanner — preparado para Google AdSense.
 *
 * Cuando tengas tu cuenta de AdSense, reemplaza el contenido de este
 * componente con el script de AdSense:
 *
 *   <ins className="adsbygoogle"
 *     style={{ display: 'block' }}
 *     data-ad-client="ca-pub-XXXXXXXXXX"
 *     data-ad-slot="XXXXXXXXXX"
 *     data-ad-format="auto"
 *     data-full-width-responsive="true">
 *   </ins>
 *
 * Y en index.html agrega en <head>:
 *   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossorigin="anonymous"></script>
 */
export default function AdBanner() {
  return (
    <div className="ad-banner" aria-label="Publicidad">
      <span className="ad-label">Publicidad</span>
      <a
        className="ad-placeholder"
        href="mailto:mbasoa@mblsol.org?subject=Publicidad en Hola Vecinos"
        title="Publicítate en Hola Vecinos"
      >
        <span className="ad-placeholder-emoji">📢</span>
        <span className="ad-placeholder-text">¿Quieres publicitar aquí?</span>
        <span className="ad-placeholder-cta">Contáctanos →</span>
      </a>
    </div>
  )
}
