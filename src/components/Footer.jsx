"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  MessageCircle,
  ArrowUpRight
} from "lucide-react";
import { C } from "@/components/Navbar";
import { siteConfig, outlets, getCityParts } from "@/lib/siteConfig";

export default function Footer() {
  const { contact, url } = siteConfig;
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Produk", href: "/produk" },
    { label: "E-Katalog", href: "/more/ecatalog" },
    //{ label: "Outlet", href: "/more/outlets" },
    { label: "Tentang Kami", href: "/more/about" },
    { label: "Kontak", href: "/more/contact" }
  ];

  return (
    <footer
      style={{
        backgroundColor: C.text,
        borderTop: `3px solid ${C.accent}`,
        color: C.textLight
      }}
    >
      {/* Main Footer */}
      <div className="px-5 sm:px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <p
                className="text-xl font-bold mb-1"
                style={{ fontFamily: "'Georgia', serif", color: C.textLight }}
              >
                {siteConfig.name}
              </p>
              <div
                className="w-10 h-[2px] mb-3"
                style={{ backgroundColor: C.accent }}
              />
              <p
                className="text-[12px] leading-[1.8] opacity-70 font-sans"
                style={{ color: C.textLight }}
              >
                {siteConfig.description}
              </p>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href={url.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 border rounded-full transition-all hover:opacity-80 hover:scale-110"
                style={{
                  borderColor: `${C.textLight}30`,
                  color: C.textLight
                }}
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={url.whatsapp()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 border rounded-full transition-all hover:opacity-80 hover:scale-110"
                style={{
                  borderColor: `${C.textLight}30`,
                  color: C.textLight
                }}
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <p
              className="text-[10px] tracking-[0.18em] uppercase font-semibold font-sans mb-4 opacity-50"
              style={{ color: C.textLight }}
            >
              Navigasi
            </p>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-[13px] font-sans opacity-70 hover:opacity-100 transition-all hover:translate-x-1 duration-200"
                    style={{ color: C.textLight }}
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Outlet & Kontak */}
         {
           /*
           <div>
            <p
              className="text-[10px] tracking-[0.18em] uppercase font-semibold font-sans mb-4 opacity-50"
              style={{ color: C.textLight }}
            >
              Outlet Kami
            </p>
            <ul className="space-y-4">
              {outlets.map(outlet => {
                const { postalCode } = getCityParts(outlet.address.city);
                return (
                  <li key={outlet.id} className="flex items-start gap-2.5">
                    <MapPin
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: C.accent }}
                    />
                    <div>
                      <p
                        className="text-[12px] font-semibold font-sans mb-0.5"
                        style={{ color: C.textLight }}
                      >
                        {outlet.name}
                      </p>
                      <p
                        className="text-[11px] font-sans opacity-70 leading-[1.7]"
                        style={{ color: C.textLight }}
                      >
                        {outlet.address.street}, {outlet.address.detail}
                        {postalCode
                          ? `, ${outlet.address.city.split(",")[0].trim()} ${postalCode}`
                          : `, ${outlet.address.city}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`tel:${outlet.phone}`}
                          className="text-[11px] font-sans opacity-70 hover:opacity-100 transition-opacity inline-flex items-center gap-1"
                          style={{ color: C.textLight }}
                        >
                          <Phone className="w-3 h-3" />
                          {outlet.phone}
                        </a>
                      </div>
                      <div className="mt-1">
                        {outlet.hours.map((h, i) => (
                          <p
                            key={i}
                            className="text-[10px] font-sans opacity-50"
                            style={{ color: C.textLight }}
                          >
                            {h.hari}: {h.jam}
                          </p>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
           */
         } 

          {/* Kontak Utama & Jam Operasional */}
          <div>
            <p
              className="text-[10px] tracking-[0.18em] uppercase font-semibold font-sans mb-4 opacity-50"
              style={{ color: C.textLight }}
            >
              Hubungi Kami
            </p>
            <ul className="space-y-3 mb-5">
              <li className="flex items-center gap-2.5">
                <Mail
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: C.accent }}
                />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-[13px] font-sans opacity-70 hover:opacity-100 transition-opacity"
                  style={{ color: C.textLight }}
                >
                  {contact.email}
                </a>
              </li>
            </ul>

            <p
              className="text-[10px] tracking-[0.18em] uppercase font-semibold font-sans mb-3 opacity-50"
              style={{ color: C.textLight }}
            >
              Jam Operasional Pusat
            </p>
            <ul className="space-y-2 mb-5">
              {contact.hours.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Clock
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: C.accent }}
                  />
                  <div>
                    <p
                      className="text-[12px] font-semibold font-sans"
                      style={{ color: C.textLight }}
                    >
                      {h.hari}
                    </p>
                    <p
                      className="text-[12px] font-sans opacity-60"
                      style={{ color: C.textLight }}
                    >
                      {h.jam}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* WhatsApp CTA */}
            <a
              href={url.whatsapp(
                "Halo min, saya ingin bertanya tentang produk jamu."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold font-sans tracking-[0.03em] transition-all hover:opacity-80 hover:scale-105 rounded-lg"
              style={{
                backgroundColor: C.accent,
                color: C.textLight
              }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Hubungi via WhatsApp
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: `1px solid ${C.textLight}15` }}>
        <div className="px-5 sm:px-8 py-4 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p
            className="text-[11px] font-sans opacity-40"
            style={{ color: C.textLight }}
          >
            © {currentYear} {siteConfig.name}. Seluruh hak dilindungi.
          </p>
          <p
            className="text-[11px] font-sans opacity-40"
            style={{ color: C.textLight }}
          >
            Jamu alami · Tradisional · Kesehatan keluarga
          </p>
        </div>
      </div>
    </footer>
  );
}
