"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Phone, MessageCircle, ArrowRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { outlets } from "@/lib/siteConfig";

export default function OutletsPage() {
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <PublicLayout
      heroTitle="Outlet & Cabang Kami"
      heroSubtitle="Temukan lokasi terdekat untuk menikmati jamu pilihan Mbak MarMur di seluruh Indonesia."
      sectionTitle="Kunjungi Kami"
    >
      <style>{`
        .fade-up {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .fade-up.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="space-y-16">
        {/* Outlets Grid */}
        <div>
          <div className="text-center mb-12">
            <p className="fade-up text-[11px] tracking-[0.22em] uppercase text-[var(--color-mid)] mb-2 font-sans">
              Jaringan Outlet
            </p>
            <h2 className="fade-up text-[clamp(1.3rem,2.5vw,1.75rem)] font-bold text-[var(--color-text)] font-serif">
              Lokasi Tersedia di Berbagai Kota
            </h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            {outlets.map((outlet, i) => (
              <button
                key={outlet.id}
                onClick={() => setSelectedOutlet(selectedOutlet?.id === outlet.id ? null : outlet)}
                className="fade-up border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 text-left hover:border-[var(--color-accent)] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans mb-1">
                      {outlet.city.split(",")[1]?.trim()}
                    </p>
                    <p className="text-[clamp(1.05rem,2vw,1.25rem)] font-bold text-[var(--color-text)] font-serif">
                      {outlet.name}
                    </p>
                  </div>
                  <MapPin className="w-5 h-5 text-[var(--color-accent)] shrink-0" />
                </div>

                <p className="text-[13px] leading-[1.6] text-[var(--color-mid)] font-sans mb-4">
                  {outlet.address.street}
                  <br />
                  {outlet.address.detail}, {outlet.address.city}
                </p>

                {/* Quick Contact */}
                <div className="flex gap-2 mb-4">
                  <a
                    href={`tel:${outlet.phone}`}
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-accent)] hover:underline font-sans"
                  >
                    <Phone className="w-4 h-4" />
                    {outlet.phone}
                  </a>
                </div>

                {/* Expand indicator */}
                <p className="text-[12px] text-[var(--color-mid)] font-sans">
                  {selectedOutlet?.id === outlet.id ? "← Tutup detail" : "Lihat detail →"}
                </p>

                {/* Expanded Details */}
                {selectedOutlet?.id === outlet.id && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3 animate-in fade-in duration-300">
                    <div>
                      <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans mb-2">
                        Jam Operasional
                      </p>
                      <div className="space-y-1">
                        {outlet.hours.map((h, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-[13px] text-[var(--color-text)] font-sans"
                          >
                            <span className="font-medium">{h.hari}</span>
                            <span className="text-[var(--color-mid)]">{h.jam}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans mb-2">
                        Kontak
                      </p>
                      <div className="flex flex-col gap-2">
                        <a
                          href={`https://wa.me/${outlet.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-3 py-1.5 text-[12px] font-semibold no-underline font-sans tracking-[0.03em] hover:bg-[color-mix(in_srgb,var(--color-accent)_5%,transparent)]"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                          <ArrowRight className="w-3 h-3" />
                        </a>
                        <a
                          href={outlet.maps.directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-3 py-1.5 text-[12px] font-semibold no-underline font-sans tracking-[0.03em] hover:bg-[color-mix(in_srgb,var(--color-accent)_5%,transparent)]"
                        >
                          <MapPin className="w-4 h-4" />
                          Google Maps
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="fade-up border border-[var(--color-border)] bg-[var(--color-bg-card)] px-7 py-8">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans mb-2">
            Informasi Tambahan
          </p>
          <p className="text-[clamp(1.1rem,2vw,1.35rem)] font-bold text-[var(--color-text)] font-serif mb-2">
            Tidak Menemukan Outlet Terdekat?
          </p>
          <p className="text-[13px] leading-[1.75] text-[var(--color-mid)] max-w-[600px] font-sans">
            Jamu Mbak MarMur juga tersedia melalui berbagai toko retail, marketplace online, dan pengiriman ke rumah. Hubungi kami untuk informasi lebih lanjut tentang ketersediaan produk di kota Anda.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://wa.me/6288989546234?text=Halo%2C%20saya%20ingin%20mengetahui%20ketersediaan%20produk%20di%20kota%20saya."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-[22px] py-2.5 text-[13px] font-semibold no-underline font-sans tracking-[0.03em]"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi Kami
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-[22px] py-2.5 text-[13px] font-semibold no-underline font-sans tracking-[0.03em]"
            >
              Belanja Online
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
