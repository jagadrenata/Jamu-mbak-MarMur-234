"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Download, FileText, ArrowRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useRef } from "react";

export default function ECatalogPage() {
  const containerRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 }
    );

    const elements = containerRef.current?.querySelectorAll(".fade-up") || [];
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/catalog.pdf";
    link.download = "Jamu-Mbak-MarMur-Katalog.pdf";
    link.click();
  };

  return (
    <PublicLayout
      heroTitle="E-Katalog"
      heroSubtitle="Lihat daftar lengkap produk jamu kami dan unduh katalog untuk referensi."
      sectionTitle="Katalog Produk"
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
        .pdf-viewer {
          width: 100%;
          height: 700px;
          border: 1px solid var(--color-border);
          background: white;
        }
        @media (max-width: 768px) {
          .pdf-viewer {
            height: 500px;
          }
        }
      `}</style>

      <div ref={containerRef} className="space-y-10">
        {/* Header dengan Download Button */}
        <div className="fade-up flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center p-6 border border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-[var(--color-accent)]" />
              <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans">
                Format Digital
              </p>
            </div>
            <p className="text-[clamp(1.1rem,2vw,1.35rem)] font-bold text-[var(--color-text)] font-serif mb-1">
              Katalog Lengkap Produk Jamu Mbak MarMur
            </p>
            <p className="text-[13px] leading-[1.75] text-[var(--color-mid)] max-w-[500px] font-sans">
              Lihat semua produk jamu pilihan kami dengan detail lengkap, harga,
              dan manfaat kesehatan. Unduh katalog untuk disimpan dan dibagikan.
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 border border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-text-light)] px-6 py-3 text-[13px] font-semibold no-underline font-sans tracking-[0.03em] hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Unduh Katalog PDF
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="fade-up">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans mb-3">
            Pratinjau Katalog
          </p>
          <div  className="bg-white border border-[var(--color-border)]">
            <embed
              src="/catalog.pdf#toolbar=1&navpanes=0&scrollbar=1"
              type="application/pdf"
              className="pdf-viewer"
            />
            {/* Fallback untuk browser yang tidak support PDF embed */}
            <div className="pdf-viewer hidden [@supports(not(selector(::-webkit-scrollbar)))]:flex flex-col items-center justify-center text-gray-500">
              <FileText className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm font-sans mb-3">
                Browser Anda tidak mendukung pratinjau PDF
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-4 py-2 text-[12px] font-semibold no-underline font-sans"
              >
                <Download className="w-4 h-4" />
                Unduh PDF
              </button>
            </div>
          </div>
        </div>

        {/* Info & Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Informasi Katalog */}
          <div className="fade-up border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans mb-3">
              Tentang Katalog
            </p>
            <div className="space-y-2 text-[13px] text-[var(--color-text)] font-sans">
              <div>
                <p className="font-semibold text-[var(--color-text)] mb-0.5">
                  Format:
                </p>
                <p className="text-[var(--color-mid)]">
                  PDF (Portabel Document Format)
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)] mb-0.5">
                  Ukuran File:
                </p>
                <p className="text-[var(--color-mid)]">~ 2-3 MB</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)] mb-0.5">
                  Isi Katalog:
                </p>
                <p className="text-[var(--color-mid)]">
                  Daftar produk, spesifikasi, harga, dan manfaat
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)] mb-0.5">
                  Update Terakhir:
                </p>
                <p className="text-[var(--color-mid)]">April 2026</p>
              </div>
            </div>
          </div>

          {/* Tips Penggunaan */}
          <div className="fade-up border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans mb-3">
              Tips
            </p>
            <div className="space-y-2 text-[13px] text-[var(--color-mid)] font-sans leading-[1.75]">
              <p>
                ✓ Unduh katalog untuk referensi offline dan bagikan dengan teman
                dan keluarga
              </p>
              <p>
                ✓ Gunakan fitur pencarian (Ctrl+F) untuk menemukan produk
                spesifik dengan cepat
              </p>
              <p>
                ✓ Print halaman favorit untuk melihat detail produk dengan lebih
                jelas
              </p>
              <p>
                ✓ Hubungi kami untuk pemesanan dalam jumlah besar dengan harga
                khusus
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="fade-up border border-[var(--color-border)] bg-[var(--color-bg-card)] px-7 py-8">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mid)] font-sans mb-2">
            Setelah Melihat Katalog
          </p>
          <p className="text-[clamp(1.1rem,2vw,1.35rem)] font-bold text-[var(--color-text)] font-serif mb-3">
            Tertarik dengan produk kami?
          </p>
          <p className="text-[13px] leading-[1.75] text-[var(--color-mid)] max-w-[600px] font-sans mb-5">
            Pesan produk favorit Anda sekarang melalui toko online kami, atau
            hubungi outlet terdekat untuk konsultasi langsung dengan ahli kami.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-[22px] py-2.5 text-[13px] font-semibold no-underline font-sans tracking-[0.03em]"
            >
              Belanja Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/more/outlets"
              className="inline-flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] px-[22px] py-2.5 text-[13px] font-semibold no-underline font-sans tracking-[0.03em]"
            >
              Kunjungi Outlet
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
