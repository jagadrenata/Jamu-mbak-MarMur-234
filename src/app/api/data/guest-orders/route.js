import { ok, err, paginate } from "@/lib/helpers";
import { createAdminClient } from "@/lib/supabase/server";

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
  new Date().toISOString().match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/).slice(1).forEach(d => { result += d; });
  return result;
}

export async function POST(request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const {
    items,
    shipping_address,
    shipping_method_id,
    payment_method,
    customer_name,
    customer_email,
    customer_phone,
    promo_code_id,
    tax_id,
    shipping_price
  } = body;

  if (!items?.length) return err("items are required");
  if (!customer_name) return err("customer_name is required");
  if (!customer_email) return err("customer_email is required");
  if (!customer_phone) return err("customer_phone is required");
  if (!shipping_address) return err("shipping_address is required");

  //ambil data dari DB
  const variantIds = items.map(i => i.variant_id);

  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select("id, price, quantity")
    .in("id", variantIds);

  if (variantError) return err(variantError.message, 500);

  const variantMap = Object.fromEntries(variants.map(v => [v.id, v]));

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
    .from("guest_orders")
    .insert({
      id: orderId,
      total_price,
      shipping_price: shipping_price ?? 0,
      tax_amount: 0,
      discount_amount: 0,
      status: "pending",
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_method_id: shipping_method_id ?? null,
      tax_id: tax_id ?? null,
      promo_code_id: promo_code_id ?? null,
      payment_method: payment_method ?? null,
    })
    .select()
    .single();

  if (orderError) return err(orderError.message, 500);

  const { data: newItems, error: itemsError } = await supabase
    .from("guest_order_items")
    .insert(
      validatedItems.map(item => ({
        order_id: orderId,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
      }))
    )
    .select();

  //rollback
  if (itemsError) {
    await supabase.from("guest_orders").delete().eq("id", orderId);
    return err(itemsError.message, 500);
  }

  return ok({
    data: {
      ...newOrder,
      items: newItems,
      status_label: STATUS_LABEL[newOrder.status],
    },
    message: "Order created",
  }, 201);
}