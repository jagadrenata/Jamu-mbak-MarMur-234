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
    lat: -7.7956,
    lng: 110.3695,
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

export const outlets = [
  {
    id: 1,
    name: "Outlet Kotagede",
    slug: "kotagede",
    address: {
      street: "Jl. Rempah Nusantara No. 12",
      detail: "Kel. Kauman, Kec. Kotagede",
      city: "Yogyakarta, 55173"
    },
    phone: "+62 889-8954-6234",
    whatsapp: "6288989546234",
    hours: [
      { hari: "Senin – Jumat", jam: "15.00 – 17.00" },
      { hari: "Sabtu", jam: "07.00 – 14.00" },
      { hari: "Minggu", jam: "07.00 - 14.00" }
    ],
    maps: {
      lat: -7.7956,
      lng: 110.3695,
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.0!2d110.3!3d-7.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDgnMDAuMCJTIDExMMKwMTgnMDAuMCJF!5e0!3m2!1sid!2sid!4v1234567890",
      directUrl: "https://maps.google.com/?q=Kotagede+Yogyakarta"
    },
    description: "Outlet pusat kami di Kotagede dengan koleksi jamu lengkap dan fasilitas prima."
  },
  {
    id: 2,
    name: "Outlet Malioboro",
    slug: "malioboro",
    address: {
      street: "Jl. Malioboro No. 45",
      detail: "Kel. Bumijo, Kec. Kraton",
      city: "Yogyakarta, 55225"
    },
    phone: "+62 889-8954-6235",
    whatsapp: "6288989546235",
    hours: [
      { hari: "Senin – Minggu", jam: "09.00 – 18.00" }
    ],
    maps: {
      lat: -7.7959,
      lng: 110.3680,
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.0!2d110.36!3d-7.79!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDgnMDAuMCJTIDExMMKwMjInMDAuMCJF!5e0!3m2!1sid!2sid!4v1234567891",
      directUrl: "https://maps.google.com/?q=Malioboro+Yogyakarta"
    },
    description: "Outlet di pusat wisata Malioboro dengan parkir luas dan pelayanan cepat."
  },
  {
    id: 3,
    name: "Outlet Kota Tua",
    slug: "kota-tua",
    address: {
      street: "Jl. Fatahillah No. 23",
      detail: "Kel. Taman, Kec. Jakarta Barat",
      city: "Jakarta Pusat, 12110"
    },
    phone: "+62 889-8954-6236",
    whatsapp: "6288989546236",
    hours: [
      { hari: "Senin – Jumat", jam: "10.00 – 19.00" },
      { hari: "Sabtu - Minggu", jam: "09.00 – 20.00" }
    ],
    maps: {
      lat: -6.1355,
      lng: 106.8128,
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0!2d106.8!3d-6.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s6%C2%B008%2715.8%22S%20106%C2%B048%2745.8%22E!5e0!3m2!1sid!2sid!4v1234567892",
      directUrl: "https://maps.google.com/?q=Kota+Tua+Jakarta"
    },
    description: "Outlet di kawasan wisata Kota Tua Jakarta dengan suasana tradisional."
  },
  {
    id: 4,
    name: "Outlet Semanggi",
    slug: "semanggi",
    address: {
      street: "Jl. Kemang Raya No. 78",
      detail: "Kel. Kemang, Kec. Mampang",
      city: "Jakarta Selatan, 12730"
    },
    phone: "+62 889-8954-6237",
    whatsapp: "6288989546237",
    hours: [
      { hari: "Senin – Minggu", jam: "08.00 – 20.00" }
    ],
    maps: {
      lat: -6.2700,
      lng: 106.8000,
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0!2d106.8!3d-6.27!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s6%C2%B016%2712%22S%20106%C2%B048%2700%22E!5e0!3m2!1sid!2sid!4v1234567893",
      directUrl: "https://maps.google.com/?q=Semanggi+Jakarta"
    },
    description: "Outlet modern di Semanggi dengan fasilitas lengkap dan produk eksklusif."
  }
];
