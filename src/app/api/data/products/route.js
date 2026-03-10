import { ok, err, requireAdmin, paginate } from "@/lib/helpers";

export async function GET(request) {
  const { supabase } = await requireAdmin();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category_id = searchParams.get("category_id");
  const status = searchParams.get("status");
  const exclude_status = searchParams.get("exclude_status");
  const search = searchParams.get("search");
  const detail = searchParams.get("detail");
  const { limit, offset } = paginate(searchParams);

  if (id && detail) {
    const { data: raw, error } = await supabase
      .from("products")
      .select(
        `id, category_id, name, slug, sku, description, status, views_count, created_at, updated_at,
         categories ( id, name, slug ),
         product_images ( id, url, alt_text, description, is_primary, position, created_at ),
         product_variants (
           id, name, sku, price, cost_price, quantity, weight, attributes, is_active, created_at, updated_at,
           product_variant_images ( id, url, alt_text, is_primary, position )
         )`
      )
      .eq("id", id)
      .single();

    if (error) return err(error.message, 500);

    const productImages = (raw.product_images || []).sort(
      (a, b) => a.position - b.position
    );
    const productVariants = (raw.product_variants || []).map(v => ({
      ...v,
      product_variant_images: (v.product_variant_images || []).sort(
        (a, b) => a.position - b.position
      )
    }));

    return ok({
      data: {
        ...raw,
        categories: undefined,
        product_images: undefined,
        product_variants: undefined,
        category: raw.categories ?? null,
        images: productImages,
        variants: productVariants
      }
    });
  }

  let query = supabase
    .from("products")
    .select(
      `id, category_id, name, slug, sku, description, status, views_count, created_at, updated_at,
       categories ( name, slug ),
       product_images ( url, is_primary ),
       product_variants ( price, is_active )`,
      { count: "exact" }
    )
    .order("updated_at", { ascending: false });

  if (id) query = query.eq("id", id);
  if (category_id) query = query.eq("category_id", category_id);
  if (status) query = query.eq("status", status);
  if (exclude_status) query = query.neq("status", exclude_status);
  if (search)
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

  query = query.range(offset, offset + limit - 1);

  const { data: raw, count, error } = await query;
  if (error) return err(error.message, 500);

  const data = (raw || []).map(p => {
    const primaryImg =
      (p.product_images || []).find(i => i.is_primary) ?? p.product_images?.[0];
    const activePrices = (p.product_variants || [])
      .filter(v => v.is_active)
      .map(v => v.price);
    return {
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      status: p.status,
      views_count: p.views_count,
      created_at: p.created_at,
      updated_at: p.updated_at,
      category_name: p.categories?.name ?? null,
      category_slug: p.categories?.slug ?? null,
      primary_image: primaryImg?.url ?? null,
      variant_count: (p.product_variants || []).length,
      min_price: activePrices.length ? Math.min(...activePrices) : null,
      max_price: activePrices.length ? Math.max(...activePrices) : null
    };
  });

  return ok({ data, total: count, limit, offset });
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { name, slug, sku, description, status, category_id } = body;

  if (!name?.trim()) return err("name is required");

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: name.trim(),
      slug: slug?.trim() || null,
      sku: sku?.trim() || null,
      description: description?.trim() || null,
      status: status ?? "active",
      category_id: category_id ? parseInt(category_id) : null
    })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Product created" }, 201);
}

export async function PATCH(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");

  if (!id) return err("id is required");

  if (action === "restore") {
    const { data, error } = await supabase
      .from("products")
      .update({ status: "draft", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "archived")
      .select()
      .single();

    if (error) return err(error.message, 500);
    if (!data) return err("Product not found or not archived", 404);
    return ok({ data, message: "Product restored" });
  }

  const body = await request.json();
  const allowed = [
    "name",
    "slug",
    "sku",
    "description",
    "status",
    "category_id"
  ];
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  if (updates.status === "archived") {
    return err("Use DELETE to archive a product", 400);
  }

  if (Object.keys(updates).length === 0)
    return err("No valid fields to update");

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Product updated" });
}

export async function DELETE(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const permanent = searchParams.get("permanent") === "true";

  if (!id) return err("id is required");

  if (permanent) {
    const { data: existing, error: fetchError } = await supabase
      .from("products")
      .select("id, status")
      .eq("id", id)
      .single();

    if (fetchError || !existing) return err("Product not found", 404);

    if (existing.status !== "archived") {
      return err("Product must be archived before permanent deletion", 400);
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return err(error.message, 500);
    return ok({ message: "Product permanently deleted" });
  }

  const { error } = await supabase
    .from("products")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return err(error.message, 500);
  return ok({ message: "Product archived" });
}
