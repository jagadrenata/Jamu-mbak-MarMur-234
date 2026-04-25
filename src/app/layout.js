import { Geist, Geist_Mono, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "sonner";
import Eruda from "@/components/Eruda";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700"]
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"]
});

export const metadata = {
  title: {
    default: "Jamu Mbak MarMur 234 | Jamu Tradisional Tanpa Pemanis Buatan",
    template: "%s | Jamu Mbak MarMur 234"
  },
  description:
    "Jamu Mbak MarMur 234 Sleman Yogyakarta – jamu tradisional asli  yang dibuat dari empon-empon alami segar, bukan bubuk instan. Menggunakan gula asli tanpa pemanis buatan. Sehat, alami, dan terpercaya.",

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
    "jamu rempah asli",
    
    "minuman tradisional gula asli",
    "minuman herbal alami",
    "minuman tradisional tanpa pemanis buatan",
    
    "Jamu Cibukan",
    "Jamu Sumberadi",
    "Jamu Mlati",
    "Jamu Sleman",
    "Jamu Yogyakarta",
    "Jamu tradisional Sleman",
  ],

  metadataBase: new URL("https://jamubumarmur.biz.id"),
  alternates: {
    canonical: "/"
  },

  authors: [{ name: "Jamu Mbak MarMur 234" }],
  creator: "Jamu Mbak MarMur 234",
  publisher: "Jamu Mbak MarMur 234",

  robots: {
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
    type: "website",
    locale: "id_ID",
    url: "https://jamubumarmur.biz.id",
    siteName: "Jamu Mbak MarMur 234",
    title: "Jamu Mbak MarMur 234 – Jamu Tradisional Tanpa Pemanis Buatan",
    description:
      "Jamu tradisional dari empon-empon alami segar, gula asli, tanpa pemanis buatan. Rasakan bedanya jamu mbak MarMur 234!",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Jamu Mbak MarMur 234 – Jamu Tradisional Tanpa Pemanis Buatan."
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "Jamu Mbak MarMur 234 – Jamu Tradisional di Sleman Yogyakarta",
    description:
      "Jamu tradisional dari empon-empon alami segar, gula asli, tanpa pemanis buatan.",
    images: ["/og-image.webp"]
  },

  applicationName: "Jamu Mbak MarMur 234",
  category: "food"
};

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "FoodEstablishment"],
      "@id": "https://jamubumarmur.biz.id/#business",

      name: "Jamu Mbak MarMur 234",

      alternateName: [
        "Jamu Mbak Mur",
        "Jamu Mbak Mar",
        "Jamu 234",
        "Jamu Mbak MarMur"
      ],

      description:
        "Jamu tradisional di Sleman Yogyakarta yang dibuat dari empon-empon seperti kunyit, jahe, temulawak, dan kencur. Menggunakan gula asli tanpa pemanis buatan.",

      url: "https://jamubumarmur.biz.id",

      logo: {
        "@type": "ImageObject",
        url: "https://jamubumarmur.biz.id/logo.webp"
      },

      image: "https://jamubumarmur.biz.id/og-image.webp",

      servesCuisine: "Indonesian Herbal Drinks",

      priceRange: "Rp 8000 - Rp 12000",

      address: {
        "@type": "PostalAddress",
        streetAddress: "Warak Lor, Sumberadi",
        addressLocality: "Mlati",
        addressRegion: "Sleman",
        postalCode: "55288",
        addressCountry: "ID"
      },

      geo: {
        "@type": "GeoCoordinates",
        latitude: -7.7158,
        longitude: 110.337958
      },

      hasMap: "https://www.google.com/maps?q=-7.7158,110.337958",

      areaServed: [
        "Cibukan",
        "Sumberadi",
        "Mlati",
        "Sleman",
        "Yogyakarta",
        "DIY"
      ],

      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        opens: "07:00",
        closes: "17:00"
      },

      sameAs: [
        "https://maps.google.com/?q=-7.7158,110.337958"
      ]
    },

    {
      "@type": "WebSite",
      "@id": "https://jamubumarmur.biz.id/#website",

      url: "https://jamubumarmur.biz.id",

      name: "Jamu Mbak MarMur 234",

      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://jamubumarmur.biz.id/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
};


export default function RootLayout({ children }) {
  return (
    <html lang='id'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${dmSans.variable} antialiased`}
      >
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd)
          }}
        />
        <Eruda />
        {children}
        <Toaster richColors position='top-center' />
      </body>
    </html>
  );
}
