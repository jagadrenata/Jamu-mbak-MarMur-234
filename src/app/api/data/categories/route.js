import { ok, err, requireAdmin } from "@/lib/helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const parent_id = searchParams.get("parent_id");
  const status = searchParams.get("status");

  let query = supabase.from("categories").select("*", { count: "exact" }).order("id");

  if (id) query = query.eq("id", id);
  if (parent_id !== null) {
    query = parent_id === "" || parent_id === "0"
      ? query.is("parent_id", null)
      : query.eq("parent_id", parent_id);
  }
  if (status) query = query.eq("status", status);

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
    .insert({ name, slug: slug ?? null, description: description ?? null, parent_id: parent_id ?? null, status: "active" })
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
  const action = searchParams.get("action");

  if (!id) return err("id is required");

  if (action === "restore") {
    const { data, error } = await supabase
      .from("categories")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "archived")
      .select()
      .single();

    if (error) return err(error.message, 500);
    if (!data) return err("Category not found or not archived", 404);
    return ok({ data, message: "Category restored" });
  }

  const body = await request.json();
  const allowed = ["name", "slug", "description", "parent_id", "status"];
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
  const permanent = searchParams.get("permanent") === "true";

  if (!id) return err("id is required");

  if (permanent) {
    const { data: existing, error: fetchError } = await supabase
      .from("categories")
      .select("id, status")
      .eq("id", id)
      .single();

    if (fetchError || !existing) return err("Category not found", 404);

    if (existing.status !== "archived") {
      return err("Category must be archived before permanent deletion", 400);
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return err(error.message, 500);
    return ok({ message: "Category permanently deleted" });
  }

  const { error } = await supabase
    .from("categories")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return err(error.message, 500);
  return ok({ message: "Category archived" });
}
