"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Clock, User, Tag, ArrowLeft, MessageCircle, ChevronRight, Send, CheckCircle } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { blogPosts, blogComments } from "@/lib/api";

function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function CommentForm({ postId, onSubmitted }) {
  const [form, setForm] = useState({ content: "", guest_name: "", guest_email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.content.trim()) return setError("Komentar tidak boleh kosong");
    if (!form.guest_name.trim()) return setError("Nama wajib diisi");
    setLoading(true);
    try {
      await blogComments.create({ post_id: postId, ...form });
      setSent(true);
      onSubmitted?.();
    } catch (e) {
      setError(e.message || "Gagal mengirim komentar");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 flex items-center gap-3 text-[var(--color-mid)] font-sans text-sm">
        <CheckCircle className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0" />
        Komentar Anda telah dikirim dan menunggu persetujuan moderator. Terima kasih!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Nama *</label>
          <input
            type="text"
            value={form.guest_name}
            onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
            placeholder="Nama Anda"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Email (opsional)</label>
          <input
            type="email"
            value={form.guest_email}
            onChange={e => setForm(f => ({ ...f, guest_email: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors"
            placeholder="email@contoh.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-[0.15em] font-sans text-[var(--color-mid)] mb-1.5">Komentar *</label>
        <textarea
          rows={4}
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-sans outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
          placeholder="Tulis komentar Anda di sini..."
        />
      </div>
      {error && <p className="text-[12px] text-red-500 font-sans">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 border border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-text-light)] px-5 py-2.5 text-[13px] font-semibold font-sans hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {loading ? "Mengirim..." : "Kirim Komentar"}
      </button>
    </form>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  async function fetchPost() {
    try {
      const data = await blogPosts.getBySlug(slug);
      setPost(data.post);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPost(); }, [slug]);

  useEffect(() => {
    if (!post) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-up").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [post]);

  const categories = post?.blog_post_categories?.map(pc => pc.category).filter(Boolean) ?? [];
  const comments   = post?.blog_comments ?? [];

  if (notFound) {
    return (
      <PublicLayout heroTitle="Artikel Tidak Ditemukan" sectionTitle="Jamu Mbak MarMur">
        <div className="text-center py-16 space-y-4">
          <p className="text-[var(--color-mid)] font-sans text-sm">Artikel tidak ada atau telah dihapus.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--color-accent)] font-sans text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Blog
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout
      heroTitle={loading ? "Memuat artikel…" : post?.title}
      heroSubtitle={post?.excerpt ?? ""}
      sectionTitle="Jamu Mbak MarMur"
    >
      <style>{`
        .fade-up { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade-up.is-visible { opacity: 1; transform: none; }
        .prose-content h2 { font-family: var(--font-serif, Georgia, serif); font-size: 1.25rem; font-weight: 700; margin: 1.8rem 0 0.75rem; color: var(--color-text); }
        .prose-content h3 { font-family: var(--font-serif, Georgia, serif); font-size: 1.1rem; font-weight: 700; margin: 1.4rem 0 0.5rem; color: var(--color-text); }
        .prose-content p { margin: 0 0 1.1rem; }
        .prose-content ul, .prose-content ol { padding-left: 1.4rem; margin: 0 0 1.1rem; }
        .prose-content li { margin-bottom: 0.3rem; }
        .prose-content blockquote { border-left: 3px solid var(--color-accent); padding-left: 1rem; color: var(--color-mid); font-style: italic; margin: 1.4rem 0; }
        .prose-content a { color: var(--color-accent); }
        .prose-content img { max-width: 100%; height: auto; }
        .prose-content strong { color: var(--color-text); }
      `}</style>

      {loading ? (
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-6 w-2/3 bg-[var(--color-border)] rounded" />
          <div className="aspect-[16/7] bg-[var(--color-border)]" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-3 bg-[var(--color-border)] rounded" />)}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-10">
          <nav className="fade-up is-visible flex items-center gap-1.5 text-[11px] text-[var(--color-mid)] font-sans uppercase tracking-[0.12em]">
            <Link href="/blog" className="hover:text-[var(--color-accent)] transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--color-text)] truncate max-w-[200px]">{post.title}</span>
          </nav>

          <div className="fade-up is-visible space-y-3">
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.slug}`}
                    className="text-[10px] tracking-[0.18em] uppercase font-sans px-2 py-0.5 border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-text-light)] transition-colors"
                  >
                    <Tag className="w-3 h-3 inline-block mr-1 -mt-0.5" /> {cat.name}
                  </Link>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-4 text-[12px] text-[var(--color-mid)] font-sans">
              {post.author?.full_name && (
                <span className="flex items-center gap-1.5">
                  {post.author.avatar_url && <img src={post.author.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />}
                  <User className="w-3.5 h-3.5" /> {post.author.full_name}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {formatDate(post.published_at)}
                </span>
              )}
            </div>
          </div>

          {post.featured_image && (
            <div className="fade-up is-visible relative">
              <div className="absolute -inset-2 border border-[var(--color-border)] z-0" />
              <img src={post.featured_image} alt={post.title} className="w-full aspect-[16/7] object-cover relative z-10" />
            </div>
          )}

          <article
            className="fade-up prose-content text-[14px] leading-[1.9] text-[var(--color-mid)] font-sans"
            dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
          />

          <div className="h-px bg-[var(--color-border)]" />

          <div className="fade-up space-y-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="font-serif font-bold text-[var(--color-text)] text-lg">
                Komentar ({comments.length})
              </h2>
            </div>

            {comments.length > 0 && (
              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c.id} className="border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[12px] text-[var(--color-mid)] font-sans">
                      <span className="font-semibold text-[var(--color-text)]">
                        {c.user?.full_name || c.guest_name || "Anonim"}
                      </span>
                      <span>·</span>
                      <span>{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-[13px] leading-[1.75] text-[var(--color-mid)] font-sans">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 space-y-4">
              <h3 className="font-serif font-bold text-[var(--color-text)] text-base">Tinggalkan Komentar</h3>
              <p className="text-[12px] text-[var(--color-mid)] font-sans">Komentar akan ditampilkan setelah melalui moderasi.</p>
              <CommentForm postId={post.id} onSubmitted={fetchPost} />
            </div>
          </div>

          <div className="fade-up pt-2">
            <Link href="/blog" className="inline-flex items-center gap-2 text-[13px] font-semibold font-sans text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Blog
            </Link>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
