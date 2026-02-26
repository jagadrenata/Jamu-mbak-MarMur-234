import { ok, err, requireAdmin } from "@/lib/helpers";

export async function GET(request, { params }) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  const { data: raw, error } = await supabase
    .from("user_wishlists")
    .select(`
      user_id, product_id, created_at,
      products ( name, slug, product_images ( url, is_primary ), product_variants ( price, is_active ) )
    `)
    .eq("user_id", id)
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
