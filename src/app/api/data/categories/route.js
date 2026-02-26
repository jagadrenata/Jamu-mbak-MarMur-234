import { ok, err, requireAdmin } from "@/lib/helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const parent_id = searchParams.get("parent_id");

  let query = supabase.from("categories").select("*", { count: "exact" }).order("id");

  if (id) query = query.eq("id", id);
  if (parent_id !== null) {
    query = parent_id === "" || parent_id === "0"
      ? query.is("parent_id", null)
      : query.eq("parent_id", parent_id);
  }

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count });
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { name, slug, description, parent_id } = body;
  if (!name) return err("name is required");

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug: slug ?? null, description: description ?? null, parent_id: parent_id ?? null })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Category created" }, 201);
}

export async function PATCH(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();
  const allowed = ["name", "slug", "description", "parent_id"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().single();
  if (error) return err(error.message, 500);
  return ok({ data, message: "Category updated" });
}

export async function DELETE(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Category deleted" });
}
