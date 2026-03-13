import { ok, err, requireAdmin, paginate } from "@/lib/helpers";

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

const VALID_STATUSES = Object.keys(STATUS_LABEL);

function normalizeOrder(o) {
  const user = o.users ?? null;
  const address = o.user_addresses ?? null;
  const shippingMethod = o.shipping_methods ?? null;

  const items = (o.order_items ?? []).map(item => {
    const variant = item.product_variants ?? null;
    const product = variant?.products ?? null;
    const images = variant?.product_variant_images ?? [];
    const productImages = product?.product_images ?? [];
    const primaryImage =
      images.find(i => i.is_primary)?.url ||
      images[0]?.url ||
      productImages.find(i => i.is_primary)?.url ||
      productImages[0]?.url ||
      null;

    return {
      id: item.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
      created_at: item.created_at,
      variant: variant
        ? {
            id: variant.id,
            name: variant.name,
            sku: variant.sku,
            attributes: variant.attributes,
            weight: variant.weight
          }
        : null,
      product: product
        ? {
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            image: primaryImage
          }
        : null
    };
  });

  const shipping_address = address?.address ?? null;
  const coordinates = address?.coordinates ?? null;

  return {
    id: o.id,
    user_id: o.user_id,
    address_id: o.address_id,
    total_price: o.total_price,
    shipping_price: o.shipping_price ?? 0,
    tax_amount: o.tax_amount ?? 0,
    discount_amount: o.discount_amount ?? 0,
    final_price: o.final_price ?? o.total_price,
    status: o.status,
    status_label: STATUS_LABEL[o.status] ?? o.status,
    payment_method: o.payment_method ?? null,
    midtrans_url: o.midtrans_url ?? null,
    midtrans_token: o.midtrans_token ?? null,
    created_at: o.created_at,
    updated_at: o.updated_at ?? null,
    paid_at: o.paid_at ?? null,
    delivered_at: o.delivered_at ?? null,
    completed_at: o.completed_at ?? null,
    customer: user
      ? {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          phone: user.phone ?? null,
          avatar_url: user.avatar_url ?? null
        }
      : null,
    shipping_address,
    coordinates,
    delivery_notes: address?.notes ?? null,
    recipient_name: address?.recipient_name ?? null,
    recipient_phone: address?.phone ?? null,
    address_label: address?.name ?? null,
    shipping_method: shippingMethod
      ? {
          id: shippingMethod.id,
          name: shippingMethod.name,
          code: shippingMethod.code,
          estimated_time: shippingMethod.estimated_time
        }
      : null,
    items,
    items_count: items.length
  };
}

export async function GET(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const user_id = searchParams.get("user_id");
  const search = searchParams.get("search");
  const { limit, offset } = paginate(searchParams);

  const DETAIL_SELECT = `
    *,
    users (id, name, email, phone, avatar_url),
    user_addresses (id, name, address, coordinates, notes, phone, recipient_name, is_default),
    shipping_methods (id, name, code, estimated_time),
    order_items (
      id, variant_id, quantity, price, created_at,
      product_variants (
        id, name, sku, attributes, weight,
        products (id, name, slug, sku, product_images (id, url, is_primary, position)),
        product_variant_images (id, url, is_primary, position)
      )
    )
  `;

  const LIST_SELECT = `
    id, user_id, address_id, total_price, status, payment_method, created_at, updated_at, paid_at,
    users (id, name, email, phone, avatar_url),
    user_addresses (address, coordinates, recipient_name, phone, name),
    order_items (id, variant_id, quantity, price,
      product_variants (id, name, sku,
        product_variant_images (url, is_primary, position),
        products (id, name, product_images (url, is_primary, position))
      )
    )
  `;

  if (id) {
    const { data: order, error } = await supabase
      .from("orders")
      .select(DETAIL_SELECT)
      .eq("id", id)
      .single();

    if (error || !order) return err("Order not found", 404);
    return ok({ data: normalizeOrder(order) });
  }

  let query = supabase
    .from("orders")
    .select(LIST_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (user_id) query = query.eq("user_id", user_id);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);

  let normalized = (data ?? []).map(normalizeOrder);

  if (search) {
    const q = search.toLowerCase();
    normalized = normalized.filter(
      o =>
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.email?.toLowerCase().includes(q) ||
        o.customer?.phone?.toLowerCase().includes(q) ||
        o.recipient_name?.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
    );
  }

  return ok({ data: normalized, total: count, limit, offset });
}

export async function PATCH(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return err("id is required");

  const body = await request.json();
  const { status } = body;
  if (!status) return err("status is required");
  if (!VALID_STATUSES.includes(status))
    return err(`status must be one of: ${VALID_STATUSES.join(", ")}`);

  const updates = { status, updated_at: new Date().toISOString() };
  if (status === "paid") updates.paid_at = new Date().toISOString();
  if (status === "delivered") updates.delivered_at = new Date().toISOString();
  if (status === "completed") updates.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({
    data: { ...data, status_label: STATUS_LABEL[data.status] },
    message: "Order updated"
  });
}
