import { ok, err, requireAdmin, paginate } from "@/lib/helpers";

export async function GET(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const { limit, offset } = paginate(searchParams);

  if (id) {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return err("Feedback not found", 404);
    return ok({ data });
  }

  let query = supabase
    .from("feedback")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) query = query.eq("type", type);
  if (search) query = query.or(`message.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count, limit, offset });
}

export async function DELETE(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { error } = await supabase.from("feedback").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Feedback deleted" });
}
