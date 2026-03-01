import { ok, err } from "@/lib/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

const STATUS_LABEL = {
  pending: "Menunggu Pembayaran",
  processing: "Diproses",
  paid: "Dibayar",
  shipping: "Dikirim",
  delivered: "Terkirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
  expired: "Kedaluwarsa"
};

function idgenerator() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 3; i++)
    result += chars[Math.floor(Math.random() * chars.length)];
  result += "-";
  new Date()
    .toISOString()
    .match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
    .slice(1)
    .forEach(d => {
      result += d;
    });
  return result;
}

async function createMidtransTransaction({
  orderId,
  totalPrice,
  customer,
  items,
  shippingAddress,
  shippingPrice
}) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const grossAmount = totalPrice + (shippingPrice ?? 0);

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount
    },
    customer_details: {
      first_name: customer.name,
      email: customer.email,
      phone: customer.phone,
      shipping_address: {
        first_name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: shippingAddress?.street ?? JSON.stringify(shippingAddress),
        city: shippingAddress?.city ?? "",
        postal_code: shippingAddress?.postal_code ?? "",
        country_code: "IDN"
      }
    },
    item_details: [
      ...items.map(item => ({
        id: String(item.variant_id),
        price: item.price,
        quantity: item.quantity,
        name: item.name ?? `Variant #${item.variant_id}`
      })),
      ...(shippingPrice > 0
        ? [
            {
              id: "shipping",
              price: shippingPrice,
              quantity: 1,
              name: "Ongkos Kirim"
            }
          ]
        : [])
    ]
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(serverKey + ":").toString("base64")
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error_messages?.[0] ?? "Midtrans error");
  }

  return { token: data.token, redirect_url: data.redirect_url };
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

  const variantIds = items.map(i => i.variant_id);

  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select("id, price, quantity, name")
    .in("id", variantIds);

  if (variantError) return err(variantError.message, 500);

  const variantMap = Object.fromEntries(variants.map(v => [v.id, v]));

  let total_price = 0;
  const validatedItems = [];

  for (const item of items) {
    const variant = variantMap[item.variant_id];
    if (!variant) return err(`Variant ${item.variant_id} not found`);
    if (variant.quantity < item.quantity)
      return err(`Stock not enough for variant ${item.variant_id}`);

    total_price += variant.price * item.quantity;
    validatedItems.push({
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: variant.price,
      name: variant.name
    });
  }

  const orderId = idgenerator();
  const resolvedShippingPrice = shipping_price ?? 0;

  const { data: newOrder, error: orderError } = await supabase
    .from("guest_orders")
    .insert({
      id: orderId,
      total_price,
      shipping_price: resolvedShippingPrice,
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
      payment_method: payment_method ?? null
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
        price: item.price
      }))
    )
    .select();

  if (itemsError) {
    await supabase.from("guest_orders").delete().eq("id", orderId);
    return err(itemsError.message, 500);
  }

  let midtransToken = null;
  let midtransUrl = null;

  try {
    const midtrans = await createMidtransTransaction({
      orderId,
      totalPrice: total_price,
      customer: {
        name: customer_name,
        email: customer_email,
        phone: customer_phone
      },
      items: validatedItems,
      shippingAddress: shipping_address,
      shippingPrice: resolvedShippingPrice
    });

    midtransToken = midtrans.token;
    midtransUrl = midtrans.redirect_url;

    await supabase
      .from("guest_orders")
      .update({
        midtrans_token: midtransToken,
        midtrans_payment_url: midtransUrl,
        midtrans_order_id: orderId
      })
      .eq("id", orderId);
  } catch (midtransError) {
    await supabase.from("guest_order_items").delete().eq("order_id", orderId);
    await supabase.from("guest_orders").delete().eq("id", orderId);
    return err("Payment gateway error: " + midtransError.message, 502);
  }

  return ok(
    {
      data: {
        ...newOrder,
        items: newItems,
        midtrans_token: midtransToken,
        midtrans_payment_url: midtransUrl,
        status_label: STATUS_LABEL[newOrder.status]
      },
      message: "Order created"
    },
    201
  );
}
