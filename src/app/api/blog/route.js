import { ok, err, requireAdmin, requireUser, paginate } from "@/lib/helpers";
import { createSessionClient } from "@/lib/supabase/server";

function getAction(searchParams) {
  return searchParams.get("action") || "";
}
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource");

  if (resource === "posts") {
    const slug = searchParams.get("slug");

    // Single post
    if (slug) {
      const supabase = await createSessionClient();
      const { data: post, error } = await supabase
        .from("blog_posts")
        .select(
          `
id, title, slug, content, excerpt, featured_image,
status, published_at, created_at, updated_at,
author:profiles!author_id(id, full_name, avatar_url),
blog_post_categories(
category:blog_categories(id, name, slug)
),
blog_comments(
id, content, guest_name, created_at, is_approved,
user:profiles!user_id(id, full_name, avatar_url)
)
`
        )
        .eq("slug", slug)
        .single();

      if (error || !post) return err("Post tidak ditemukan", 404);

      // Non-published admin only
      if (post.status !== "published") {
        const { admin } = await requireAdmin();
        if (!admin) return err("Post tidak ditemukan", 404);
      }

      // Filter: hanya komentar yang disetujui untuk publik
      post.blog_comments = post.blog_comments?.filter(c => c.is_approved) ?? [];
      return ok({ post });
    }

    // List posts
    const { limit, offset } = paginate(searchParams);
    const status = searchParams.get("status") || "published";
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";

    // Cek apakah admin untuk bisa akses status selain published
    const { admin } = await requireAdmin();
    const supabase = await createSessionClient();

    let query = supabase
      .from("blog_posts")
      .select(
        `
id, title, slug, excerpt, featured_image, status,
published_at, created_at, updated_at,
author:profiles!author_id(id, full_name, avatar_url),
blog_post_categories(
category:blog_categories(id, name, slug)
)
`,
        { count: "exact" }
      )
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (!admin) {
      query = query.eq("status", "published");
    } else if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) return err(error.message, 500);

    let posts = data ?? [];
    if (category) {
      posts = posts.filter(p =>
        p.blog_post_categories?.some(pc => pc.category?.slug === category)
      );
    }

    return ok({ posts, total: count, limit, offset });
  }

  if (resource === "categories") {
    const supabase = await createSessionClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .select("id, name, slug, description")
      .order("name");

    if (error) return err(error.message, 500);
    return ok({ categories: data });
  }

  if (resource === "comments") {
    const { supabase, response } = await requireAdmin();
    if (response) return response;

    const post_id = searchParams.get("post_id");
    const approved = searchParams.get("approved");

    let query = supabase
      .from("blog_comments")
      .select(
        `
id, content, guest_name, guest_email, is_approved, created_at, post_id,
user:profiles!user_id(id, full_name),
post:blog_posts!post_id(id, title, slug)
`
      )
      .order("created_at", { ascending: false });

    if (post_id) query = query.eq("post_id", post_id);
    if (approved !== null && approved !== "")
      query = query.eq("is_approved", approved === "true");

    const { data, error } = await query;
    if (error) return err(error.message, 500);
    return ok({ comments: data });
  }

  return err(
    "resource tidak dikenali. Gunakan: posts | categories | comments",
    400
  );
}

