import { ok, err, requireUser, requireAdmin, paginate } from "@/lib/helpers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const product_id = searchParams.get("product_id");
  const id = searchParams.get("id");
  const { limit, offset } = paginate(searchParams);

  const { supabase } = await requireUser();

  let query = supabase
    .from("product_reviews")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (id) query = query.eq("id", id);
  else if (product_id) query = query.eq("product_id", product_id);
  else return err("product_id or id is required");

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count, limit, offset });
}

export async function POST(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const { product_id, rating, review } = body;

  if (!product_id || !rating) return err("product_id and rating are required");
  if (rating < 1 || rating > 5) return err("rating must be between 1 and 5");

  const { data: existing } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", product_id)
    .eq("user_id", user.id)
    .single();

  if (existing) return err("You have already reviewed this product", 409);

  const { data, error } = await supabase
    .from("product_reviews")
    .insert({ product_id, user_id: user.id, rating, review: review ?? null })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Review submitted" }, 201);
}

export async function DELETE(request) {
  const { supabase: adminSupabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const { error } = await adminSupabase.from("product_reviews").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Review deleted" });
}
