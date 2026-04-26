"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  Check,
  X,
  MessageCircle,
  Tag,
  ChevronDown,
  Search,
  RefreshCw,
  Globe,
  FileText
} from "lucide-react";
import { blogPosts, blogCategories, blogComments } from "@/lib/api";

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const STATUS_LABELS = {
  draft: "Draft",
  published: "Published",
  archived: "Archived"
};
const STATUS_COLORS = {
  draft: "bg-yellow-100 text-yellow-700 border-yellow-300",
  published: "bg-green-100 text-green-700 border-green-300",
  archived: "bg-gray-100 text-gray-500 border-gray-300"
};

function PostModal({ post, categories, onClose, onSaved }) {
  const isEdit = !!post;
  const [form, setForm] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    featured_image: post?.featured_image ?? "",
    status: post?.status ?? "draft",
    category_ids:
      post?.blog_post_categories?.map(pc => pc.category?.id).filter(Boolean) ??
      []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(val) {
    setForm(f => ({ ...f, title: val, slug: isEdit ? f.slug : toSlug(val) }));
  }

  function toggleCategory(id) {
    setForm(f => ({
      ...f,
      category_ids: f.category_ids.includes(id)
        ? f.category_ids.filter(c => c !== id)
        : [...f.category_ids, id]
    }));
  }

  async function handleSubmit() {
    setError("");
    if (!form.title.trim() || !form.slug.trim())
      return setError("Judul dan slug wajib diisi");
    setLoading(true);
    try {
      if (isEdit) {
        await blogPosts.update(post.slug, { ...form, new_slug: form.slug });
      } else {
        await blogPosts.create(form);
      }
      onSaved();
    } catch (e) {
      setError(e.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-serif font-bold text-[var(--color-text)] text-lg">
            {isEdit ? "Edit Artikel" : "Artikel Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-mid)] hover:text-[var(--color-text)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">
              Judul *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
              placeholder="Judul artikel..."
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">
              Slug *
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-mono outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">
              Ringkasan
            </label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
              placeholder="Deskripsi singkat artikel..."
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">
              URL Gambar Utama
            </label>
            <input
              type="text"
              value={form.featured_image}
              onChange={e =>
                setForm(f => ({ ...f, featured_image: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
              placeholder="https://..."
            />
            {form.featured_image && (
              <img
                src={form.featured_image}
                alt=""
                className="mt-2 h-24 w-full object-cover border border-[var(--color-border)]"
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">
              Konten (HTML)
            </label>
            <textarea
              rows={8}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-mono outline-none focus:border-[var(--color-accent)] transition-colors resize-y"
              placeholder="<p>Isi artikel...</p>"
            />
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-2">
                Kategori
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const active = form.category_ids.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 border font-sans transition-colors ${active ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-text-light)]" : "border-[var(--color-border)] text-[var(--color-mid)] hover:border-[var(--color-accent)]"}`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">
              Status
            </label>
            <div className="relative inline-block">
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="appearance-none px-3 pr-8 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mid)] pointer-events-none" />
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-red-500 font-sans">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[var(--color-border)] text-sm font-sans text-[var(--color-mid)] hover:border-[var(--color-text)] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-[var(--color-accent)] border border-[var(--color-accent)] text-[var(--color-text-light)] text-sm font-semibold font-sans hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Buat Artikel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryManager({ categories, onRefresh }) {
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!form.name.trim() || !form.slug.trim())
      return setError("Nama dan slug wajib diisi");
    setLoading(true);
    try {
      await blogCategories.create(form);
      setForm({ name: "", slug: "", description: "" });
      setError("");
      onRefresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (
      !confirm(
        "Hapus kategori ini? Semua artikel yang terhubung akan kehilangan kategori ini."
      )
    )
      return;
    try {
      await blogCategories.delete(id);
      onRefresh();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Nama kategori"
          value={form.name}
          onChange={e =>
            setForm(f => ({
              ...f,
              name: e.target.value,
              slug: toSlug(e.target.value)
            }))
          }
          className="px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <input
          type="text"
          placeholder="slug"
          value={form.slug}
          onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          className="px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-mono outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="px-4 py-2 border border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-text-light)] text-sm font-semibold font-sans hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {error && <p className="text-[12px] text-red-500 font-sans">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-[12px] text-[var(--color-mid)] font-sans">
            Belum ada kategori.
          </p>
        ) : (
          categories.map(cat => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1.5 border border-[var(--color-border)] px-3 py-1 text-[12px] font-sans text-[var(--color-mid)]"
            >
              <Tag className="w-3 h-3" /> {cat.name}
              <span className="text-[10px] font-mono text-[var(--color-border)] ml-0.5">
                /{cat.slug}
              </span>
              <button
                onClick={() => handleDelete(cat.id)}
                className="ml-1 text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function CommentModerator() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("false");
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await blogComments.list(
        filter !== "" ? { approved: filter } : {}
      );
      setComments(data.comments ?? []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleApprove(id) {
    try {
      await blogComments.approve(id);
      fetchComments();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus komentar ini?")) return;
    try {
      await blogComments.delete(id);
      fetchComments();
    } catch (e) {
      alert(e.message);
    }
  }

  const FILTERS = [
    { val: "false", label: "Menunggu" },
    { val: "true", label: "Disetujui" },
    { val: "", label: "Semua" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button
            key={f.val}
            onClick={() => setFilter(f.val)}
            className={`text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 border font-sans transition-colors ${filter === f.val ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-text-light)]" : "border-[var(--color-border)] text-[var(--color-mid)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border border-[var(--color-border)] p-4 animate-pulse space-y-2"
            >
              <div className="h-3 w-1/3 bg-[var(--color-border)] rounded" />
              <div className="h-3 w-full bg-[var(--color-border)] rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[var(--color-mid)] font-sans py-4">
          Tidak ada komentar.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div
              key={c.id}
              className="border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[12px] font-sans font-semibold text-[var(--color-text)]">
                    {c.user?.full_name || c.guest_name || "Anonim"}
                    {c.guest_email && (
                      <span className="font-normal text-[var(--color-mid)]">
                        {" "}
                        · {c.guest_email}
                      </span>
                    )}
                  </p>
                  {c.post && (
                    <p className="text-[11px] text-[var(--color-mid)] font-sans truncate">
                      Pada: <span className="italic">{c.post.title}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!c.is_approved && (
                    <button
                      onClick={() => handleApprove(c.id)}
                      className="p-1.5 border border-green-400 text-green-600 hover:bg-green-50 transition-colors"
                      title="Setujui"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[13px] text-[var(--color-mid)] font-sans leading-[1.7]">
                {c.content}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-[var(--color-mid)] font-sans">
                  {formatDate(c.created_at)}
                </p>
                {c.is_approved && (
                  <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-green-300 text-green-600 font-sans">
                    Disetujui
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const LIMIT = 15;

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalPost, setModalPost] = useState(null);
  const [tab, setTab] = useState("posts");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchPosts = useCallback(async (q = "", status = "all", off = 0) => {
    setLoading(true);
    try {
      const params = { status, limit: LIMIT, offset: off };
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

  const fetchCategories = useCallback(async () => {
    try {
      const data = await blogCategories.list();
      setCategories(data.categories ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchPosts(search, statusFilter, offset);
  }, [search, statusFilter, offset, fetchPosts]);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function handleDelete(slug) {
    if (!confirm(`Hapus artikel ini? Tindakan tidak dapat dibatalkan.`)) return;
    try {
      await blogPosts.delete(slug);
      fetchPosts(search, statusFilter, offset);
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleQuickStatus(slug, status) {
    try {
      await blogPosts.update(slug, { status });
      fetchPosts(search, statusFilter, offset);
    } catch (e) {
      alert(e.message);
    }
  }

  function onSaved() {
    setModalPost(null);
    fetchPosts(search, statusFilter, offset);
  }

  const TABS = [
    { id: "posts", label: "Artikel", icon: <FileText className="w-4 h-4" /> },
    { id: "categories", label: "Kategori", icon: <Tag className="w-4 h-4" /> },
    {
      id: "comments",
      label: "Komentar",
      icon: <MessageCircle className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Top bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-[var(--color-mid)]">
              Admin Panel
            </p>
            <h1 className="font-serif font-bold text-[var(--color-text)] text-xl">
              Manajemen Blog
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/blog"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-[12px] border border-[var(--color-border)] px-3 py-1.5 font-sans text-[var(--color-mid)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" /> Lihat Blog
            </a>
            <button
              onClick={() => setModalPost(false)}
              className="inline-flex items-center gap-1.5 text-[12px] border border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-text-light)] px-3 py-1.5 font-sans font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" /> Artikel Baru
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-[var(--color-border)]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-[12px] uppercase tracking-[0.12em] font-sans border-b-2 -mb-px transition-colors ${tab === t.id ? "border-[var(--color-accent)] text-[var(--color-accent)] font-semibold" : "border-transparent text-[var(--color-mid)] hover:text-[var(--color-text)]"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "posts" && (
          <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setSearch(searchInput);
                  setOffset(0);
                }}
                className="flex gap-2"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-mid)]" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Cari artikel..."
                    className="pl-8 pr-3 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors w-52"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 border border-[var(--color-border)] text-sm font-sans text-[var(--color-mid)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                >
                  Cari
                </button>
              </form>

              <div className="flex items-center gap-2">
                {["all", "draft", "published", "archived"].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setOffset(0);
                    }}
                    className={`text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 border font-sans transition-colors ${statusFilter === s ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-text-light)]" : "border-[var(--color-border)] text-[var(--color-mid)] hover:border-[var(--color-accent)]"}`}
                  >
                    {s === "all" ? "Semua" : STATUS_LABELS[s]}
                  </button>
                ))}
                <button
                  onClick={() => fetchPosts(search, statusFilter, offset)}
                  className="p-1.5 border border-[var(--color-border)] text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-[var(--color-border)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-card)_60%,transparent)]">
                      {[
                        "Judul",
                        "Kategori",
                        "Penulis",
                        "Status",
                        "Tanggal",
                        "Aksi"
                      ].map(h => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] font-semibold whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr
                          key={i}
                          className="border-b border-[var(--color-border)] animate-pulse"
                        >
                          {[...Array(6)].map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-3 bg-[var(--color-border)] rounded w-3/4" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : posts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-12 text-center text-[var(--color-mid)] font-sans text-sm"
                        >
                          Belum ada artikel yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      posts.map(post => {
                        const cats =
                          post.blog_post_categories
                            ?.map(pc => pc.category?.name)
                            .filter(Boolean) ?? [];
                        return (
                          <tr
                            key={post.id}
                            className="border-b border-[var(--color-border)] hover:bg-[color-mix(in_srgb,var(--color-accent)_3%,transparent)] transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-semibold text-[var(--color-text)] font-sans text-[13px] leading-snug max-w-[220px] truncate">
                                {post.title}
                              </p>
                              <p className="text-[11px] text-[var(--color-mid)] font-mono">
                                /blog/{post.slug}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {cats.length > 0 ? (
                                  cats.map((c, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-mid)] font-sans"
                                    >
                                      {c}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-[var(--color-mid)] font-sans">
                                    —
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-[var(--color-mid)] font-sans whitespace-nowrap">
                              {post.author?.full_name || "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 border font-sans ${STATUS_COLORS[post.status]}`}
                              >
                                {STATUS_LABELS[post.status]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-[var(--color-mid)] font-sans whitespace-nowrap">
                              {formatDate(post.published_at || post.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {post.status !== "published" && (
                                  <button
                                    onClick={() =>
                                      handleQuickStatus(post.slug, "published")
                                    }
                                    className="p-1.5 border border-green-300 text-green-600 hover:bg-green-50 transition-colors"
                                    title="Publish"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {post.status === "published" && (
                                  <button
                                    onClick={() =>
                                      handleQuickStatus(post.slug, "draft")
                                    }
                                    className="p-1.5 border border-yellow-300 text-yellow-600 hover:bg-yellow-50 transition-colors"
                                    title="Jadikan Draft"
                                  >
                                    <EyeOff className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {post.status !== "archived" && (
                                  <button
                                    onClick={() =>
                                      handleQuickStatus(post.slug, "archived")
                                    }
                                    className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
                                    title="Arsipkan"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setModalPost(post)}
                                  className="p-1.5 border border-[var(--color-border)] text-[var(--color-mid)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(post.slug)}
                                  className="p-1.5 border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex items-center justify-between text-[12px] font-sans text-[var(--color-mid)]">
                <span>
                  {offset + 1}–{Math.min(offset + LIMIT, total)} dari {total}{" "}
                  artikel
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={offset === 0}
                    onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
                    className="px-3 py-1.5 border border-[var(--color-border)] disabled:opacity-40 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={offset + LIMIT >= total}
                    onClick={() => setOffset(o => o + LIMIT)}
                    className="px-3 py-1.5 border border-[var(--color-border)] disabled:opacity-40 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "categories" && (
          <div className="border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="font-serif font-bold text-[var(--color-text)] text-base mb-4">
              Kelola Kategori
            </h2>
            <CategoryManager
              categories={categories}
              onRefresh={fetchCategories}
            />
          </div>
        )}

        {tab === "comments" && (
          <div className="border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="font-serif font-bold text-[var(--color-text)] text-base mb-4">
              Moderasi Komentar
            </h2>
            <CommentModerator />
          </div>
        )}
      </div>

      {/* Post Modal */}
      {modalPost !== null && (
        <PostModal
          post={modalPost || null}
          categories={categories}
          onClose={() => setModalPost(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
