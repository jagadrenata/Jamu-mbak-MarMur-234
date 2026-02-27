import { ok, err, requireUser } from "../../_lib/helpers.js";

export async function GET(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) return err("Address not found", 404);
    return ok({ data });
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  if (error) return err(error.message, 500);
  return ok({ data, total: data?.length ?? 0 });
}

export async function POST(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const { name, address, is_default } = body;

  if (!name || !address) return err("name and address are required");

  if (is_default) {
    await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .insert({ user_id: user.id, name, address, is_default: is_default ?? false })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Address added" }, 201);
}

export async function PATCH(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { data: existing } = await supabase.from("user_addresses").select("id").eq("id", id).eq("user_id", user.id).single();
  if (!existing) return err("Address not found", 404);

  const body = await request.json();

  if (body.is_default) {
    await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const allowed = ["name", "address", "is_default"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("user_addresses").update(updates).eq("id", id).select().single();
  if (error) return err(error.message, 500);
  return ok({ data, message: "Address updated" });
}

export async function DELETE(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { data: existing } = await supabase.from("user_addresses").select("id").eq("id", id).eq("user_id", user.id).single();
  if (!existing) return err("Address not found", 404);

  const { error } = await supabase.from("user_addresses").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Address deleted" });
}
