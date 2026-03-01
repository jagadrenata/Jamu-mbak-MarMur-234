"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  Plus,
  Minus,
  Check,
  Package,
  Tag,
  Eye,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar, { C } from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import { useGuestCartStore } from "@/store/useGuestCartStore";

const navItems = [
  { label: "Products", href: "/", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Cart", href: "/cart", icon: <ShoppingCart className="w-4 h-4" /> },
  { label: "My Orders", href: "/orders", icon: <ClipboardList className="w-4 h-4" /> },
];

function formatRupiah(n) {
  if (n == null) return "-";
  return "Rp " + n.toLocaleString("id-ID");
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);

  const guestAddItem = useGuestCartStore((s) => s.addItem);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setUserId(json?.user?.id ?? false))
      .catch(() => setUserId(false));
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    fetch("/api/data/categories?parent_id=")
      .then((r) => r.json())
      .then((json) => setCategories(json.data || []))
      .catch(() => {});
  }, []);

  async function fetchProduct() {
    setLoading(true);
    try {
      const res = await fetch(`/api/data/products/${slug}`);
      if (!res.ok) {
        router.push("/");
        return;
      }
      const json = await res.json();
      // ok() helper bisa wrap jadi { data: { data: ... } } atau { data: ... }
      const p = json?.data?.data ?? json?.data ?? null;
      if (!p) {
        router.push("/");
        return;
      }
      setProduct(p);

      // Set default variant (first active)
      if (p.variants?.length > 0) {
        setSelectedVariant(p.variants[0]);
      }

      // Set default image
      setActiveImage(p.primary_image ?? p.images?.[0] ?? null);
    } catch (err) {
      console.error(err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  // When variant changes, update image if variant has its own image
  useEffect(() => {
    if (!selectedVariant) return;
    if (selectedVariant.primary_image) {
      setActiveImage(selectedVariant.primary_image);
    } else if (product?.primary_image) {
      setActiveImage(product.primary_image);
    }
    setQuantity(1);
  }, [selectedVariant]);

  const allImages = () => {
    const imgs = [...(product?.images || [])];
    if (selectedVariant?.images?.length) {
      selectedVariant.images.forEach((vi) => {
        if (!imgs.find((i) => i.id === vi.id)) imgs.push(vi);
      });
    }
    return imgs;
  };

  async function handleAddToCart() {
    if (!selectedVariant) return;
    setAddingToCart(true);
    try {
      if (userId) {
        await fetch("/api/dashboard/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            variant_id: selectedVariant.id,
            quantity,
          }),
        });
      } else {
        guestAddItem({
          variant_id: selectedVariant.id,
          product_id: product.id,
          product_name: product.name,
          variant_name: selectedVariant.name,
          variant_sku: selectedVariant.sku,
          variant_price: selectedVariant.price,
          stock: selectedVariant.quantity,
          quantity,
          image: activeImage?.url ?? null,
        });
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Add to cart failed", err);
    } finally {
      setAddingToCart(false);
    }
  }

  const maxQty = selectedVariant ? Math.min(selectedVariant.quantity, 99) : 1;
  const images = allImages();
  const inStock = selectedVariant ? selectedVariant.quantity > 0 : false;

  return (
    <div className="font-sans min-h-screen" style={{ backgroundColor: C.bg }}>
      <Navbar />
      <HeroSlider />

      <div className="px-5 sm:px-8 py-10 md:py-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* ── Sidebar — identik dengan homepage ── */}
          <aside className="md:w-44 lg:w-48 flex-shrink-0">
            <div className="hidden md:block sticky top-24 space-y-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2 px-1"
                  style={{ color: C.mid }}
                >
                  Menu
                </p>
                <ul className="space-y-1">
                  {navItems.map(({ label, href, icon }) => {
                    const isActive = pathname === href;
                    return (
                      <li key={label}>
                        <Link
                          href={href}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all"
                          style={
                            isActive
                              ? { backgroundColor: C.accent, color: C.textLight }
                              : { color: C.accent }
                          }
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
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2 px-1"
                  style={{ color: C.mid }}
                >
                  Kategori
                </p>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/"
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all"
                      style={{ color: C.accent }}
                    >
                      Semua Produk
                    </Link>
                  </li>
                  {categories.map((cat) => {
                    const isActiveCat = product?.category?.id === cat.id;
                    return (
                      <li key={cat.id}>
                        <Link
                          href={`/?category_id=${cat.id}`}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all"
                          style={
                            isActiveCat
                              ? { backgroundColor: C.accent, color: C.textLight }
                              : { color: C.accent }
                          }
                        >
                          {cat.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Mobile: back link */}
            <div className="md:hidden mb-6">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: C.accent }}
              >
                <ChevronLeft className="w-4 h-4" />
                Kembali ke Produk
              </button>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1">
            {loading ? (
              /* Skeleton */
              <div className="flex flex-col lg:flex-row gap-10 animate-pulse">
                <div className="lg:w-[48%] space-y-3">
                  <div className="h-[360px] w-full" style={{ backgroundColor: C.border }} />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 w-16" style={{ backgroundColor: C.border }} />
                    ))}
                  </div>
                </div>
                <div className="lg:w-[52%] space-y-4 pt-2">
                  <div className="h-5 w-1/4" style={{ backgroundColor: C.border }} />
                  <div className="h-9 w-3/4" style={{ backgroundColor: C.border }} />
                  <div className="h-7 w-1/3" style={{ backgroundColor: C.border }} />
                  <div className="h-4 w-full" style={{ backgroundColor: C.border }} />
                  <div className="h-4 w-4/5" style={{ backgroundColor: C.border }} />
                  <div className="h-4 w-2/3" style={{ backgroundColor: C.border }} />
                  <div style={{ borderTop: `1px solid ${C.border}` }} />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-9 w-20" style={{ backgroundColor: C.border }} />
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <div className="flex-1 h-12" style={{ backgroundColor: C.border }} />
                    <div className="flex-1 h-12" style={{ backgroundColor: C.border }} />
                  </div>
                </div>
              </div>
            ) : !product ? null : (
              <>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs mb-6" style={{ color: C.mid }}>
                  <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-1 hover:underline transition"
                    style={{ color: C.accent }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Produk
                  </button>
                  <ChevronRight className="w-3 h-3" />
                  {product.category && (
                    <>
                      <span style={{ color: C.mid }}>{product.category.name}</span>
                      <ChevronRight className="w-3 h-3" />
                    </>
                  )}
                  <span className="truncate max-w-[160px]" style={{ color: C.text }}>
                    {product.name}
                  </span>
                </div>

            <div className="flex flex-col lg:flex-row gap-10">
              {/* ── Image section ── */}
              <div className="lg:w-[48%]">
                {/* Main image */}
                <motion.div
                  className="overflow-hidden mb-3 flex items-center justify-center"
                  style={{
                    backgroundColor: C.border,
                    border: `1px solid ${C.border}`,
                    height: 360,
                  }}
                  key={activeImage?.id}
                  initial={{ opacity: 0.6, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeImage ? (
                    <img
                      src={activeImage.url}
                      alt={activeImage.alt_text || product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 opacity-30" style={{ color: C.mid }} />
                  )}
                </motion.div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(img)}
                        className="w-16 h-16 overflow-hidden flex-shrink-0 transition-all"
                        style={{
                          border: `2px solid ${activeImage?.id === img.id ? C.accent : C.border}`,
                        }}
                      >
                        <img
                          src={img.url}
                          alt={img.alt_text || ""}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Views */}
                <div
                  className="flex items-center gap-1.5 mt-3 text-xs"
                  style={{ color: C.mid }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{product.views_count?.toLocaleString("id-ID") ?? 0} dilihat</span>
                </div>
              </div>

              {/* ── Info section ── */}
              <div className="lg:w-[52%] flex flex-col gap-5">
                {/* Category badge */}
                {product.category && (
                  <span
                    className="text-xs font-medium px-2.5 py-1 self-start"
                    style={{
                      backgroundColor: C.bgCard,
                      border: `1px solid ${C.border}`,
                      color: C.mid,
                    }}
                  >
                    {product.category.name}
                  </span>
                )}

                {/* Name */}
                <h1
                  className="text-2xl md:text-3xl font-bold leading-tight"
                  style={{ fontFamily: "'Georgia', serif", color: C.text }}
                >
                  {product.name}
                </h1>

                {/* Price */}
                <div>
                  {selectedVariant ? (
                    <p className="text-2xl font-bold" style={{ color: C.accent }}>
                      {formatRupiah(selectedVariant.price)}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold" style={{ color: C.accent }}>
                      {product.min_price === product.max_price
                        ? formatRupiah(product.min_price)
                        : `${formatRupiah(product.min_price)} – ${formatRupiah(product.max_price)}`}
                    </p>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm leading-relaxed opacity-75" style={{ color: C.text }}>
                    {product.description}
                  </p>
                )}

                <div style={{ borderTop: `1px solid ${C.border}` }} />

                {/* Variants */}
                {product.variants?.length > 0 && (
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-2"
                      style={{ color: C.mid }}
                    >
                      Pilih Varian
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        const outOfStock = v.quantity === 0;
                        return (
                          <button
                            key={v.id}
                            onClick={() => !outOfStock && setSelectedVariant(v)}
                            disabled={outOfStock}
                            className="px-4 py-2 text-sm font-medium transition-all relative"
                            style={{
                              border: `1.5px solid ${isSelected ? C.accent : C.border}`,
                              backgroundColor: isSelected ? C.accent : C.bgCard,
                              color: isSelected ? C.textLight : outOfStock ? C.mid : C.text,
                              opacity: outOfStock ? 0.5 : 1,
                              cursor: outOfStock ? "not-allowed" : "pointer",
                            }}
                          >
                            {v.name}
                            {outOfStock && (
                              <span className="ml-1 text-xs opacity-60">(Habis)</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Variant meta */}
                    {selectedVariant && (
                      <div
                        className="mt-3 flex flex-wrap gap-4 text-xs"
                        style={{ color: C.mid }}
                      >
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          SKU: {selectedVariant.sku || "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Stok:{" "}
                          <span
                            style={{
                              color: selectedVariant.quantity > 0 ? C.accent : "#e74c3c",
                            }}
                          >
                            {selectedVariant.quantity > 0
                              ? `${selectedVariant.quantity} tersedia`
                              : "Habis"}
                          </span>
                        </span>
                        {selectedVariant.weight && (
                          <span>{selectedVariant.weight}g</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity */}
                {inStock && (
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-2"
                      style={{ color: C.mid }}
                    >
                      Jumlah
                    </p>
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center transition"
                        style={{ border: `1px solid ${C.border}`, color: C.accent }}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <div
                        className="w-12 h-9 flex items-center justify-center text-sm font-semibold"
                        style={{
                          borderTop: `1px solid ${C.border}`,
                          borderBottom: `1px solid ${C.border}`,
                          color: C.text,
                        }}
                      >
                        {quantity}
                      </div>
                      <button
                        onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                        className="w-9 h-9 flex items-center justify-center transition"
                        style={{ border: `1px solid ${C.border}`, color: C.accent }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleAddToCart}
                    disabled={addingToCart || !inStock || !selectedVariant}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: C.accent,
                      color: C.textLight,
                      opacity: !inStock || !selectedVariant ? 0.5 : 1,
                      cursor: !inStock || !selectedVariant ? "not-allowed" : "pointer",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {added ? (
                        <motion.span
                          key="added"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Ditambahkan!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="add"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {addingToCart
                            ? "Menambahkan..."
                            : !inStock
                            ? "Stok Habis"
                            : "Tambah ke Keranjang"}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={async () => {
                      await handleAddToCart();
                      router.push("/cart");
                    }}
                    disabled={addingToCart || !inStock || !selectedVariant}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all"
                    style={{
                      border: `1.5px solid ${C.accent}`,
                      color: C.accent,
                      backgroundColor: "transparent",
                      opacity: !inStock || !selectedVariant ? 0.5 : 1,
                      cursor: !inStock || !selectedVariant ? "not-allowed" : "pointer",
                    }}
                  >
                    Beli Sekarang
                  </motion.button>
                </div>

                {/* Variant attributes */}
                {selectedVariant?.attributes &&
                  Object.keys(selectedVariant.attributes).length > 0 && (
                    <div
                      className="text-xs space-y-1 pt-1"
                      style={{ color: C.mid }}
                    >
                      {Object.entries(selectedVariant.attributes).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="capitalize font-medium">{k}:</span>
                          <span>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
