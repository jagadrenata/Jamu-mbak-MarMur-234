import { ok, err, requireAdmin } from "@/lib/helpers";
import { createAdminClient } from "@/lib/supabase/server";

const VALID_POSITIONS = ["hero", "mid", "footer", "sidebar"];

export async function GET(request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const position = searchParams.get("position");
  const is_active = searchParams.get("is_active");
  const now = new Date().toISOString();

  let query = supabase
    .from("banner_ads")
    .select("*", { count: "exact" })
    .order("position");

  if (is_active === "true") {
    query = query
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`);
  } else if (is_active === "false") {
    query = query.eq("is_active", false);
  }

  if (position) query = query.eq("position", position);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count });
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { title, image_url, link_url, position, is_active, start_date, end_date } = body;

  if (!image_url) return err("image_url is required");
  if (position && !VALID_POSITIONS.includes(position)) return err(`position must be one of: ${VALID_POSITIONS.join(", ")}`);

  const { data, error } = await supabase
    .from("banner_ads")
    .insert({ title: title ?? null, image_url, link_url: link_url ?? null, position: position ?? "hero", is_active: is_active ?? true, start_date: start_date ?? null, end_date: end_date ?? null })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Banner created" }, 201);
}

export async function PATCH(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();
  const allowed = ["title", "image_url", "link_url", "position", "is_active", "start_date", "end_date"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  if (updates.position && !VALID_POSITIONS.includes(updates.position)) return err(`position must be one of: ${VALID_POSITIONS.join(", ")}`);

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("banner_ads").update(updates).eq("id", id).select().single();
  if (error) return err(error.message, 500);
  return ok({ data, message: "Banner updated" });
}

export async function DELETE(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { error } = await supabase.from("banner_ads").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Banner deleted" });
}
