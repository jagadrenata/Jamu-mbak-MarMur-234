import { ok, err, requireUser, paginate } from "@/lib/helpers";

const STATUS_LABEL = {
  pending: "Menunggu Pembayaran",
  processing: "Diproses",
  paid: "Dibayar",
  shipping: "Dikirim",
  delivered: "Terkirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
  expired: "Kedaluwarsa",
};

function idgenerator() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 3; i++) result += chars[Math.floor(Math.random() * chars.length)];
  result += "-";
  new Date().toISOString().match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/).slice(1).forEach(d => {
    result += d;
  });
  return result;
}

export async function GET(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const { limit, offset } = paginate(searchParams);

  if (id) {
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          product_variants (
            id, name,
            product_variant_images (url, is_primary),
            products (
              id, name,
              product_images (url, is_primary)
            )
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error || !order) return err("Order not found", 404);
    if (order.user_id !== user.id) return err("Forbidden", 403);

    return ok({
      data: {
        ...order,
        items: order.order_items ?? [],
        order_items: undefined,
        status_label: STATUS_LABEL[order.status] ?? order.status,
      },
    });
  }

  let query = supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        product_variants (
          id, name,
          product_variant_images (url, is_primary),
          products (
            id, name,
            product_images (url, is_primary)
          )
        )
      )
    `, { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);

  const normalized = (data ?? []).map(o => ({
    ...o,
    items: o.order_items ?? [],
    order_items: undefined,
    status_label: STATUS_LABEL[o.status] ?? o.status,
  }));

  return ok({ data: normalized, total: count, limit, offset });
}

export async function POST(request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const { items } = body;

  if (!items?.length) return err("items are required");

  // Ambil data variant dari DB (anti manipulasi harga)
  const variantIds = items.map(i => i.variant_id);

  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select("id, price, quantity")
    .in("id", variantIds);

  if (variantError) return err(variantError.message, 500);

  const variantMap = Object.fromEntries(
    variants.map(v => [v.id, v])
  );

  // Validasi stok & hitung total dari DB
  let total_price = 0;
  const validatedItems = [];

  for (const item of items) {
    const variant = variantMap[item.variant_id];
    if (!variant) return err(`Variant ${item.variant_id} not found`);

    if (variant.quantity < item.quantity) {
      return err(`Stock not enough for variant ${item.variant_id}`);
    }

    total_price += variant.price * item.quantity;

    validatedItems.push({
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: variant.price,
    });
  }

  const orderId = idgenerator();

  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      user_id: user.id,
      total_price,
      status: "pending",
    })
    .select()
    .single();

  if (orderError) return err(orderError.message, 500);

  const { data: newItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(
      validatedItems.map(item => ({
        order_id: orderId,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
      }))
    )
    .select();

  // rollback kalau gagal insert item
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderId);
    return err(itemsError.message, 500);
  }

  return ok(
    {
      data: {
        ...newOrder,
        items: newItems,
        status_label: STATUS_LABEL[newOrder.status],
      },
      message: "Order created",
    },
    201
  );
}