// ?resource=posts buat post baru (admin)
// ?resource=categories  buat kategori baru (admin)
// ?resource=comments  kirim komentar (publik/user)
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource");
  const body = await request.json();

  if (resource === "posts") {
    const { supabase, admin, response } = await requireAdmin();
    if (response) return response;

    const {
      title,
      slug,
      content,
      excerpt,
      featured_image,
      status,
      category_ids
    } = body;
    if (!title || !slug) return err("title dan slug wajib diisi");

    const { data: post, error } = await supabase
      .from("blog_posts")
      .insert({
        title,
        slug,
        content,
        excerpt,
        featured_image,
        status: status || "draft",
        author_id: admin.id,
        published_at: status === "published" ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) return err(error.message, 500);

    if (category_ids?.length) {
      await supabase
        .from("blog_post_categories")
        .insert(
          category_ids.map(cid => ({ post_id: post.id, category_id: cid }))
        );
    }

    return ok({ post }, 201);
  }
  import { ok, err, requireAdmin, requireUser, paginate } from "@/lib/helpers";
  import { createSessionClient } from "@/lib/supabase/server";

  function getAction(searchParams) {
    return searchParams.get("action") || "";
  }

  // GET  /api/blog
  //
  // ?resource=posts        → list posts (public: published only)
  // ?resource=posts&slug=  → single post + comments
  // ?resource=categories   → list all categories
  // ?resource=comments     → list comments (admin only, with filter)
  export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");

    if (resource === "posts") {
      const slug = searchParams.get("slug");

      // Single post
      if (slug) {
        const supabase = await createSessionClient();
        const { data: post, error } = await supabase
          .from("blog_posts")
          .select(
            `
          id, title, slug, content, excerpt, featured_image,
          status, published_at, created_at, updated_at,
          author:profiles!author_id(id, full_name, avatar_url),
          blog_post_categories(
            category:blog_categories(id, name, slug)
          ),
          blog_comments(
            id, content, guest_name, created_at, is_approved,
            user:profiles!user_id(id, full_name, avatar_url)
          )
        `
          )
          .eq("slug", slug)
          .single();

        if (error || !post) return err("Post tidak ditemukan", 404);

        // Non-published → admin only
        if (post.status !== "published") {
          const { admin } = await requireAdmin();
          if (!admin) return err("Post tidak ditemukan", 404);
        }

        // Filter: hanya komentar yang disetujui untuk publik
        post.blog_comments =
          post.blog_comments?.filter(c => c.is_approved) ?? [];
        return ok({ post });
      }

      // List posts
      const { limit, offset } = paginate(searchParams);
      const status = searchParams.get("status") || "published";
      const category = searchParams.get("category") || "";
      const search = searchParams.get("search") || "";

      // Cek apakah admin untuk bisa akses status selain published
      const { admin } = await requireAdmin();
      const supabase = await createSessionClient();

      let query = supabase
        .from("blog_posts")
        .select(
          `
        id, title, slug, excerpt, featured_image, status,
        published_at, created_at, updated_at,
        author:profiles!author_id(id, full_name, avatar_url),
        blog_post_categories(
          category:blog_categories(id, name, slug)
        )
      `,
          { count: "exact" }
        )
        .order("published_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (!admin) {
        query = query.eq("status", "published");
      } else if (status !== "all") {
        query = query.eq("status", status);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) return err(error.message, 500);

      let posts = data ?? [];
      if (category) {
        posts = posts.filter(p =>
          p.blog_post_categories?.some(pc => pc.category?.slug === category)
        );
      }

      return ok({ posts, total: count, limit, offset });
    }

    if (resource === "categories") {
      const supabase = await createSessionClient();
      const { data, error } = await supabase
        .from("blog_categories")
        .select("id, name, slug, description")
        .order("name");

      if (error) return err(error.message, 500);
      return ok({ categories: data });
    }

    if (resource === "comments") {
      const { supabase, response } = await requireAdmin();
      if (response) return response;

      const post_id = searchParams.get("post_id");
      const approved = searchParams.get("approved");

      let query = supabase
        .from("blog_comments")
        .select(
          `
        id, content, guest_name, guest_email, is_approved, created_at, post_id,
        user:profiles!user_id(id, full_name),
        post:blog_posts!post_id(id, title, slug)
      `
        )
        .order("created_at", { ascending: false });

      if (post_id) query = query.eq("post_id", post_id);
      if (approved !== null && approved !== "")
        query = query.eq("is_approved", approved === "true");

      const { data, error } = await query;
      if (error) return err(error.message, 500);
      return ok({ comments: data });
    }

    return err(
      "resource tidak dikenali. Gunakan: posts | categories | comments",
      400
    );
  }

  // POST  /api/blog
  //
  // ?resource=posts        → buat post baru (admin)
  // ?resource=categories   → buat kategori baru (admin)
  // ?resource=comments     → kirim komentar (publik/user)
  export async function POST(request) {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");
    const body = await request.json();

    if (resource === "posts") {
      const { supabase, admin, response } = await requireAdmin();
      if (response) return response;

      const {
        title,
        slug,
        content,
        excerpt,
        featured_image,
        status,
        category_ids
      } = body;
      if (!title || !slug) return err("title dan slug wajib diisi");

      const { data: post, error } = await supabase
        .from("blog_posts")
        .insert({
          title,
          slug,
          content,
          excerpt,
          featured_image,
          status: status || "draft",
          author_id: admin.id,
          published_at: status === "published" ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) return err(error.message, 500);

      if (category_ids?.length) {
        await supabase
          .from("blog_post_categories")
          .insert(
            category_ids.map(cid => ({ post_id: post.id, category_id: cid }))
          );
      }

      return ok({ post }, 201);
    }

    if (resource === "categories") {
      const { supabase, response } = await requireAdmin();
      if (response) return response;

      const { name, slug, description } = body;
      if (!name || !slug) return err("name dan slug wajib diisi");

      const { data, error } = await supabase
        .from("blog_categories")
        .insert({ name, slug, description })
        .select()
        .single();

      if (error) return err(error.message, 500);
      return ok({ category: data }, 201);
    }

    if (resource === "comments") {
      const { post_id, content, guest_name, guest_email } = body;
      if (!post_id || !content) return err("post_id dan content wajib diisi");

      const { supabase, user } = await requireUser();
      const commentData = { post_id, content, is_approved: false };

      if (user) {
        commentData.user_id = user.id;
      } else {
        if (!guest_name) return err("Nama wajib diisi untuk komentar tamu");
        commentData.guest_name = guest_name;
        commentData.guest_email = guest_email;
      }

      const { data, error } = await supabase
        .from("blog_comments")
        .insert(commentData)
        .select()
        .single();

      if (error) return err(error.message, 500);
      return ok(
        {
          comment: data,
          message: "Komentar menunggu persetujuan moderator"
        },
        201
      );
    }

    return err("resource tidak dikenali", 400);
  }

  // PATCH  /api/blog
  //
  // ?resource=posts&slug=      → update post (admin)
  // ?resource=categories&id=   → update kategori (admin)
  // ?resource=comments&id=     → approve/reject komentar (admin)
  export async function PATCH(request) {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");
    const body = await request.json();

    if (resource === "posts") {
      const slug = searchParams.get("slug");
      if (!slug) return err("slug wajib diisi");

      const { supabase, response } = await requireAdmin();
      if (response) return response;

      const {
        title,
        new_slug,
        content,
        excerpt,
        featured_image,
        status,
        category_ids
      } = body;
      const updateData = { updated_at: new Date().toISOString() };

      if (title !== undefined) updateData.title = title;
      if (new_slug !== undefined) updateData.slug = new_slug;
      if (content !== undefined) updateData.content = content;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (featured_image !== undefined)
        updateData.featured_image = featured_image;
      if (status) {
        updateData.status = status;
        if (status === "published")
          updateData.published_at = new Date().toISOString();
      }

      const { data: post, error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("slug", slug)
        .select()
        .single();

      if (error) return err(error.message, 500);

      if (category_ids !== undefined) {
        await supabase
          .from("blog_post_categories")
          .delete()
          .eq("post_id", post.id);
        if (category_ids.length) {
          await supabase
            .from("blog_post_categories")
            .insert(
              category_ids.map(cid => ({ post_id: post.id, category_id: cid }))
            );
        }
      }

      return ok({ post });
    }
    
    if (resource === "categories") {
      const id = searchParams.get("id");
      if (!id) return err("id wajib diisi");

      const { supabase, response } = await requireAdmin();
      if (response) return response;

      const { name, slug, description } = body;
      const { data, error } = await supabase
        .from("blog_categories")
        .update({ name, slug, description })
        .eq("id", id)
        .select()
        .single();

      if (error) return err(error.message, 500);
      return ok({ category: data });
    }
    
    if (resource === "comments") {
      const id = searchParams.get("id");
      if (!id) return err("id wajib diisi");

      const { supabase, response } = await requireAdmin();
      if (response) return response;

      const { is_approved } = body;
      const { data, error } = await supabase
        .from("blog_comments")
        .update({ is_approved })
        .eq("id", id)
        .select()
        .single();

      if (error) return err(error.message, 500);
      return ok({ comment: data });
    }

    return err("resource tidak dikenali", 400);
  }


  // DELETE  /api/blog
  //
  // ?resource=posts&slug=      → hapus post (admin)
  // ?resource=categories&id=   → hapus kategori (admin)
  // ?resource=comments&id=     → hapus komentar (admin)
  export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");

    const { supabase, response } = await requireAdmin();
    if (response) return response;
    
    if (resource === "posts") {
      const slug = searchParams.get("slug");
      if (!slug) return err("slug wajib diisi");

      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("slug", slug);
      if (error) return err(error.message, 500);
      return ok({ message: "Post berhasil dihapus" });
    }
    
    if (resource === "categories") {
      const id = searchParams.get("id");
      if (!id) return err("id wajib diisi");

      const { error } = await supabase
        .from("blog_categories")
        .delete()
        .eq("id", id);
      if (error) return err(error.message, 500);
      return ok({ message: "Kategori berhasil dihapus" });
    }

    if (resource === "comments") {
      const id = searchParams.get("id");
      if (!id) return err("id wajib diisi");

      const { error } = await supabase
        .from("blog_comments")
        .delete()
        .eq("id", id);
      if (error) return err(error.message, 500);
      return ok({ message: "Komentar berhasil dihapus" });
    }

    return err("resource tidak dikenali", 400);
  }

  if (resource === "categories") {
    const { supabase, response } = await requireAdmin();
    if (response) return response;

    const { name, slug, description } = body;
    if (!name || !slug) return err("name dan slug wajib diisi");

    const { data, error } = await supabase
      .from("blog_categories")
      .insert({ name, slug, description })
      .select()
      .single();

    if (error) return err(error.message, 500);
    return ok({ category: data }, 201);
  }

  if (resource === "comments") {
    const { post_id, content, guest_name, guest_email } = body;
    if (!post_id || !content) return err("post_id dan content wajib diisi");

    const { supabase, user } = await requireUser();
    const commentData = { post_id, content, is_approved: false };

    if (user) {
      commentData.user_id = user.id;
    } else {
      if (!guest_name) return err("Nama wajib diisi untuk komentar tamu");
      commentData.guest_name = guest_name;
      commentData.guest_email = guest_email;
    }

    const { data, error } = await supabase
      .from("blog_comments")
      .insert(commentData)
      .select()
      .single();

    if (error) return err(error.message, 500);
    return ok(
      {
        comment: data,
        message: "Komentar menunggu persetujuan moderator"
      },
      201
    );
  }

  return err("resource tidak dikenali", 400);
}

