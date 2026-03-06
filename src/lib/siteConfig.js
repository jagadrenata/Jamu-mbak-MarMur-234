/**
 * siteConfig.js
 * Simpan semua info toko di sini: kontak, link, media sosial, dll.
 * Import di mana saja dengan: import { siteConfig } from "@/config/siteConfig";
 */

export const siteConfig = {
  //  Info Toko 
  name: "Nama Toko Anda",
  tagline: "Tagline toko Anda",
  description: "Deskripsi singkat tentang toko Anda.",

  //  Kontak 
  contact: {
    /**
     * Nomor WhatsApp penjual (format internasional, tanpa + / spasi).
     * Contoh: "6281234567890"  →  +62 812-3456-7890
     */
    whatsapp: "6288989546234",

    email: "toko@example.com",
    phone: "+62 812-3456-7890", // tampilan di UI
  },

  //  URL / Link 
  url: {
    base: "https://example.com",
    instagram: "https://instagram.com/namatoko",
    whatsapp: (message = "") =>
      `https://wa.me/${siteConfig.contact.whatsapp}${
        message ? `?text=${encodeURIComponent(message)}` : ""
      }`,
  },

  //  Pesan WhatsApp default (Hubungi Penjual) 
  /**
   * Fungsi untuk membuat link WA dengan info pesanan.
   * @param {string} orderId  - ID pesanan
   * @returns {string} URL WhatsApp
   */
  whatsappOrderMessage: (orderId = "") =>
    siteConfig.url.whatsapp(
      `Halo, saya ingin menanyakan pesanan saya${
        orderId ? ` dengan ID: ${orderId}` : ""
      }.`
    ),
};

export const heroSlides = [
    {
      image: 'https://come2indonesia.com/wp-content/uploads/2021/02/jamu-3.jpg',
      title: '🌿 Jamu Mbak MarMur',
      description: 'Jamu tradisional pilihan, dibuat dengan cinta dari bahan-bahan alami terbaik.',
    },
    {
      image: 'https://www.foodandwine.com/thmb/KnwEFDzXWXC97r2fsHyvr83J_E4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Jamu-The-drink-that-Indonesians-swear-by-FT-BOG0125-01B-c60d5317b31f447ab62513a5b54be331.jpg',
      title: 'Nikmati Kesehatan Alami',
      description: 'Rasakan manfaat jamu asli Indonesia untuk tubuh dan pikiran sehat setiap hari.',
    },
    {
      image: 'https://cdn.shopify.com/s/files/1/0012/1657/7656/files/jamu_11563cfd-1d26-469c-a1a8-8ec2a5c6f90f.jpg?v=1739511288',
      title: 'Rasa Tradisi, Manfaat Nyata',
      description: 'Dibuat dari resep turun-temurun dengan bahan organik pilihan.',
    },
  ];
