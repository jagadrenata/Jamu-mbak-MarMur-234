import { ok, err, requireAdmin, paginate } from "@/lib/helpers";

export async function GET(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const is_active = searchParams.get("is_active");
  const { limit, offset } = paginate(searchParams);

  if (id) {
    const { data, error } = await supabase.from("promo_codes").select("*").eq("id", id).single();
    if (error || !data) return err("Promo code not found", 404);
    return ok({ data });
  }

  let query = supabase
    .from("promo_codes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (is_active !== null) query = query.eq("is_active", is_active === "true");

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count, limit, offset });
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { code, type, value, min_purchase, max_discount, usage_limit, expires_at, is_active } = body;

  if (!code || !type || value === undefined) return err("code, type, and value are required");
  if (!["percent", "fixed"].includes(type)) return err("type must be percent or fixed");

  const { data, error } = await supabase
    .from("promo_codes")
    .insert({ code: code.toUpperCase(), type, value, min_purchase: min_purchase ?? 0, max_discount: max_discount ?? null, usage_limit: usage_limit ?? null, expires_at: expires_at ?? null, is_active: is_active ?? true })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Promo code created" }, 201);
}

export async function PATCH(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();
  const allowed = ["code", "type", "value", "min_purchase", "max_discount", "usage_limit", "expires_at", "is_active", "target_users"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  if (updates.code) updates.code = updates.code.toUpperCase();

  const { data, error } = await supabase.from("promo_codes").update(updates).eq("id", id).select().single();
  if (error) return err(error.message, 500);
  return ok({ data, message: "Promo code updated" });
}

export async function DELETE(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Promo code deleted" });
}
