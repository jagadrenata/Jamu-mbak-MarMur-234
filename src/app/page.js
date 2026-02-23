"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  ShoppingBag,
  ShoppingCart,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar, { C } from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import { useGuestCartStore } from "@/store/useGuestCartStore";

const supabase = createClient();

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" }
  }),
  hover: {
    y: -6,
    boxShadow: "0 16px 40px rgba(107,58,42,0.18)",
    transition: { duration: 0.25 }
  }
};

const navItems = [
  { label: "Products", href: "/", icon: <ShoppingBag className='w-4 h-4' /> },
  { label: "Cart", href: "/cart", icon: <ShoppingCart className='w-4 h-4' /> },
  { label: "My Orders", href: "/orders", icon: <ClipboardList className='w-4 h-4' /> }
];

function formatRupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [addingToCart, setAddingToCart] = useState(null);

  // Auth state
  const [userId, setUserId] = useState(null); // null = belum dicek, false = guest, string = user id

  // Zustand guest cart
  const guestAddItem = useGuestCartStore(s => s.addItem);

  // Cek session Supabase saat mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? false);
    });
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, sortBy]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/data?table=categories&parent_id=");
      const json = await res.json();
      setCategories(json.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      let url = "/api/data?table=products&status=active";
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) url += `&category_id=${selectedCategory}`;
      const res = await fetch(url);
      const json = await res.json();
      let data = json.data || [];

      if (sortBy === "price_asc")
        data.sort((a, b) => a.min_price - b.min_price);
      else if (sortBy === "price_desc")
        data.sort((a, b) => b.min_price - a.min_price);

      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart(product) {
    setAddingToCart(product.id);
    try {
      // Ambil variant pertama produk
      const varRes = await fetch(
        `/api/data?table=product_variants&product_id=${product.id}&is_active=true`
      );
      const varJson = await varRes.json();
      const firstVariant = varJson.data?.[0];
      if (!firstVariant) return;

      if (userId) {
        // User login → kirim ke cart API
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            variant_id: firstVariant.id,
            quantity: 1
          })
        });
      } else {
        // Guest → simpan ke Zustand store (localStorage)
        guestAddItem({
          variant_id: firstVariant.id,
          product_id: product.id,
          product_name: product.name,
          product_image: product.primary_image,
          variant_name: firstVariant.name,
          variant_sku: firstVariant.sku,
          variant_price: firstVariant.price,
          stock: firstVariant.quantity,
          quantity: 1
        });
      }

      router.push("/cart");
    } catch (err) {
      console.error("Add to cart failed", err);
    } finally {
      setAddingToCart(null);
    }
  }

  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "price_asc", label: "Harga Terendah" },
    { value: "price_desc", label: "Harga Tertinggi" }
  ];

  return (
    <div className='font-sans min-h-screen' style={{ backgroundColor: C.bg }}>
      <Navbar />
      <HeroSlider />

      <div className='px-5 sm:px-8 py-10 md:py-12 max-w-7xl mx-auto'>
        {/* Toolbar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
          <h2
            className='text-2xl md:text-3xl font-bold'
            style={{ fontFamily: "'Georgia', serif", color: C.text }}
          >
            Produk
          </h2>
          <div className='flex flex-wrap gap-3'>
            <div
              className='flex-1 min-w-[220px] px-4 py-2.5 text-sm'
              style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}
            >
              <div className='flex items-center gap-2'>
                <Search className='w-4 h-4' style={{ color: C.mid }} />
                <input
                  type='text'
                  placeholder='Cari produk jamu...'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className='bg-transparent outline-none w-full text-sm'
                  style={{ color: C.text }}
                />
              </div>
            </div>
            <div className='relative'>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className='appearance-none px-4 py-2.5 pr-8 text-sm cursor-pointer'
                style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard, color: C.accent }}
              >
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className='w-4 h-4 absolute right-2 top-3 pointer-events-none' style={{ color: C.mid }} />
            </div>
          </div>
        </div>

        <div className='flex flex-col md:flex-row gap-8'>
          {/* Sidebar */}
          <aside className='md:w-44 lg:w-48 flex-shrink-0'>
            <div className='hidden md:block sticky top-24 space-y-6'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-widest mb-2 px-1' style={{ color: C.mid }}>Menu</p>
                <ul className='space-y-1'>
                  {navItems.map(({ label, href, icon }) => {
                    const isActive = pathname === href;
                    return (
                      <li key={label}>
                        <Link
                          href={href}
                          className='w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all'
                          style={isActive ? { backgroundColor: C.accent, color: C.textLight } : { color: C.accent }}
                        >
                          <span style={{ color: isActive ? C.textLight : C.mid }}>{icon}</span>
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div style={{ borderTop: `1px solid ${C.border}` }} />
              <div>
                <p className='text-xs font-semibold uppercase tracking-widest mb-2 px-1' style={{ color: C.mid }}>Kategori</p>
                <ul className='space-y-1'>
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className='w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-all'
                      style={!selectedCategory ? { backgroundColor: C.accent, color: C.textLight } : { color: C.accent }}
                    >
                      Semua Produk
                    </button>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.id)}
                        className='w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-all'
                        style={selectedCategory === cat.id ? { backgroundColor: C.accent, color: C.textLight } : { color: C.accent }}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile category select */}
            <div className='md:hidden mb-6'>
              <select
                value={selectedCategory || ""}
                onChange={e => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className='w-full px-4 py-2.5 text-sm'
                style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard, color: C.accent }}
              >
                <option value=''>Semua Produk</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* Product grid */}
          <div className='flex-1'>
            {loading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className='overflow-hidden animate-pulse' style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}>
                    <div className='h-48' style={{ backgroundColor: C.border }} />
                    <div className='p-5 space-y-2'>
                      <div className='h-4' style={{ backgroundColor: C.border }} />
                      <div className='h-3 w-2/3' style={{ backgroundColor: C.border }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className='text-center py-20' style={{ color: C.mid }}>
                <p className='text-lg' style={{ fontFamily: "'Georgia', serif" }}>Produk tidak ditemukan.</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    className='overflow-hidden shadow-sm cursor-pointer'
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}
                    variants={cardVariants}
                    initial='hidden'
                    whileInView='visible'
                    whileHover='hover'
                    viewport={{ once: true, margin: "-40px" }}
                    custom={i}
                    onClick={() => router.push(`/products/${product.slug}`)}
                  >
                    <div className='h-48 flex items-center justify-center overflow-hidden' style={{ backgroundColor: C.border }}>
                      <img
                        src={product.primary_image}
                        alt={product.name}
                        className='w-full h-full object-cover'
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    </div>
                    <div className='p-5'>
                      <span className='text-xs font-medium mb-1 block' style={{ color: C.mid }}>{product.category_name}</span>
                      <h3 className='font-bold text-base mb-1 line-clamp-2' style={{ fontFamily: "'Georgia', serif", color: C.text }}>{product.name}</h3>
                      <p className='text-xs mb-3 line-clamp-2 opacity-70' style={{ color: C.text }}>{product.description}</p>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-bold' style={{ color: C.accent }}>
                          {product.min_price === product.max_price
                            ? formatRupiah(product.min_price)
                            : `${formatRupiah(product.min_price)} – ${formatRupiah(product.max_price)}`}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors'
                          style={{ backgroundColor: C.accent, color: C.textLight }}
                          onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
                          disabled={addingToCart === product.id}
                        >
                          <ShoppingCart className='w-3.5 h-3.5' />
                          {addingToCart === product.id ? "..." : "Keranjang"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
