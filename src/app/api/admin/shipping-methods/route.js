import { ok, err, requireAdmin } from "@/lib/helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const is_active = searchParams.get("is_active");

  let query = supabase.from("shipping_methods").select("*", { count: "exact" }).order("id");
  if (is_active !== null) query = query.eq("is_active", is_active === "true");

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count });
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { name, code, price, estimated_time, is_active } = body;

  if (!name || !code) return err("name and code are required");

  const { data, error } = await supabase
    .from("shipping_methods")
    .insert({ name, code: code.toUpperCase(), price: price ?? 0, estimated_time: estimated_time ?? null, is_active: is_active ?? true })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Shipping method created" }, 201);
}

export async function PATCH(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();
  const allowed = ["name", "code", "price", "estimated_time", "is_active"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  if (updates.code) updates.code = updates.code.toUpperCase();

  const { data, error } = await supabase.from("shipping_methods").update(updates).eq("id", id).select().single();
  if (error) return err(error.message, 500);
  return ok({ data, message: "Shipping method updated" });
}

export async function DELETE(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { error } = await supabase.from("shipping_methods").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Shipping method deleted" });
}
