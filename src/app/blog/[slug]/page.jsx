"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  User,
  Tag,
  ArrowLeft,
  MessageCircle,
  ChevronRight,
  Send,
  CheckCircle,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  Bookmark,
  Eye,
  Heart,
  Printer,
  ChevronUp
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { blogPosts, blogComments } from "@/lib/api";

function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatReadTime(content) {
  if (!content) return "1 min";
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min`;
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="reading-progress">
      <div
        className="reading-progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function TableOfContents({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!content) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const h2s = tempDiv.querySelectorAll('h2');
    const h3s = tempDiv.querySelectorAll('h3');

    const allHeadings = [];
    h2s.forEach((h2, index) => {
      const id = `heading-${index}`;
      h2.id = id;
      allHeadings.push({ id, text: h2.textContent, level: 2 });
    });

    h3s.forEach((h3, index) => {
      const id = `heading-h3-${index}`;
      h3.id = id;
      allHeadings.push({ id, text: h3.textContent, level: 3 });
    });

    setHeadings(allHeadings);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 sticky top-24">
      <h3 className="font-serif font-bold text-[var(--color-text)] text-sm mb-3">Daftar Isi</h3>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => {
              const element = document.getElementById(heading.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className={`block w-full text-left text-xs font-sans transition-colors hover:text-[var(--color-accent)] ${
              activeId === heading.id
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-mid)]'
            } ${heading.level === 3 ? 'ml-3' : ''}`}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  );
}

function SocialShare({ title, slug }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="social-share flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-[0.12em] font-sans text-[var(--color-mid)]">Bagikan:</span>
      <div className="flex gap-1">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="social-share-button w-8 h-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"
          title="Bagikan ke Facebook"
        >
          <Facebook className="w-4 h-4 text-[var(--color-mid)]" />
        </a>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="social-share-button w-8 h-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"
          title="Bagikan ke Twitter"
        >
          <Twitter className="w-4 h-4 text-[var(--color-mid)]" />
        </a>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="social-share-button w-8 h-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"
          title="Bagikan ke WhatsApp"
        >
          <svg className="w-4 h-4 text-[var(--color-mid)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </a>
        <button
          onClick={copyToClipboard}
          className="social-share-button w-8 h-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"
          title="Salin link"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-[var(--color-mid)]" />
          )}
        </button>
      </div>
    </div>
  );
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

function RelatedPosts({ currentPostId, categories }) {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categories.length > 0) {
      const categorySlug = categories[0].slug;
      blogPosts.list({ category: categorySlug, limit: 3, status: 'published' })
        .then(data => {
          setRelatedPosts(data.posts?.filter(p => p.id !== currentPostId) || []);
        })
        .catch(() => setRelatedPosts([]))
        .finally(() => setLoading(false));
    }
  }, [currentPostId, categories]);

  if (loading || relatedPosts.length === 0) return null;

  return (
    <div className="border-t border-[var(--color-border)] pt-12">
      <h3 className="font-serif font-bold text-[var(--color-text)] text-xl mb-6">Artikel Terkait</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map(post => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="related-post group block border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden hover:shadow-md transition-shadow"
          >
            {post.featured_image && (
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="related-post-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <h4 className="font-serif font-bold text-[var(--color-text)] text-sm leading-snug mb-2 group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                {post.title}
              </h4>
              <p className="text-[11px] text-[var(--color-mid)] font-sans">
                {formatDate(post.published_at)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function BlogDetailPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [postData, commentsData] = await Promise.all([
          blogPosts.get(params.slug),
          blogComments.list({ post_slug: params.slug, status: 'approved' })
        ]);
        setPost(postData);
        setComments(commentsData.comments || []);
      } catch (e) {
        setError(e.message || "Gagal memuat artikel");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.slug]);

  useEffect(() => {
    if (post?.content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = post.content;
      const headings = tempDiv.querySelectorAll('h2, h3');
      setShowTOC(headings.length > 2);
    }
  }, [post]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const printArticle = () => {
    window.print();
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-4xl">
            <div className="h-8 bg-[var(--color-border)] rounded w-3/4"></div>
            <div className="h-4 bg-[var(--color-border)] rounded w-1/2"></div>
            <div className="h-64 bg-[var(--color-border)] rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-[var(--color-border)] rounded"></div>
              <div className="h-4 bg-[var(--color-border)] rounded w-5/6"></div>
              <div className="h-4 bg-[var(--color-border)] rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !post) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="font-serif font-bold text-2xl text-[var(--color-text)]">Artikel Tidak Ditemukan</h1>
            <p className="text-[var(--color-mid)] font-sans">{error || "Artikel yang Anda cari tidak tersedia."}</p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 border border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-text-light)] px-6 py-3 text-sm font-semibold font-sans hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Blog
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <style>{`
        .reading-progress {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--color-border);
          z-index: 1000;
        }
        .reading-progress-bar {
          height: 100%;
          background: var(--color-accent);
          transition: width 0.15s ease-out;
        }
        .toc-active {
          color: var(--color-accent);
          font-weight: 600;
        }
        .social-share-button {
          transition: all 0.2s ease;
        }
        .social-share-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .comment-avatar {
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-dark, var(--color-accent)));
        }
        .related-post-image {
          transition: transform 0.3s ease;
        }
        .related-post:hover .related-post-image {
          transform: scale(1.05);
        }
        .prose-content {
          line-height: 1.8;
        }
        .prose-content h2, .prose-content h3, .prose-content h4 {
          scroll-margin-top: 100px;
        }
        .prose-content img {
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .prose-content blockquote {
          border-left: 4px solid var(--color-accent);
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: var(--color-mid);
        }
        .prose-content code {
          background: var(--color-bg-card);
          padding: 0.125rem 0.25rem;
          border-radius: 3px;
          font-size: 0.875em;
        }
        .prose-content pre {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
        }
        .prose-content pre code {
          background: none;
          padding: 0;
        }
        @media print {
          .reading-progress, .social-share, .comment-form, .sidebar, .breadcrumb {
            display: none !important;
          }
          .prose-content {
            font-size: 12pt;
            line-height: 1.5;
          }
          .article-header {
            break-after: avoid;
          }
        }
      `}</style>

      <ReadingProgress />

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm font-sans">
            <Link href="/" className="text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--color-mid)]" />
            <Link href="/blog" className="text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--color-mid)]" />
            <span className="text-[var(--color-text)] truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Article Header */}
            <header className="article-header space-y-6">
              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/blog?category=${cat.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent)] text-[var(--color-text-light)] text-xs font-semibold font-sans uppercase tracking-wide hover:opacity-90 transition-opacity"
                    >
                      <Tag className="w-3 h-3" />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl text-[var(--color-text)] leading-tight">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm font-sans text-[var(--color-mid)]">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author?.name || "Admin"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{formatReadTime(post.content)}</span>
                </div>
              </div>

              {/* Social Share & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
                <SocialShare title={post.title} slug={post.slug} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={printArticle}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-sans text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors"
                    title="Cetak artikel"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak
                  </button>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-sans text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {comments.length} Komentar
                  </button>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="aspect-[16/9] overflow-hidden bg-[var(--color-border)]">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div
              ref={contentRef}
              className="prose-content prose prose-lg max-w-none font-sans text-[var(--color-text)] prose-headings:font-serif prose-headings:text-[var(--color-text)] prose-p:text-[var(--color-text)] prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline prose-strong:text-[var(--color-text)] prose-code:text-[var(--color-accent)] prose-pre:bg-[var(--color-bg-card)] prose-pre:border prose-pre:border-[var(--color-border)] prose-blockquote:border-l-[var(--color-accent)] prose-blockquote:text-[var(--color-mid)]"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Article Footer */}
            <footer className="border-t border-[var(--color-border)] pt-8 space-y-6">
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-[var(--color-text)] text-sm">Tag:</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Link
                        key={tag.id}
                        href={`/blog?tag=${tag.slug}`}
                        className="px-3 py-1.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-mid)] text-xs font-sans hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Share */}
              <div className="flex items-center justify-between">
                <SocialShare title={post.title} slug={post.slug} />
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-sans text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors">
                    <Bookmark className="w-4 h-4" />
                    Simpan
                  </button>
                  <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-sans text-[var(--color-mid)] hover:text-[var(--color-accent)] transition-colors">
                    <Heart className="w-4 h-4" />
                    Suka
                  </button>
                </div>
              </div>
            </footer>

            {/* Comments Section */}
            {showComments && (
              <div className="border-t border-[var(--color-border)] pt-8 space-y-6">
                <h3 className="font-serif font-bold text-xl text-[var(--color-text)]">
                  Komentar ({comments.length})
                </h3>

                {/* Comments List */}
                {comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map(comment => (
                      <div key={comment.id} className="border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
                        <div className="flex items-start gap-3">
                          <div className="comment-avatar w-10 h-10 bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-light)] font-serif font-bold text-sm flex-shrink-0">
                            {comment.guest_name?.charAt(0).toUpperCase() || "A"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-serif font-semibold text-[var(--color-text)] text-sm">
                                {comment.guest_name}
                              </span>
                              <span className="text-[11px] text-[var(--color-mid)] font-sans">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-[var(--color-text)] font-sans text-sm leading-relaxed whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-mid)] font-sans text-sm">
                    Belum ada komentar. Jadilah yang pertama berkomentar!
                  </p>
                )}

                {/* Comment Form */}
                <div className="comment-form border-t border-[var(--color-border)] pt-6">
                  <h4 className="font-serif font-bold text-lg text-[var(--color-text)] mb-4">
                    Tinggalkan Komentar
                  </h4>
                  <CommentForm
                    postId={post.id}
                    onSubmitted={() => {
                      // Refresh comments
                      blogComments.list({ post_slug: params.slug, status: 'approved' })
                        .then(data => setComments(data.comments || []));
                    }}
                  />
                </div>
              </div>
            )}

            {/* Related Posts */}
            <RelatedPosts currentPostId={post.id} categories={post.categories || []} />
          </div>

          {/* Sidebar */}
          <div className="sidebar lg:col-span-1 space-y-6">
            {/* Table of Contents */}
            {showTOC && <TableOfContents content={post.content} />}

            {/* Author Info */}
            {post.author && (
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 sticky top-24">
                <h3 className="font-serif font-bold text-[var(--color-text)] text-sm mb-3">Tentang Penulis</h3>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-light)] font-serif font-bold text-lg flex-shrink-0">
                    {post.author.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="font-serif font-semibold text-[var(--color-text)] text-sm mb-1">
                      {post.author.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-mid)] font-sans leading-relaxed">
                      {post.author.bio || "Penulis konten di Jamu Mbak Mar Mur."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4">
              <h3 className="font-serif font-bold text-[var(--color-text)] text-sm mb-3">Tindakan Cepat</h3>
              <div className="space-y-2">
                <Link
                  href="/blog"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-sans text-[var(--color-mid)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-card)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Blog
                </Link>
                <button
                  onClick={scrollToTop}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-sans text-[var(--color-mid)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-card)] transition-colors w-full text-left"
                >
                  <ChevronUp className="w-4 h-4" />
                  Kembali ke Atas
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}
