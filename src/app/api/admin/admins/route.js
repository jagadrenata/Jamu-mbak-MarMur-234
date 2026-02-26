import { ok, err, requireAdmin, paginate } from "@/lib/helpers";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["superadmin", "admin", "manager", "staff", "kasir"];

export async function GET(request) {
  const { supabase, admin, response } = await requireAdmin();
  if (response) return response;

  if (!["superadmin", "admin"].includes(admin.role)) return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const role = searchParams.get("role");
  const { limit, offset } = paginate(searchParams);

  if (id) {
    const { data, error } = await supabase
      .from("admins")
      .select("id, name, email, role, avatar_url, last_login, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !data) return err("Admin not found", 404);
    return ok({ data });
  }

  let query = supabase
    .from("admins")
    .select("id, name, email, role, avatar_url, last_login, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (role) query = query.eq("role", role);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count, limit, offset });
}

export async function POST(request) {
  const { supabase, admin, response } = await requireAdmin();
  if (response) return response;

  if (!["superadmin", "admin"].includes(admin.role)) return err("Forbidden", 403);

  const body = await request.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password) return err("name, email, and password are required");
  if (role && !VALID_ROLES.includes(role)) return err(`role must be one of: ${VALID_ROLES.join(", ")}`);

  const password_hash = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from("admins")
    .insert({ name, email, password_hash, role: role ?? "staff" })
    .select("id, name, email, role, created_at")
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Admin created" }, 201);
}

export async function PATCH(request) {
  const { supabase, admin, response } = await requireAdmin();
  if (response) return response;

  if (!["superadmin", "admin"].includes(admin.role)) return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();
  const updates = {};

  if (body.name) updates.name = body.name;
  if (body.avatar_url) updates.avatar_url = body.avatar_url;
  if (body.role) {
    if (!VALID_ROLES.includes(body.role)) return err(`role must be one of: ${VALID_ROLES.join(", ")}`);
    if (admin.role !== "superadmin") return err("Only superadmin can change roles", 403);
    updates.role = body.role;
  }
  if (body.password) {
    updates.password_hash = await bcrypt.hash(body.password, 12);
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("admins")
    .update(updates)
    .eq("id", id)
    .select("id, name, email, role, updated_at")
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Admin updated" });
}

export async function DELETE(request) {
  const { supabase, admin, response } = await requireAdmin();
  if (response) return response;

  if (admin.role !== "superadmin") return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");
  if (id === admin.id) return err("Cannot delete yourself", 400);

  const { error } = await supabase.from("admins").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Admin deleted" });
}
