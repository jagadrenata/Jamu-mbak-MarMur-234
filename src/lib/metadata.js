const BASE_URL = "https://jamu234.biz.id";
export const SITE_NAME = "Jamu Mbak MarMur 234";
export const DESCRIPTION = "Jamu tradisional asli dibuat dari empon-empon alami segar, bukan bubuk instan. Menggunakan gula asli tanpa pemanis buatan."
const defaultMetadata = {
  title: {
    default: `${SITE_NAME} | Jamu Tradisional Tanpa Pemanis Buatan`,
    template: `%s | ${SITE_NAME}`
  },
  description:
    "Jamu Mbak MarMur 234 – jamu tradisional asli dibuat dari empon-empon alami segar, bukan bubuk instan. Menggunakan gula asli tanpa pemanis buatan. Sehat, alami, dan terpercaya. Cari: jamu mbak mur, jamu mbak mar, jamu 234.",
  keywords: [
    "Jamu Mbak MarMur",
    "Jamu Mbak MarMur 234",
    "jamu mbak mur",
    "jamu mbak mar",
    "jamu 234",
    "jamu terdekat",
    "jamu tradisional",
    "jamu bahan segar",
    "jamu tanpa pemanis buatan",
    "jamu gula asli",
    "jamu sehat",
    "jamu bukan bubuk instan",
    "minuman herbal alami",
    "jamu rempah asli"
  ],
  ogImage: "/og-image.webp"
};

/**
 * Generate dynamic metadata for Next.js pages.
 *
 * @param {Object} options
 * @param {string} [options.title]          - Page title (tanpa suffix site name)
 * @param {string} [options.description]    - Page description
 * @param {string[]} [options.keywords]     - Additional keywords (digabung dengan default)
 * @param {string} [options.canonicalPath]  - Path canonical, misal "/menu" (default "/")
 * @param {string} [options.ogImage]        - Path gambar OG, misal "/images/menu-og.webp"
 * @param {string} [options.ogType]         - OG type (default "website")
 * @param {boolean} [options.noIndex]       - Set true untuk noindex halaman
 * @returns {import("next").Metadata}
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  canonicalPath = "/",
  ogImage,
  ogType = "website",
  noIndex = false
} = {}) {
  const resolvedTitle = title ?? defaultMetadata.title.default;
  const resolvedDescription = description ?? defaultMetadata.description;
  const resolvedOgImage = ogImage ?? defaultMetadata.ogImage;
  const resolvedKeywords = [
    ...defaultMetadata.keywords,
    ...keywords.filter((k) => !defaultMetadata.keywords.includes(k))
  ];
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  return {
    title: title
      ? { absolute: `${title} | ${SITE_NAME}` }
      : defaultMetadata.title,
    description: resolvedDescription,
    keywords: resolvedKeywords,

    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonicalPath
    },

    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    applicationName: SITE_NAME,
    category: "food",

    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1
          }
        },

    icons: {
      icon: "/favicon-32x32.png",
      shortcut: "/favicon-32x32.png",
      apple: "/apple-touch-icon.png"
    },

    openGraph: {
      type: ogType,
      locale: "id_ID",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: title
        ? `${title} – ${SITE_NAME}`
        : `${SITE_NAME} – Jamu Tradisional Tanpa Pemanis Buatan`,
      description: resolvedDescription,
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: title
            ? `${title} – ${SITE_NAME}`
            : `${SITE_NAME} – Jamu Tradisional Tanpa Pemanis Buatan`
        }
      ]
    },

    twitter: {
      card: "summary_large_image",
      title: title
        ? `${title} – ${SITE_NAME}`
        : `${SITE_NAME} – Jamu Tradisional di Sleman Yogyakarta`,
      description: resolvedDescription,
      images: [resolvedOgImage]
    }
  };
}

/**
 * Generate JSON-LD structured data.
 *
 * @param {Object} [extra]               - Override / extend graph nodes
 * @param {Object} [extra.business]      - Override LocalBusiness fields
 * @param {Object[]} [extra.extraNodes]  - Tambahan node ke dalam @graph
 * @returns {Object} JSON-LD object
 */
export function generateJsonLd({ business = {}, extraNodes = [] } = {}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "FoodEstablishment"],
        "@id": `${BASE_URL}/#business`,
        name: SITE_NAME,
        alternateName: [
          "Jamu Mbak Mur",
          "Jamu Mbak Mar",
          "Jamu 234",
          "Jamu MarMur"
        ],
        description:
          "Jamu tradisional di sleman yang terbuat dari empon-empon asli (bukan bubuk instan), menggunakan gula asli tanpa pemanis buatan.",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/logo.webp`
        },
        image: `${BASE_URL}/og-image.webp`,
        servesCuisine: "Indonesian Herbal Drinks",
        priceRange: "Rp",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Sleman",
          addressRegion: "Yogyakarta",
          addressCountry: "ID"
        },
        ...business
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: SITE_NAME,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      ...extraNodes
    ]
  };
}
