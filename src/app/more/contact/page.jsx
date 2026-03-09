"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MapPin, Phone, ShoppingBag, ArrowRight, Clock } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { siteConfig } from "@/lib/siteConfig";

const { contact, maps } = siteConfig;

export default function ContactPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <PublicLayout
      heroTitle="Lokasi Kami"
      heroSubtitle="Kami dengan senang hati menyambut kunjungan Anda — atau kirimkan pesan, kami siap membantu."
      sectionTitle="Temukan Kami"
    >
      <style>{`
        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-up.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .wa-btn:hover { opacity: 0.88; }
      `}</style>

      <div className="space-y-10">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 items-start">
          <div className="fade-up flex flex-col gap-5">
            <div className="border border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-7">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] rounded-full flex items-center justify-center text-[var(--color-accent)] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] mb-1.5 font-sans">
                    Alamat
                  </p>
                  <p className="text-sm leading-[1.75] text-[var(--color-text)] font-sans">
                    {contact.address.street}
                    <br />
                    {contact.address.detail}
                    <br />
                    {contact.address.city}
                  </p>
                  <a
                    href={maps.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] text-[var(--color-accent)] no-underline mt-2 font-sans"
                  >
                    Buka di Google Maps
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-7">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 bg-[#25D36615] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-[#25D366]" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] mb-1.5 font-sans">
                    WhatsApp
                  </p>
                  <p className="text-sm text-[var(--color-text)] mb-3 font-sans">
                    {contact.phone}
                  </p>
                  <a
                    href={siteConfig.url.whatsapp(
                      "Halo Mbak MarMur, saya ingin bertanya tentang produk jamu."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wa-btn inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 text-[13px] font-semibold no-underline font-sans tracking-[0.02em]"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Chat via WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="border border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-7">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] rounded-full flex items-center justify-center text-[var(--color-accent)] shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] mb-2.5 font-sans">
                    Jam Buka
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {contact.hours.map(row => (
                      <div
                        key={row.hari}
                        className="flex justify-between text-[13px] font-sans"
                        style={{ color: row.jam === "Tutup" ? "var(--color-mid)" : "var(--color-text)" }}
                      >
                        <span>{row.hari}</span>
                        <span className={row.jam === "Tutup" ? "font-normal" : "font-semibold"}>
                          {row.jam}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fade-up">
            <div className="border border-[var(--color-border)] overflow-hidden min-h-[440px] h-full">
              <iframe
                src={maps.embedUrl}
                width="100%"
                height="100%"
                className="border-0 block min-h-[440px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Lokasi ${siteConfig.name}`}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        <div className="fade-up border border-[var(--color-border)] bg-[var(--color-bg-card)] px-7 py-8 flex flex-col gap-1.5">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans">
            Mau Pesan Tanpa Keluar Rumah?
          </p>
          <p className="text-[clamp(1.1rem,2vw,1.35rem)] font-bold text-[var(--color-text)] font-serif mb-1">
            Kami antar jamu langsung ke pintu Anda
          </p>
          <p className="text-[13px] leading-[1.75] text-[var(--color-mid)] max-w-[480px] font-sans mb-4">
            Pilih produk favorit Anda, kami siapkan dan kirimkan dengan penuh
            kehati-hatian. Cukup pilih dari katalog kami dan checkout —
            sesederhana itu.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-[22px] py-2.5 text-[13px] font-semibold no-underline font-sans tracking-[0.03em] self-start"
          >
            <ShoppingBag className="w-4 h-4" />
            Lihat Produk Kami
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
