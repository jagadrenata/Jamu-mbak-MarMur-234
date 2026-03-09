/**
 * siteConfig.js
 * Simpan semua info toko di sini: kontak, link, media sosial, dll.
 */

export const siteConfig = {
  name: "Nama Toko Anda",
  tagline: "Tagline toko Anda",
  description: "Deskripsi singkat tentang toko Anda.",

  contact: {
    whatsapp: "6288989546234",
    email: "toko@example.com",
    phone: "+62 889-8954-6234",
    address: {
      street: "Jl. Rempah Nusantara No. 12",
      detail: "Kel. Kauman, Kec. Kotagede",
      city: "Yogyakarta, 55173"
    },
    hours: [
      { hari: "Senin – Jumat", jam: "15.00 – 17.00" },
      { hari: "Sabtu", jam: "07.00 – 14.00" },
      { hari: "Minggu", jam: "07.00 - 14.00" }
    ]
  },

  maps: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.0!2d110.3!3d-7.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDgnMDAuMCJTIDExMMKwMTgnMDAuMCJF!5e0!3m2!1sid!2sid!4v1234567890",
    directUrl: "https://maps.google.com/?q=Kotagede+Yogyakarta"
  },

  url: {
    base: "https://example.com",
    instagram: "https://instagram.com/namatoko",
    whatsapp: (message = "") =>
      `https://wa.me/${siteConfig.contact.whatsapp}${
        message ? `?text=${encodeURIComponent(message)}` : ""
      }`
  },

  whatsappOrderMessage: (orderId = "") =>
    siteConfig.url.whatsapp(
      `Halo, saya ingin menanyakan pesanan saya${
        orderId ? ` dengan ID: ${orderId}` : ""
      }.`
    )
};

export const heroSlides = [
  {
    image: "https://come2indonesia.com/wp-content/uploads/2021/02/jamu-3.jpg",
    title: "Jamu Mbak MarMur",
    description:
      "Jamu tradisional pilihan, dibuat dengan cinta dari bahan-bahan alami terbaik."
  },
  {
    image:
      "https://www.foodandwine.com/thmb/KnwEFDzXWXC97r2fsHyvr83J_E4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Jamu-The-drink-that-Indonesians-swear-by-FT-BOG0125-01B-c60d5317b31f447ab62513a5b54be331.jpg",
    title: "Nikmati Kesehatan Alami",
    description:
      "Rasakan manfaat jamu asli Indonesia untuk tubuh dan pikiran sehat setiap hari."
  },
  {
    image:
      "https://cdn.shopify.com/s/files/1/0012/1657/7656/files/jamu_11563cfd-1d26-469c-a1a8-8ec2a5c6f90f.jpg?v=1739511288",
    title: "Rasa Tradisi",
    description: "Dibuat dari resep turun-temurun dengan bahan pilihan."
  }
];
