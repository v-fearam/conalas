const SITE_NAME = 'Diseño con Alas'
const BASE_URL = 'https://conalas.vercel.app'

interface SEOProps {
  title: string
  description: string
  path: string
  jsonLd?: Record<string, unknown>
}

export default function SEO({ title, description, path, jsonLd }: SEOProps) {
  const fullTitle = path === '/' ? title : `${title} | ${SITE_NAME}`
  const canonicalUrl = `${BASE_URL}${path}`

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </>
  )
}
