import { ok, err, requireAdmin } from "@/lib/helpers";

export async function GET(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const product_id = searchParams.get("product_id");
  const id = searchParams.get("id");

  let query = supabase
    .from("product_images")
    .select("*", { count: "exact" })
    .order("position");

  if (id) query = query.eq("id", id);
  else if (product_id) query = query.eq("product_id", product_id);
  else return err("product_id or id is required");

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count });
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { product_id, url, alt_text, description, is_primary, position } = body;

  if (!product_id || !url) return err("product_id and url are required");

  if (is_primary) {
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", product_id);
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id, url, alt_text: alt_text ?? null, description: description ?? null, is_primary: is_primary ?? false, position: position ?? 1 })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Image added" }, 201);
}

export async function PATCH(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();

  if (body.is_primary) {
    const { data: img } = await supabase.from("product_images").select("product_id").eq("id", id).single();
    if (img) await supabase.from("product_images").update({ is_primary: false }).eq("product_id", img.product_id);
  }

  const allowed = ["url", "alt_text", "description", "is_primary", "position"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase.from("product_images").update(updates).eq("id", id).select().single();
  if (error) return err(error.message, 500);
  return ok({ data, message: "Image updated" });
}

export async function DELETE(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { error } = await supabase.from("product_images").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Image deleted" });
}
