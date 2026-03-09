"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MapPin, Leaf, Heart, Star, ArrowRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

const values = [
  {
    icon: <Leaf className="w-5 h-5" />,
    title: "Bahan Alami Pilihan",
    desc: "Setiap bahan dipilih langsung dari rempah-rempah segar berkualitas tinggi — kunyit, jahe, temulawak, dan kencur dari petani terpercaya."
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Resep Turun-Temurun",
    desc: "Racikan kami mengikuti kearifan lokal yang diwariskan dari generasi ke generasi, dipadukan sentuhan modern tanpa mengubah esensinya."
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Tanpa Bahan Kimia",
    desc: "100% bebas pengawet buatan, pemanis buatan dan pewarna sintetis."
  }
];

export default function AboutPage() {
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
      heroTitle="Tentang Kami"
      heroSubtitle="Meracik kesehatan dari bumi Nusantara, satu tegukan menyehatkan untuk keluarga Indonesia."
      sectionTitle="Jamu Mbak MarMur"
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-12 items-center">
          <div className="fade-up relative">
            <div className="absolute -inset-2.5 border border-[var(--color-border)] z-0" />
            <img
              src="/logo.webp"
              alt="Rempah-rempah jamu tradisional"
              className="w-full aspect-[4/5] object-cover block relative z-10"
              style={{ filter: "sepia(15%) saturate(1.1)" }}
            />
            <div className="absolute bottom-5 -right-4 bg-[var(--color-accent)] text-[var(--color-text-light)] px-4 py-2 text-[12px] font-sans tracking-[0.05em] z-20 shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
              ✦ Sejak 2020
            </div>
          </div>

          <div className="space-y-4">
            <p className="fade-up text-[11px] tracking-[0.22em] uppercase text-[var(--color-mid)] font-sans">
              Kisah Kami
            </p>

            <h2 className="fade-up text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.3] text-[var(--color-text)] font-serif">
              Dari Dapur Keluarga ke{" "}
              <span className="text-[var(--color-accent)]">Meja Makan Indonesia</span>
            </h2>

            <p className="fade-up text-sm leading-[1.85] text-[var(--color-mid)] font-sans">
              Jamu Mbak MarMur lahir dari kecintaan mendalam pada warisan
              leluhur. Berawal dari resep rahasia yang diwariskan oleh nenek
              kami di kampung halaman, kami percaya bahwa alam menyimpan segala
              yang dibutuhkan tubuh untuk tetap sehat dan bugar.
            </p>

            <p className="fade-up text-sm leading-[1.85] text-[var(--color-mid)] font-sans">
              Setiap botol jamu kami adalah hasil dari proses meracik yang penuh
              kesabaran — menggunakan kunyit segar, jahe pilihan, temulawak,
              kencur, dan rempah-rempah Nusantara lainnya. Tidak ada jalan
              pintas, tidak ada pengawet, hanya ketulusan dalam setiap
              prosesnya.
            </p>

            <p className="fade-up text-sm leading-[1.85] text-[var(--color-mid)] font-sans">
              Kami bangga menjadi bagian dari gerakan kembali ke alam — menjaga
              tradisi jamu yang telah diakui UNESCO sebagai Warisan Budaya
              Takbenda Indonesia, sambil menyajikannya dalam kemasan yang
              praktis dan modern.
            </p>
          </div>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        <div>
          <div className="text-center mb-9">
            <p className="fade-up text-[11px] tracking-[0.22em] uppercase text-[var(--color-mid)] mb-2 font-sans">
              Keunggulan Kami
            </p>
            <h2 className="fade-up text-[clamp(1.3rem,2.5vw,1.75rem)] font-bold text-[var(--color-text)] font-serif">
              Mengapa Memilih Jamu Mbak MarMur?
            </h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
            {values.map((v, i) => (
              <div
                key={i}
                className="fade-up border border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-7 flex flex-col gap-3"
              >
                <div className="w-10 h-10 bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] rounded-full flex items-center justify-center text-[var(--color-accent)]">
                  {v.icon}
                </div>
                <p className="font-bold text-sm text-[var(--color-text)] font-serif">
                  {v.title}
                </p>
                <p className="text-[13px] leading-[1.75] text-[var(--color-mid)] font-sans">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-up border border-[var(--color-border)] bg-[var(--color-bg-card)] px-7 py-8 flex flex-col gap-1.5">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans">
            Kunjungi Kami
          </p>
          <p className="text-[clamp(1.1rem,2vw,1.35rem)] font-bold text-[var(--color-text)] font-serif mb-1">
            Temukan Jamu Mbak MarMur di Dekat Anda
          </p>
          <p className="text-[13px] leading-[1.75] text-[var(--color-mid)] max-w-[480px] font-sans mb-4">
            Singgah langsung ke warung kami, atau hubungi kami untuk informasi
            pengiriman dan pemesanan dalam jumlah besar.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-[22px] py-2.5 text-[13px] font-semibold no-underline font-sans tracking-[0.03em] self-start"
          >
            <MapPin className="w-4 h-4" />
            Lokasi Kami
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
