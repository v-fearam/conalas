const SITE_NAME = 'Diseño con Alas'
const BASE_URL = 'https://conalas.vercel.app'
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`

interface SEOProps {
  title: string
  description: string
  path: string
  ogImage?: string
  jsonLd?: Record<string, unknown>
}

export default function SEO({ title, description, path, ogImage, jsonLd }: SEOProps) {
  const fullTitle = path === '/' ? title : `${title} | ${SITE_NAME}`
  const canonicalUrl = `${BASE_URL}${path}`
  const image = ogImage ?? DEFAULT_OG_IMAGE

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="es-AR" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </>
  )
}
