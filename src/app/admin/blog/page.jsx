"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Tag,
  Calendar,
  User,
  ArrowLeft,
  Send,
  MessageCircle,
  Clock
} from "lucide-react";
import { blogPosts, blogCategories, blogComments } from "@/lib/api";

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatReadTime(content) {
  if (!content) return "1 min";
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min`;
}

function BlogPost({ post, onBack }) {
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    guest_name: "",
    guest_email: "",
    content: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (post) {
      blogComments
        .list({ post_slug: post.slug, approved: "true" })
        .then(data => setComments(data.comments || []))
        .catch(() => setComments([]));
    }
  }, [post]);

  async function handleSubmitComment(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!commentForm.content.trim())
      return setError("Komentar tidak boleh kosong");
    setSubmitting(true);
    try {
      await blogComments.create({
        post_slug: post.slug,
        ...commentForm
      });
      setCommentForm({ guest_name: "", guest_email: "", content: "" });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Gagal mengirim komentar");
    } finally {
      setSubmitting(false);
    }
  }

  const categories =
    post.blog_post_categories?.map(pc => pc.category).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8 border border-[var(--color-border)] overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)]">
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              {categories.map((cat, i) => (
                <span key={cat.id}>
                  {cat.name}
                  {i < categories.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(post.published_at || post.created_at)}
          </div>
          {post.author && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {post.author.full_name}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formatReadTime(post.content)}
          </div>
        </div>

        {/* Title */}
        <h1 className="font-serif font-bold text-[var(--color-text)] text-4xl md:text-5xl leading-[1.2] mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-[var(--color-mid)] text-lg font-sans leading-[1.8] mb-12 pb-12 border-b border-[var(--color-border)]">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose-blog font-sans text-[var(--color-text)] text-[15px] leading-[1.9] mb-16"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            maxWidth: "none"
          }}
        />

        {/* Comments Section */}
        <div className="border-t border-[var(--color-border)] pt-12">
          <div className="flex items-center gap-2 mb-8">
            <MessageCircle className="w-5 h-5 text-[var(--color-mid)]" />
            <h2 className="font-serif font-bold text-[var(--color-text)] text-2xl">
              Komentar ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          <form
            onSubmit={handleSubmitComment}
            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 mb-8"
          >
            <p className="text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-4">
              Tulis Komentar
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Nama"
                  value={commentForm.guest_name}
                  onChange={e =>
                    setCommentForm(f => ({ ...f, guest_name: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email (opsional)"
                  value={commentForm.guest_email}
                  onChange={e =>
                    setCommentForm(f => ({ ...f, guest_email: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>
            <textarea
              rows={4}
              placeholder="Tulis komentar Anda..."
              value={commentForm.content}
              onChange={e =>
                setCommentForm(f => ({ ...f, content: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors resize-none mb-4"
            />
            {error && (
              <p className="text-[12px] text-red-500 font-sans mb-3">{error}</p>
            )}
            {success && (
              <p className="text-[12px] text-green-600 font-sans mb-3">
                Komentar berhasil dikirim dan menunggu persetujuan.
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-accent)] border border-[var(--color-accent)] text-[var(--color-text-light)] text-sm font-semibold font-sans hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Mengirim..." : "Kirim Komentar"}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-sm text-[var(--color-mid)] font-sans py-8 text-center">
                Belum ada komentar. Jadilah yang pertama berkomentar!
              </p>
            ) : (
              comments.map(comment => (
                <div
                  key={comment.id}
                  className="border-b border-[var(--color-border)] pb-6 last:border-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-light)] font-serif font-bold">
                      {(comment.user?.full_name ||
                        comment.guest_name ||
                        "A")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-2">
                        <p className="font-sans font-semibold text-[var(--color-text)] text-sm">
                          {comment.user?.full_name ||
                            comment.guest_name ||
                            "Anonim"}
                        </p>
                        <span className="text-[11px] text-[var(--color-mid)] font-sans">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-[14px] text-[var(--color-mid)] font-sans leading-[1.7]">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const LIMIT = 9;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { status: "published", limit: LIMIT, offset };
        if (search) params.search = search;
        if (selectedCategory) params.category = selectedCategory;
        
        const [postsData, catsData] = await Promise.all([
          blogPosts.list(params),
          blogCategories.list()
        ]);
        
        setPosts(postsData.posts || []);
        setTotal(postsData.total || 0);
        setCategories(catsData.categories || []);
      } catch {
        setPosts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, selectedCategory, offset]);

  if (selectedPost) {
    return <BlogPost post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-[var(--color-mid)] mb-2">
            Artikel & Wawasan
          </p>
          <h1 className="font-serif font-bold text-[var(--color-text)] text-4xl md:text-5xl mb-4">
            Blog
          </h1>
          <p className="text-[var(--color-mid)] font-sans text-base max-w-2xl leading-[1.7]">
            Temukan artikel terbaru, panduan mendalam, dan wawasan seputar produk dan industri kami.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="mb-12 space-y-6">
          {/* Search */}
          <form
            onSubmit={e => {
              e.preventDefault();
              setSearch(searchInput);
              setOffset(0);
            }}
            className="flex gap-3"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mid)]" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 border border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-text-light)] text-sm font-semibold font-sans hover:opacity-90 transition-opacity"
            >
              Cari
            </button>
          </form>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setOffset(0);
                }}
                className={`text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 border font-sans transition-colors ${!selectedCategory ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-text-light)]" : "border-[var(--color-border)] text-[var(--color-mid)] hover:border-[var(--color-accent)]"}`}
              >
                Semua
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setOffset(0);
                  }}
                  className={`text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 border font-sans transition-colors ${selectedCategory === cat.slug ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-text-light)]" : "border-[var(--color-border)] text-[var(--color-mid)] hover:border-[var(--color-accent)]"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse"
              >
                <div className="h-48 bg-[var(--color-border)]" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-[var(--color-border)] rounded w-2/3" />
                  <div className="h-3 bg-[var(--color-border)] rounded w-full" />
                  <div className="h-3 bg-[var(--color-border)] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-mid)] font-sans text-sm">
              Tidak ada artikel yang ditemukan.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map(post => {
                const cats =
                  post.blog_post_categories
                    ?.map(pc => pc.category)
                    .filter(Boolean) || [];
                return (
                  <article
                    key={post.id}
                    className="border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.featured_image && (
                      <div className="overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {cats.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {cats.map(cat => (
                            <span
                              key={cat.id}
                              className="text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-mid)] font-sans"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="font-serif font-bold text-[var(--color-text)] text-xl leading-[1.3] mb-3 group-hover:text-[var(--color-accent)] transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-[var(--color-mid)] font-sans text-sm leading-[1.7] mb-4">
                          {post.excerpt.length > 120
                            ? post.excerpt.slice(0, 120) + "..."
                            : post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">
                        <span>
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                        <span>·</span>
                        <span>{formatReadTime(post.content)}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-8">
                <p className="text-[12px] font-sans text-[var(--color-mid)]">
                  Menampilkan {offset + 1}–{Math.min(offset + LIMIT, total)} dari{" "}
                  {total} artikel
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={offset === 0}
                    onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
                    className="px-4 py-2 border border-[var(--color-border)] text-sm font-sans text-[var(--color-mid)] disabled:opacity-40 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    ← Sebelumnya
                  </button>
                  <button
                    disabled={offset + LIMIT >= total}
                    onClick={() => setOffset(o => o + LIMIT)}
                    className="px-4 py-2 border border-[var(--color-border)] text-sm font-sans text-[var(--color-mid)] disabled:opacity-40 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    Berikutnya →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}