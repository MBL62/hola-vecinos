/**
 * Comprime una imagen antes de subirla al servidor.
 * Redimensiona a máx 900px de ancho y convierte a JPEG al 78% de calidad.
 * Resultado típico: foto de 4MB → ~200-350KB sin pérdida visual notable.
 */
export async function compressImage(file, maxWidth = 900, quality = 0.78) {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      let { width, height } = img

      // Redimensionar manteniendo proporción
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl)
          // Devuelve un File con extensión .jpg
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.jpg'),
            { type: 'image/jpeg' }
          )
          resolve(compressed)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file) // fallback: subir original si hay error
    }

    img.src = objectUrl
  })
}

/**
 * Extrae el nombre de archivo de una URL pública de Supabase Storage.
 * Ejemplo: "https://xxx.supabase.co/storage/v1/object/public/post-images/abc.jpg"
 * → "abc.jpg"
 */
export function extractStorageFilename(url) {
  if (!url) return null
  try {
    return decodeURIComponent(url.split('/').pop().split('?')[0])
  } catch {
    return null
  }
}