// PATCH/api/blog
//
// ?resource=posts&slug= update post (admin)
// ?resource=categories&id=  update kategori (admin)
// ?resource=comments&id=  approve/reject komentar (admin)
export async function PATCH(request) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource");
  const body = await request.json();

  if (resource === "posts") {
    const slug = searchParams.get("slug");
    if (!slug) return err("slug wajib diisi");

    const { supabase, response } = await requireAdmin();
    if (response) return response;

    const {
      title,
      new_slug,
      content,
      excerpt,
      featured_image,
      status,
      category_ids
    } = body;
    const updateData = { updated_at: new Date().toISOString() };

    if (title !== undefined) updateData.title = title;
    if (new_slug !== undefined) updateData.slug = new_slug;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featured_image !== undefined)
      updateData.featured_image = featured_image;
    if (status) {
      updateData.status = status;
      if (status === "published")
        updateData.published_at = new Date().toISOString();
    }

    const { data: post, error } = await supabase
      .from("blog_posts")
      .update(updateData)
      .eq("slug", slug)
      .select()
      .single();

    if (error) return err(error.message, 500);

    if (category_ids !== undefined) {
      await supabase
        .from("blog_post_categories")
        .delete()
        .eq("post_id", post.id);
      if (category_ids.length) {
        await supabase
          .from("blog_post_categories")
          .insert(
            category_ids.map(cid => ({ post_id: post.id, category_id: cid }))
          );
      }
    }

    return ok({ post });
  }

  if (resource === "categories") {
    const id = searchParams.get("id");
    if (!id) return err("id wajib diisi");

    const { supabase, response } = await requireAdmin();
    if (response) return response;

    const { name, slug, description } = body;
    const { data, error } = await supabase
      .from("blog_categories")
      .update({ name, slug, description })
      .eq("id", id)
      .select()
      .single();

    if (error) return err(error.message, 500);
    return ok({ category: data });
  }

  if (resource === "comments") {
    const id = searchParams.get("id");
    if (!id) return err("id wajib diisi");

    const { supabase, response } = await requireAdmin();
    if (response) return response;

    const { is_approved } = body;
    const { data, error } = await supabase
      .from("blog_comments")
      .update({ is_approved })
      .eq("id", id)
      .select()
      .single();

    if (error) return err(error.message, 500);
    return ok({ comment: data });
  }

  return err("resource tidak dikenali", 400);
}

// ?resource=posts&slug= hapus post (admin)
// ?resource=categories&id=  hapus kategori (admin)
// ?resource=comments&id=  hapus komentar (admin)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource");

  const { supabase, response } = await requireAdmin();
  if (response) return response;

  if (resource === "posts") {
    const slug = searchParams.get("slug");
    if (!slug) return err("slug wajib diisi");

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("slug", slug);
    if (error) return err(error.message, 500);
    return ok({ message: "Post berhasil dihapus" });
  }

  if (resource === "categories") {
    const id = searchParams.get("id");
    if (!id) return err("id wajib diisi");

    const { error } = await supabase
      .from("blog_categories")
      .delete()
      .eq("id", id);
    if (error) return err(error.message, 500);
    return ok({ message: "Kategori berhasil dihapus" });
  }

  if (resource === "comments") {
    const id = searchParams.get("id");
    if (!id) return err("id wajib diisi");

    const { error } = await supabase
      .from("blog_comments")
      .delete()
      .eq("id", id);
    if (error) return err(error.message, 500);
    return ok({ message: "Komentar berhasil dihapus" });
  }

  return err("resource tidak dikenali", 400);
}
