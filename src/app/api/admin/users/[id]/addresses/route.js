import { ok, err, requireAdmin } from "@/lib/helpers";

export async function GET(request, { params }) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*", { count: "exact" })
    .eq("user_id", id)
    .order("is_default", { ascending: false });

  if (error) return err(error.message, 500);
  return ok({ data, total: data?.length ?? 0 });
}
