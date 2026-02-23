import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function idgenerator() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 3; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
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

export async function GET(request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: name => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.set(name, "", options)
      }
    }
  );

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const isUser = !!user;

  if (id) {
    if (!isUser) {
      if (!email && !phone) {
        return NextResponse.json(
          {
            error: "Email atau nomor HP diperlukan untuk mencari order tamu."
          },
          { status: 400 }
        );
      }

      const { data: order, error } = await supabase
        .from("guest_orders")
        .select("*, guest_order_items(*)")
        .eq("id", id)
        .single();

      if (error || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const emailMatch = email && order.customer_email === email;
      const phoneMatch = phone && order.customer_phone === phone;

      if (!emailMatch && !phoneMatch) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      order.items = order.guest_order_items ?? [];
      delete order.guest_order_items;

      return NextResponse.json({
        data: { ...order, status_label: STATUS_LABEL[order.status] }
      });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    order.items = order.order_items ?? [];
    delete order.order_items;

    return NextResponse.json({
      data: { ...order, status_label: STATUS_LABEL[order.status] }
    });
  }

  if (isUser) {
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalized = (data ?? []).map(o => ({
      ...o,
      items: o.order_items ?? [],
      order_items: undefined,
      status_label: STATUS_LABEL[o.status]
    }));

    return NextResponse.json({
      data: normalized,
      total: normalized.length
    });
  }

  if (!email && !phone) {
    return NextResponse.json(
      {
        error:
          "Login diperlukan, atau gunakan email/nomor HP untuk mencari order tamu."
      },
      { status: 401 }
    );
  }

  let query = supabase
    .from("guest_orders")
    .select("*, guest_order_items(*)")
    .order("created_at", { ascending: false });

  if (email && phone) {
    query = query.or(`customer_email.eq.${email},customer_phone.eq.${phone}`);
  } else if (email) {
    query = query.eq("customer_email", email);
  } else {
    query = query.eq("customer_phone", phone);
  }

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = (data ?? []).map(o => ({
    ...o,
    items: o.guest_order_items ?? [],
    guest_order_items: undefined,
    status_label: STATUS_LABEL[o.status]
  }));

  return NextResponse.json({ data: normalized, total: normalized.length });
}

export async function POST(request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: name => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.set(name, "", options)
      }
    }
  );

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
    tax_id
  } = body;

  if (!items || !items.length) {
    return NextResponse.json({ error: "items are required" }, { status: 400 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const isUser = !!user;

  const orderId = idgenerator();
  const total_price = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping_price = shipping_method_id ? (body.shipping_price ?? 0) : 0;

  const orderPayload = {
    id: orderId,
    total_price,
    shipping_price,
    tax_amount: 0,
    discount_amount: 0,
    status: "pending",
    customer_name: customer_name ?? null,
    customer_email: customer_email ?? null,
    customer_phone: customer_phone ?? null,
    shipping_address: shipping_address ?? null,
    shipping_method_id: shipping_method_id ?? null,
    tax_id: tax_id ?? null,
    promo_code_id: promo_code_id ?? null,
    payment_method: payment_method ?? null
  };

  if (isUser) orderPayload.user_id = user.id;

  const orderTable = isUser ? "orders" : "guest_orders";
  const itemsTable = isUser ? "order_items" : "guest_order_items";

  const { data: newOrder, error: orderError } = await supabase
    .from(orderTable)
    .insert(orderPayload)
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const itemsPayload = items.map(item => ({
    order_id: orderId,
    order_id: orderId,
    variant_id: item.variant_id,
    quantity: item.quantity,
    price: item.price
  }));

  const { data: newItems, error: itemsError } = await supabase
    .from(itemsTable)
    .insert(itemsPayload)
    .select();

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      data: {
        ...newOrder,
        items: newItems,
        status_label: STATUS_LABEL[newOrder.status]
      },
      message: "Order created"
    },
    { status: 201 }
  );
}
