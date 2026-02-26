import { ok, err, requireAdmin, paginate } from "@/lib/helpers";

export async function GET(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const role = searchParams.get("role");
  const search = searchParams.get("search");
  const { limit, offset } = paginate(searchParams);

  if (id) {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, phone, avatar_url, role, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !data) return err("User not found", 404);
    return ok({ data });
  }

  let query = supabase
    .from("users")
    .select("id, name, email, phone, avatar_url, role, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (role) query = query.eq("role", role);
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count, limit, offset });
}

export async function PATCH(request) {
  const { supabase, admin, response } = await requireAdmin();
  if (response) return response;

  if (!["superadmin", "admin"].includes(admin.role)) return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();
  const allowed = ["name", "phone", "avatar_url", "role"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  if (updates.role && !["customer", "vip"].includes(updates.role)) return err("role must be customer or vip");

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("users").update(updates).eq("id", id).select("id, name, email, phone, avatar_url, role, updated_at").single();
  if (error) return err(error.message, 500);
  return ok({ data, message: "User updated" });
}

export async function DELETE(request) {
  const { supabase, admin, response } = await requireAdmin();
  if (response) return response;

  if (admin.role !== "superadmin") return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "User deleted" });
}
