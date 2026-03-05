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
