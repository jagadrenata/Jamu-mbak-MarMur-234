import { NextResponse } from "next/server";
import { ok, err, requireAdmin, paginate } from "@/lib/helpers";

export async function GET(request) {
  const { supabase } = await requireAdmin();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category_id = searchParams.get("category_id");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const { limit, offset } = paginate(searchParams);

  let query = supabase
    .from("products")
    .select(
      `id, category_id, name, slug, sku, description, status, views_count, created_at, updated_at,
       categories ( name, slug ),
       product_images ( url, is_primary ),
       product_variants ( price, is_active )`,
      { count: "exact" }
    )
    .order("id");

  if (id) query = query.eq("id", id);
  if (category_id) query = query.eq("category_id", category_id);
  if (status) query = query.eq("status", status);
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  query = query.range(offset, offset + limit - 1);

  const { data: raw, count, error } = await query;
  if (error) return err(error.message, 500);

  const data = (raw || []).map(p => {
    const primaryImg = (p.product_images || []).find(i => i.is_primary) ?? p.product_images?.[0];
    const activePrices = (p.product_variants || []).filter(v => v.is_active).map(v => v.price);
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
      min_price: activePrices.length ? Math.min(...activePrices) : null,
      max_price: activePrices.length ? Math.max(...activePrices) : null,
    };
  });

  return ok({ data, total: count, limit, offset });
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { name, slug, sku, description, status, category_id } = body;

  if (!name) return err("name is required");

  const { data, error } = await supabase
    .from("products")
    .insert({ name, slug, sku, description, status: status ?? "active", category_id: category_id ?? null })
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
  if (!id) return err("id is required");

  const body = await request.json();
  const allowed = ["name", "slug", "sku", "description", "status", "category_id"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
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
  if (!id) return err("id is required");

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Product deleted" });
}
