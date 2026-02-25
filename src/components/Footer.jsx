// components/Footer.tsx
import Link from "next/link";
import { C } from "@/components/Navbar";


export default function Footer() {
  return (
    <footer 
      className="mt-auto"
      style={{ 
        backgroundColor: C.bgDark,
        color: C.textLight,
        borderTop: `1px solid ${C.border}`
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Kolom 1 - Brand & Deskripsi */}
          <div>
            <h3 
              className="text-xl font-semibold mb-4"
              style={{ color: C.mid }}
            >
              Nama Brand / Toko
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Menyediakan produk berkualitas dengan sentuhan hangat dan elegan untuk setiap momen spesialmu.
            </p>
          </div>

          {/* Kolom 2 - Link Navigasi */}
          <div>
            <h4 className="text-lg font-medium mb-4" style={{ color: C.mid }}>
              Jelajahi
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-[#C4956A] transition-colors">Beranda</Link></li>
              <li><Link href="/produk" className="hover:text-[#C4956A] transition-colors">Produk</Link></li>
              <li><Link href="/tentang" className="hover:text-[#C4956A] transition-colors">Tentang Kami</Link></li>
              <li><Link href="/kontak" className="hover:text-[#C4956A] transition-colors">Kontak</Link></li>
            </ul>
          </div>

          {/* Kolom 3 - Kontak & Sosmed */}
          <div>
            <h4 className="text-lg font-medium mb-4" style={{ color: C.mid }}>
              Hubungi Kami
            </h4>
            <div className="space-y-2 text-sm">
              <p>Email: hello@namabrand.com</p>
              <p>WA: 0812-3456-7890</p>
              <p className="mt-4">Ikuti kami di:</p>
              <div className="flex gap-4 mt-2">
                <a href="#" className="hover:text-[#C4956A] transition-colors">IG</a>
                <a href="#" className="hover:text-[#C4956A] transition-colors">TW</a>
                <a href="#" className="hover:text-[#C4956A] transition-colors">Tiktok</a>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="mt-10 pt-6 text-center text-sm border-t opacity-75"
          style={{ borderTopColor: C.border }}
        >
          © {new Date().getFullYear()} Nama Brand. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
}