import { ok, err, requireUser } from "@/lib/helpers";

export async function GET(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { data: raw, error } = await supabase
    .from("user_wishlists")
    .select(`
      user_id, product_id, created_at,
      products ( name, slug, product_images ( url, is_primary ), product_variants ( price, is_active ) )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return err(error.message, 500);

  const data = (raw ?? []).map(w => {
    const p = w.products;
    const primaryImg = (p?.product_images || []).find(i => i.is_primary) ?? p?.product_images?.[0];
    const activePrices = (p?.product_variants || []).filter(v => v.is_active).map(v => v.price);
    return {
      user_id: w.user_id,
      product_id: w.product_id,
      created_at: w.created_at,
      product: {
        name: p?.name ?? null,
        slug: p?.slug ?? null,
        primary_image: primaryImg?.url ?? null,
        min_price: activePrices.length ? Math.min(...activePrices) : null,
        max_price: activePrices.length ? Math.max(...activePrices) : null,
      },
    };
  });

  return ok({ data, total: data.length });
}

export async function POST(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const { product_id } = body;
  if (!product_id) return err("product_id is required");

  const { data, error } = await supabase
    .from("user_wishlists")
    .insert({ user_id: user.id, product_id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return err("Product already in wishlist", 409);
    return err(error.message, 500);
  }
  return ok({ data, message: "Added to wishlist" }, 201);
}

export async function DELETE(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const product_id = searchParams.get("product_id");
  if (!product_id) return err("product_id is required");

  const { error } = await supabase
    .from("user_wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", product_id);

  if (error) return err(error.message, 500);
  return ok({ message: "Removed from wishlist" });
}
