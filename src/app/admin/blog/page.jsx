"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  FileText,
  FolderOpen,
  MessageSquare,
  Calendar,
  User,
  Tag,
  Clock,
  BarChart3,
  TrendingUp
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { blogPosts, blogCategories, blogComments } from "@/lib/api";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]"></div>
    </div>
  );
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function PostModal({ post, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    featured_image: post?.featured_image || "",
    status: post?.status || "draft",
    category_ids: post?.blog_post_categories?.map(pc => pc.category.id) || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.title || !form.slug) {
      setError("Judul dan slug wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="font-serif font-bold text-[var(--color-text)] text-xl">
            {post ? "Edit Post" : "Buat Post Baru"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Judul *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
                placeholder="Judul artikel"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
                placeholder="slug-artikel"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Excerpt</label>
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
              placeholder="Ringkasan artikel"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Gambar Featured</label>
            <input
              type="url"
              value={form.featured_image}
              onChange={e => setForm(f => ({ ...f, featured_image: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.category_ids.includes(cat.id)}
                    onChange={e => {
                      const ids = e.target.checked
                        ? [...form.category_ids, cat.id]
                        : form.category_ids.filter(id => id !== cat.id);
                      setForm(f => ({ ...f, category_ids: ids }));
                    }}
                    className="accent-[var(--color-accent)]"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Konten</label>
            <textarea
              rows={10}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
              placeholder="Konten artikel dalam HTML"
            />
          </div>
          {error && <p className="text-[12px] text-red-500 font-sans">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--color-border)] text-sm font-sans text-[var(--color-mid)] hover:border-[var(--color-accent)] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--color-accent)] border border-[var(--color-accent)] text-[var(--color-text-light)] text-sm font-semibold font-sans hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({ category, onSave, onClose }) {
  const [form, setForm] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.slug) {
      setError("Nama dan slug wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] max-w-md w-full">
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="font-serif font-bold text-[var(--color-text)] text-xl">
            {category ? "Edit Kategori" : "Buat Kategori Baru"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Nama *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
              placeholder="Nama kategori"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
              placeholder="slug-kategori"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Deskripsi</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
              placeholder="Deskripsi kategori"
            />
          </div>
          {error && <p className="text-[12px] text-red-500 font-sans">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--color-border)] text-sm font-sans text-[var(--color-mid)] hover:border-[var(--color-accent)] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--color-accent)] border border-[var(--color-accent)] text-[var(--color-text-light)] text-sm font-semibold font-sans hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBlogPage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [approvedFilter, setApprovedFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab, search, statusFilter, approvedFilter]);

  async function fetchData() {
    setLoading(true);
    try {
      if (activeTab === "posts") {
        const params = { limit: 50 };
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        const data = await blogPosts.list(params);
        setPosts(data.posts || []);
      } else if (activeTab === "categories") {
        const data = await blogCategories.list();
        setCategories(data.categories || []);
      } else if (activeTab === "comments") {
        const params = {};
        if (search) params.post_id = search; // or adjust
        if (approvedFilter) params.approved = approvedFilter;
        const data = await blogComments.list(params);
        setComments(data.comments || []);
      }

      // Fetch stats
      const [postsData, catsData, commentsData] = await Promise.all([
        blogPosts.list({ limit: 1 }),
        blogCategories.list(),
        blogComments.list({ limit: 1000 })
      ]);
      setStats({
        totalPosts: postsData.total || 0,
        totalCategories: catsData.categories?.length || 0,
        totalComments: commentsData.comments?.length || 0,
        approvedComments: commentsData.comments?.filter(c => c.is_approved).length || 0,
        pendingComments: commentsData.comments?.filter(c => !c.is_approved).length || 0
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePost(form) {
    if (modal.post) {
      await blogPosts.update(modal.post.slug, form);
    } else {
      await blogPosts.create(form);
    }
    fetchData();
  }

  async function handleSaveCategory(form) {
    if (modal.category) {
      await blogCategories.update(modal.category.id, form);
    } else {
      await blogCategories.create(form);
    }
    fetchData();
  }

  async function handleDeletePost(slug) {
    if (confirm("Yakin hapus post ini?")) {
      await blogPosts.delete(slug);
      fetchData();
    }
  }

  async function handleDeleteCategory(id) {
    if (confirm("Yakin hapus kategori ini?")) {
      await blogCategories.delete(id);
      fetchData();
    }
  }

  async function handleApproveComment(id) {
    await blogComments.approve(id);
    fetchData();
  }

  async function handleRejectComment(id) {
    await blogComments.reject(id);
    fetchData();
  }

  async function handleDeleteComment(id) {
    if (confirm("Yakin hapus komentar ini?")) {
      await blogComments.delete(id);
      fetchData();
    }
  }

  const COLORS = ['#64748b', '#c2b18f', '#8b5e3c', '#10b981'];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif font-bold text-[var(--color-text)] text-2xl">Blog Management</h1>
              <p className="text-[var(--color-mid)] font-sans text-sm mt-1">Kelola artikel, kategori, dan komentar blog</p>
            </div>
            {activeTab === "posts" && (
              <button
                onClick={() => setModal({ type: "post" })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] border border-[var(--color-accent)] text-[var(--color-text-light)] text-sm font-semibold font-sans hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Buat Post
              </button>
            )}
            {activeTab === "categories" && (
              <button
                onClick={() => setModal({ type: "category" })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] border border-[var(--color-accent)] text-[var(--color-text-light)] text-sm font-semibold font-sans hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Buat Kategori
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[var(--color-accent)] p-3">
                  <FileText className="w-6 h-6 text-[var(--color-text-light)]" />
                </div>
              </div>
              <h3 className="text-[var(--color-mid)] text-sm font-medium">Total Posts</h3>
              <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{stats.totalPosts}</p>
            </div>
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[var(--color-accent)] p-3">
                  <FolderOpen className="w-6 h-6 text-[var(--color-text-light)]" />
                </div>
              </div>
              <h3 className="text-[var(--color-mid)] text-sm font-medium">Kategori</h3>
              <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{stats.totalCategories}</p>
            </div>
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[var(--color-accent)] p-3">
                  <MessageSquare className="w-6 h-6 text-[var(--color-text-light)]" />
                </div>
              </div>
              <h3 className="text-[var(--color-mid)] text-sm font-medium">Total Komentar</h3>
              <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{stats.totalComments}</p>
            </div>
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[var(--color-accent)] p-3">
                  <Check className="w-6 h-6 text-[var(--color-text-light)]" />
                </div>
              </div>
              <h3 className="text-[var(--color-mid)] text-sm font-medium">Disetujui</h3>
              <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{stats.approvedComments}</p>
            </div>
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[var(--color-accent)] p-3">
                  <Clock className="w-6 h-6 text-[var(--color-text-light)]" />
                </div>
              </div>
              <h3 className="text-[var(--color-mid)] text-sm font-medium">Pending</h3>
              <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{stats.pendingComments}</p>
            </div>
          </div>
        )}
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[var(--color-accent)] p-3">
                    <FolderOpen className="w-6 h-6 text-[var(--color-text-light)]" />
                  </div>
                </div>
                <h3 className="text-[var(--color-mid)] text-sm font-medium">Total Kategori</h3>
                <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{stats.totalCategories}</p>
              </div>

              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[var(--color-accent)] p-3">
                    <MessageSquare className="w-6 h-6 text-[var(--color-text-light)]" />
                  </div>
                </div>
                <h3 className="text-[var(--color-mid)] text-sm font-medium">Komentar Disetujui</h3>
                <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{stats.approvedComments}</p>
              </div>

              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[var(--color-accent)] p-3">
                    <Clock className="w-6 h-6 text-[var(--color-text-light)]" />
                  </div>
                </div>
                <h3 className="text-[var(--color-mid)] text-sm font-medium">Komentar Pending</h3>
                <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{stats.pendingComments}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Distribusi Komentar</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Disetujui', value: stats.approvedComments },
                        { name: 'Pending', value: stats.pendingComments }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#c5b79d" />
                      <Cell fill="#ab9f85" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Statistik Konten</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Posts', value: stats.totalPosts },
                    { name: 'Kategori', value: stats.totalCategories },
                    { name: 'Komentar', value: stats.totalComments }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#c5b79d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : null}

        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[var(--color-border)]">
          {[
            { id: "posts", label: "Posts", icon: FileText },
            { id: "categories", label: "Kategori", icon: FolderOpen },
            { id: "comments", label: "Komentar", icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-sans border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-mid)] hover:text-[var(--color-text)]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mid)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari..."
              className="pl-10 pr-4 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>
          {activeTab === "posts" && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          )}
          {activeTab === "comments" && (
            <select
              value={approvedFilter}
              onChange={e => setApprovedFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="">Semua Status</option>
              <option value="true">Disetujui</option>
              <option value="false">Pending</option>
            </select>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === "posts" && (
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Judul</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Status</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Tanggal</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map(post => (
                        <tr key={post.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]">
                          <td className="px-4 py-3">
                            <div className="font-sans text-sm text-[var(--color-text)]">{post.title}</div>
                            <div className="text-[11px] text-[var(--color-mid)]">{post.slug}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-[10px] uppercase tracking-[0.12em] font-sans ${
                              post.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--color-mid)] font-sans">
                            {formatDate(post.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setModal({ type: "post", post })}
                                className="p-1 text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.slug)}
                                className="p-1 text-[var(--color-mid)] hover:text-red-500 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Nama</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Slug</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Deskripsi</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]">
                          <td className="px-4 py-3 font-sans text-sm text-[var(--color-text)]">{cat.name}</td>
                          <td className="px-4 py-3 text-sm text-[var(--color-mid)] font-sans">{cat.slug}</td>
                          <td className="px-4 py-3 text-sm text-[var(--color-mid)] font-sans">{cat.description || "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setModal({ type: "category", category: cat })}
                                className="p-1 text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1 text-[var(--color-mid)] hover:text-red-500 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Komentar</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Post</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Status</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Tanggal</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.map(comment => (
                        <tr key={comment.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]">
                          <td className="px-4 py-3">
                            <div className="font-sans text-sm text-[var(--color-text)]">{comment.content.slice(0, 50)}...</div>
                            <div className="text-[11px] text-[var(--color-mid)]">{comment.guest_name || comment.user?.full_name}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--color-mid)] font-sans">{comment.post?.title || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-[10px] uppercase tracking-[0.12em] font-sans ${
                              comment.is_approved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {comment.is_approved ? 'Disetujui' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--color-mid)] font-sans">
                            {formatDate(comment.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {!comment.is_approved && (
                                <button
                                  onClick={() => handleApproveComment(comment.id)}
                                  className="p-1 text-[var(--color-mid)] hover:text-green-500 transition-colors"
                                  title="Setujui"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {comment.is_approved && (
                                <button
                                  onClick={() => handleRejectComment(comment.id)}
                                  className="p-1 text-[var(--color-mid)] hover:text-yellow-500 transition-colors"
                                  title="Tolak"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1 text-[var(--color-mid)] hover:text-red-500 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "post" && (
        <PostModal
          post={modal.post}
          categories={categories}
          onSave={handleSavePost}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "category" && (
        <CategoryModal
          category={modal.category}
          onSave={handleSaveCategory}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}