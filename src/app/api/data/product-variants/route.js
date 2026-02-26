import { ok, err, requireAdmin, paginate } from "@/lib/helpers";

export async function GET(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const product_id = searchParams.get("product_id");
  const is_active = searchParams.get("is_active");
  const { limit, offset } = paginate(searchParams);

  let query = supabase
    .from("product_variants")
    .select(
      `id, product_id, name, sku, price, cost_price, quantity, weight, attributes, is_active, created_at, updated_at,
       product_variant_images ( url, alt_text, is_primary, position )`,
      { count: "exact" }
    )
    .order("id")
    .range(offset, offset + limit - 1);

  if (id) query = query.eq("id", id);
  if (product_id) query = query.eq("product_id", product_id);
  if (is_active !== null) query = query.eq("is_active", is_active === "true");

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count, limit, offset });
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { product_id, name, sku, price, cost_price, quantity, weight, attributes, is_active } = body;

  if (!product_id || !sku || price === undefined) return err("product_id, sku, and price are required");

  const { data, error } = await supabase
    .from("product_variants")
    .insert({ product_id, name, sku, price, cost_price: cost_price ?? 0, quantity: quantity ?? 0, weight: weight ?? 0, attributes: attributes ?? null, is_active: is_active ?? true })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Variant created" }, 201);
}

export async function PATCH(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();
  const allowed = ["name", "sku", "price", "cost_price", "quantity", "weight", "attributes", "is_active"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("product_variants")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Variant updated" });
}

export async function DELETE(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { error } = await supabase.from("product_variants").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Variant deleted" });
}
