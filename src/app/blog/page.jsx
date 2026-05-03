"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Tag, ArrowRight, Clock, User } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { blogPosts, blogCategories } from "@/lib/api";

function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

//CARD VARIANTS
/** Hero – full-width, large image left, text right */
function HeroCard({ post }) {
  const cats =
    post.blog_post_categories?.map(pc => pc.category).filter(Boolean) ?? [];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="fade-up group col-span-full grid md:grid-cols-[1.6fr_1fr] border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden no-underline hover:shadow-lg transition-shadow"
    >
      {post.featured_image && (
        <div className="aspect-[16/9] md:aspect-auto overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-col justify-center p-7 space-y-4">
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cats.map(cat => (
              <span
                key={cat.id}
                className="text-[10px] tracking-[0.18em] uppercase font-sans px-2 py-0.5 border border-[var(--color-accent)] text-[var(--color-accent)]"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
        <h2 className="font-serif font-bold text-[clamp(1.3rem,2.8vw,1.9rem)] leading-snug text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-[13px] leading-[1.8] text-[var(--color-mid)] font-sans line-clamp-4">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 pt-2 text-[11px] text-[var(--color-mid)] font-sans">
          {post.author?.full_name && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {post.author.full_name}
            </span>
          )}
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(post.published_at)}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5 text-[var(--color-accent)] font-semibold text-[12px]">
            Baca selengkapnya <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Wide – spans 2 columns, image top, short text */
function WideCard({ post }) {
  const cats =
    post.blog_post_categories?.map(pc => pc.category).filter(Boolean) ?? [];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="fade-up group col-span-2 border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden no-underline hover:shadow-md transition-shadow"
    >
      {post.featured_image && (
        <div className="aspect-[21/8] overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5 space-y-2">
        {cats.length > 0 && (
          <div className="flex gap-1.5">
            {cats.map(cat => (
              <span
                key={cat.id}
                className="text-[10px] tracking-[0.18em] uppercase font-sans px-2 py-0.5 border border-[var(--color-accent)] text-[var(--color-accent)]"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-serif font-bold text-[1.15rem] leading-snug text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-mid)] font-sans">
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(post.published_at)}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-[var(--color-accent)] font-semibold">
            Baca <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Standard card – 1 column, image + text */
function StandardCard({ post }) {
  const cats =
    post.blog_post_categories?.map(pc => pc.category).filter(Boolean) ?? [];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="fade-up group border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden no-underline hover:shadow-md transition-shadow"
    >
      {post.featured_image && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5 space-y-2">
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cats.map(cat => (
              <span
                key={cat.id}
                className="text-[10px] tracking-[0.18em] uppercase font-sans px-2 py-0.5 border border-[var(--color-accent)] text-[var(--color-accent)]"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-serif font-bold text-[1rem] leading-snug text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[12px] leading-[1.7] text-[var(--color-mid)] font-sans line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 pt-1 text-[11px] text-[var(--color-mid)] font-sans">
          {post.author?.full_name && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {post.author.full_name}
            </span>
          )}
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(post.published_at)}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-[var(--color-accent)] font-semibold">
            Baca <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** List row – horizontal, compact, no image dominance */
function ListCard({ post }) {
  const cats =
    post.blog_post_categories?.map(pc => pc.category).filter(Boolean) ?? [];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="fade-up group col-span-full flex items-center gap-4 border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden no-underline hover:shadow-sm transition-shadow p-4"
    >
      {post.featured_image && (
        <div className="shrink-0 w-24 h-20 sm:w-32 sm:h-24 overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-1">
        {cats.length > 0 && (
          <div className="flex gap-1.5">
            {cats.slice(0, 2).map(cat => (
              <span
                key={cat.id}
                className="text-[9px] tracking-[0.16em] uppercase font-sans px-1.5 py-0.5 border border-[var(--color-accent)] text-[var(--color-accent)]"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-serif font-bold text-[0.95rem] leading-snug text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-mid)] font-sans">
          {post.author?.full_name && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {post.author.full_name}
            </span>
          )}
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(post.published_at)}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="shrink-0 w-4 h-4 text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

/** Minimal text-only card – no image, editorial feel */
function MinimalCard({ post }) {
  const cats =
    post.blog_post_categories?.map(pc => pc.category).filter(Boolean) ?? [];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="fade-up group border border-[var(--color-border)] bg-[var(--color-bg-card)] no-underline hover:shadow-sm transition-shadow p-5 flex flex-col justify-between gap-4"
    >
      <div className="space-y-2">
        {cats.length > 0 && (
          <div className="flex gap-1.5">
            {cats.map(cat => (
              <span
                key={cat.id}
                className="text-[10px] tracking-[0.18em] uppercase font-sans px-2 py-0.5 border border-[var(--color-accent)] text-[var(--color-accent)]"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-serif font-bold text-[1rem] leading-snug text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-3">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[12px] leading-[1.7] text-[var(--color-mid)] font-sans line-clamp-3">
            {post.excerpt}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between text-[11px] text-[var(--color-mid)] font-sans border-t border-[var(--color-border)] pt-3">
        {post.published_at && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatDate(post.published_at)}
          </span>
        )}
        <span className="flex items-center gap-1 text-[var(--color-accent)] font-semibold">
          Baca <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

/**
 * Repeating pattern per 9 posts (one full page):
 *  0 - HeroCard(col-span-full)
 *  1,2 - StandardCard  (1 col each, paired beside each other)
 *  3 - WideCard(col-span-2)
 *  4 - StandardCard  (1 col)
 *  5 - ListCard(col-span-full)
 *  6 - ListCard(col-span-full)
 *  7,8 - MinimalCard (1 col each)
 */
function renderPost(post, localIdx) {
  const pattern = localIdx % 9;
  switch (pattern) {
    case 0:
      return <HeroCard key={post.id} post={post} />;
    case 3:
      return <WideCard key={post.id} post={post} />;
    case 5:
    case 6:
      return <ListCard key={post.id} post={post} />;
    case 7:
    case 8:
      return <MinimalCard key={post.id} post={post} />;
    default:
      return <StandardCard key={post.id} post={post} />;
  }
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-[repeat(3,1fr)] gap-5">
      {/* hero skeleton */}
      <div className="col-span-full grid md:grid-cols-[1.6fr_1fr] border border-[var(--color-border)] animate-pulse bg-[var(--color-bg-card)]">
        <div className="aspect-[16/9] bg-[var(--color-border)]" />
        <div className="p-7 space-y-4">
          <div className="h-3 w-16 bg-[var(--color-border)] rounded" />
          <div className="h-6 w-full bg-[var(--color-border)] rounded" />
          <div className="h-6 w-3/4 bg-[var(--color-border)] rounded" />
          <div className="h-3 w-full bg-[var(--color-border)] rounded" />
          <div className="h-3 w-5/6 bg-[var(--color-border)] rounded" />
        </div>
      </div>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse"
        >
          <div className="aspect-[16/9] bg-[var(--color-border)]" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-16 bg-[var(--color-border)] rounded" />
            <div className="h-4 w-full bg-[var(--color-border)] rounded" />
            <div className="h-4 w-3/4 bg-[var(--color-border)] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

const LIMIT = 9;

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchPosts = useCallback(async (cat = "", q = "", off = 0) => {
    setLoading(true);
    try {
      const params = { status: "published", limit: LIMIT, offset: off };
      if (cat) params.category = cat;
      if (q) params.search = q;
      const data = await blogPosts.list(params);
      setPosts(data.posts ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    blogCategories
      .list()
      .then(d => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPosts(activeCategory, search, offset);
  }, [activeCategory, search, offset, fetchPosts]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries =>
        entries.forEach(
          e => e.isIntersecting && e.target.classList.add("is-visible")
        ),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".fade-up").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [posts]);

  function handleCategoryClick(slug) {
    setActiveCategory(slug === activeCategory ? "" : slug);
    setOffset(0);
  }

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setOffset(0);
  }

  return (
    <PublicLayout
      heroTitle="Blog & Artikel"
      heroSubtitle="Inspirasi kesehatan, tips jamu, dan cerita dari dapur Nusantara untuk Anda."
      sectionTitle="Jamu Mbak MarMur"
    >
      <style>{`
  .fade-up { opacity: 0; transform: translateY(20px); transition: opacity 0.55s ease, transform 0.55s ease; }
  .fade-up.is-visible { opacity: 1; transform: translateY(0); }
`}</style>

      <div className="space-y-10">
        {/* Search & Filter */}
        <div className="fade-up is-visible flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mid)]" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-text-light)] text-sm font-semibold font-sans hover:opacity-90 transition-opacity"
            >
              Cari
            </button>
          </form>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryClick("")}
                className={`text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 border font-sans transition-colors ${activeCategory === "" ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-text-light)]" : "border-[var(--color-border)] text-[var(--color-mid)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"}`}
              >
                Semua
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 border font-sans transition-colors flex items-center gap-1.5 ${activeCategory === cat.slug ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-text-light)]" : "border-[var(--color-border)] text-[var(--color-mid)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"}`}
                >
                  <Tag className="w-3 h-3" /> {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-mid)] font-sans">
            <p className="text-sm">Belum ada artikel yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(3,1fr)] gap-5">
            {posts.map((post, i) => renderPost(post, i))}
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
              className="px-4 py-2 border border-[var(--color-border)] text-sm font-sans text-[var(--color-mid)] disabled:opacity-40 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              ← Sebelumnya
            </button>
            <span className="text-[12px] font-sans text-[var(--color-mid)]">
              {offset + 1}–{Math.min(offset + LIMIT, total)} dari {total}
            </span>
            <button
              disabled={offset + LIMIT >= total}
              onClick={() => setOffset(o => o + LIMIT)}
              className="px-4 py-2 border border-[var(--color-border)] text-sm font-sans text-[var(--color-mid)] disabled:opacity-40 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              Berikutnya →
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}