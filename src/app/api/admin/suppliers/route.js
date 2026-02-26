import { ok, err, requireAdmin, paginate } from "@/lib/helpers";

export async function GET(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const search = searchParams.get("search");
  const { limit, offset } = paginate(searchParams);

  if (id) {
    const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single();
    if (error || !data) return err("Supplier not found", 404);
    return ok({ data });
  }

  let query = supabase
    .from("suppliers")
    .select("*", { count: "exact" })
    .order("id")
    .range(offset, offset + limit - 1);

  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count, limit, offset });
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { name, contact, email, phone, address } = body;

  if (!name) return err("name is required");

  const { data, error } = await supabase
    .from("suppliers")
    .insert({ name, contact: contact ?? null, email: email ?? null, phone: phone ?? null, address: address ?? null })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Supplier created" }, 201);
}

export async function PATCH(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();
  const allowed = ["name", "contact", "email", "phone", "address"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("suppliers").update(updates).eq("id", id).select().single();
  if (error) return err(error.message, 500);
  return ok({ data, message: "Supplier updated" });
}

export async function DELETE(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Supplier deleted" });
}
