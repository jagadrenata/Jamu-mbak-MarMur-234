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
  new Date()
    .toISOString()
    .match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
    .slice(1)
    .forEach((d) => {
      result += d;
    });
  return result;
}

async function createMidtransTransaction({ orderId, totalPrice, user, items, address }) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: totalPrice,
    },
    customer_details: {
      first_name: user.user_metadata?.full_name ?? user.email,
      email: user.email,
      shipping_address: {
        first_name: address.name,
        address: address.address?.street ?? JSON.stringify(address.address),
        city: address.address?.city ?? "",
        postal_code: address.address?.postal_code ?? "",
        country_code: "IDN",
      },
    },
    item_details: items.map((item) => ({
      id: String(item.variant_id),
      price: item.price,
      quantity: item.quantity,
      name: item.name ?? `Variant #${item.variant_id}`,
    })),
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(serverKey + ":").toString("base64"),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error_messages?.[0] ?? "Midtrans error");
  }

  return { token: data.token, redirect_url: data.redirect_url };
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
        user_addresses (id, name, address, coordinate),
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
        address: order.user_addresses ?? null,
        user_addresses: undefined,
        items: order.order_items ?? [],
        order_items: undefined,
        status_label: STATUS_LABEL[order.status] ?? order.status,
      },
    });
  }

  let query = supabase
    .from("orders")
    .select(
      `
      *,
      user_addresses (id, name, address),
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
    `,
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);

  const normalized = (data ?? []).map((o) => ({
    ...o,
    address: o.user_addresses ?? null,
    user_addresses: undefined,
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
  const { items, address_id } = body;

  if (!items?.length) return err("items are required");
  if (!address_id) return err("address_id is required");

  const { data: address, error: addressError } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("id", address_id)
    .eq("user_id", user.id)
    .single();

  if (addressError || !address) return err("Address not found", 404);

  const variantIds = items.map((i) => i.variant_id);

  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select("id, price, quantity, name")
    .in("id", variantIds);

  if (variantError) return err(variantError.message, 500);

  const variantMap = Object.fromEntries(variants.map((v) => [v.id, v]));

  let total_price = 0;
  const validatedItems = [];

  for (const item of items) {
    const variant = variantMap[item.variant_id];
    if (!variant) return err(`Variant ${item.variant_id} not found`);
    if (variant.quantity < item.quantity) return err(`Stock not enough for variant ${item.variant_id}`);

    total_price += variant.price * item.quantity;
    validatedItems.push({
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: variant.price,
      name: variant.name,
    });
  }

  const orderId = idgenerator();

  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      user_id: user.id,
      address_id,
      total_price,
      status: "pending",
    })
    .select()
    .single();

  if (orderError) return err(orderError.message, 500);

  const { data: newItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(
      validatedItems.map((item) => ({
        order_id: orderId,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
      }))
    )
    .select();

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderId);
    return err(itemsError.message, 500);
  }

  let midtransToken = null;
  let midtransUrl = null;

  try {
    const midtrans = await createMidtransTransaction({
      orderId,
      totalPrice: total_price,
      user,
      items: validatedItems,
      address,
    });

    midtransToken = midtrans.token;
    midtransUrl = midtrans.redirect_url;

    await supabase
      .from("orders")
      .update({ midtrans_token: midtransToken, midtrans_url: midtransUrl })
      .eq("id", orderId);
  } catch (midtransError) {
    await supabase.from("order_items").delete().eq("order_id", orderId);
    await supabase.from("orders").delete().eq("id", orderId);
    return err("Payment gateway error: " + midtransError.message, 502);
  }

  return ok(
    {
      data: {
        ...newOrder,
        address,
        items: newItems,
        midtrans_token: midtransToken,
        midtrans_url: midtransUrl,
        status_label: STATUS_LABEL[newOrder.status],
      },
      message: "Order created",
    },
    201
  );
}
