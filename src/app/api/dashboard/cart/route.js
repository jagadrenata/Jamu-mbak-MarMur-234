import { ok, err, requireUser } from "../../_lib/helpers.js";

export async function GET(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { data: raw, error } = await supabase
    .from("user_carts")
    .select(`
      id, user_id, variant_id, quantity, created_at, updated_at,
      product_variants (
        name, sku, price, quantity, is_active,
        products ( name, slug, product_images ( url, is_primary ) )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return err(error.message, 500);

  const data = (raw ?? []).map(item => {
    const v = item.product_variants;
    const p = v?.products;
    const primaryImg = (p?.product_images || []).find(i => i.is_primary) ?? p?.product_images?.[0];
    return {
      id: item.id,
      user_id: item.user_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
      variant: {
        name: v?.name ?? null,
        sku: v?.sku ?? null,
        price: v?.price ?? null,
        stock: v?.quantity ?? null,
        is_active: v?.is_active ?? null,
        product: {
          name: p?.name ?? null,
          slug: p?.slug ?? null,
          primary_image: primaryImg?.url ?? null,
        },
      },
    };
  });

  const subtotal = data.reduce((sum, item) => sum + (item.variant?.price ?? 0) * item.quantity, 0);
  return ok({ data, total: data.length, subtotal });
}

export async function POST(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const { variant_id, quantity } = body;
  if (!variant_id || !quantity) return err("variant_id and quantity are required");
  if (quantity < 1) return err("quantity must be at least 1");

  const { data: existing } = await supabase
    .from("user_carts")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("variant_id", variant_id)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("user_carts")
      .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return err(error.message, 500);
    return ok({ data, message: "Cart updated" });
  }

  const { data, error } = await supabase
    .from("user_carts")
    .insert({ user_id: user.id, variant_id, quantity })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Item added to cart" }, 201);
}

export async function PATCH(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();
  const { quantity } = body;
  if (!quantity || quantity < 1) return err("quantity must be at least 1");

  const { data: existing } = await supabase.from("user_carts").select("id").eq("id", id).eq("user_id", user.id).single();
  if (!existing) return err("Cart item not found", 404);

  const { data, error } = await supabase
    .from("user_carts")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Cart updated" });
}

export async function DELETE(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const clear = searchParams.get("clear");

  if (clear === "true") {
    const { error } = await supabase.from("user_carts").delete().eq("user_id", user.id);
    if (error) return err(error.message, 500);
    return ok({ message: "Cart cleared" });
  }

  if (!id) return err("id or clear=true is required");

  const { data: existing } = await supabase.from("user_carts").select("id").eq("id", id).eq("user_id", user.id).single();
  if (!existing) return err("Cart item not found", 404);

  const { error } = await supabase.from("user_carts").delete().eq("id", id);
  if (error) return err(error.message, 500);
  return ok({ message: "Item removed from cart" });
}
