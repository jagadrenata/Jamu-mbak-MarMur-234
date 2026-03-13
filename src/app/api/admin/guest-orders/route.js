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

function normalizeGuestOrder(o) {
  const shippingMethod = o.shipping_methods ?? null;
  const promoCode = o.promo_codes ?? null;
  const tax = o.taxes ?? null;

  const items = (o.guest_order_items ?? []).map(item => {
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

  return {
    id: o.id,
    total_price: o.total_price,
    shipping_price: o.shipping_price ?? 0,
    tax_amount: o.tax_amount ?? 0,
    discount_amount: o.discount_amount ?? 0,
    final_price: o.final_price ?? o.total_price,
    status: o.status,
    status_label: STATUS_LABEL[o.status] ?? o.status,
    customer_name: o.customer_name,
    customer_email: o.customer_email ?? null,
    customer_phone: o.customer_phone ?? null,
    shipping_address: o.shipping_address ?? null,
    payment_method: o.payment_method ?? null,
    midtrans_order_id: o.midtrans_order_id ?? null,
    midtrans_payment_url: o.midtrans_payment_url ?? null,
    midtrans_token: o.midtrans_token ?? null,
    created_at: o.created_at,
    updated_at: o.updated_at ?? null,
    paid_at: o.paid_at ?? null,
    delivered_at: o.delivered_at ?? null,
    completed_at: o.completed_at ?? null,
    shipping_method: shippingMethod
      ? {
          id: shippingMethod.id,
          name: shippingMethod.name,
          code: shippingMethod.code,
          estimated_time: shippingMethod.estimated_time
        }
      : null,
    promo_code: promoCode
      ? {
          id: promoCode.id,
          code: promoCode.code,
          type: promoCode.type,
          value: promoCode.value
        }
      : null,
    tax: tax
      ? {
          id: tax.id,
          name: tax.name,
          rate: tax.rate
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
  const search = searchParams.get("search");
  const { limit, offset } = paginate(searchParams);

  const DETAIL_SELECT = `
    *,
    shipping_methods (id, name, code, price, estimated_time),
    promo_codes (id, code, type, value),
    taxes (id, name, rate),
    guest_order_items (
      id, variant_id, quantity, price, created_at,
      product_variants (
        id, name, sku, attributes, weight,
        products (id, name, slug, sku, product_images (id, url, is_primary, position)),
        product_variant_images (id, url, is_primary, position)
      )
    )
  `;

  const LIST_SELECT = `
    id, total_price, shipping_price, tax_amount, discount_amount, final_price,
    status, customer_name, customer_email, customer_phone, shipping_address,
    payment_method, created_at, updated_at, paid_at,
    shipping_methods (id, name, code),
    guest_order_items (id, variant_id, quantity, price,
      product_variants (id, name, sku,
        product_variant_images (url, is_primary, position),
        products (id, name, product_images (url, is_primary, position))
      )
    )
  `;

  if (id) {
    const { data: order, error } = await supabase
      .from("guest_orders")
      .select(DETAIL_SELECT)
      .eq("id", id)
      .single();

    if (error || !order) return err("Order not found", 404);
    return ok({ data: normalizeGuestOrder(order) });
  }

  let query = supabase
    .from("guest_orders")
    .select(LIST_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(
      `customer_email.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`
    );
  }

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);

  return ok({
    data: (data ?? []).map(normalizeGuestOrder),
    total: count,
    limit,
    offset
  });
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
    .from("guest_orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({
    data: { ...data, status_label: STATUS_LABEL[data.status] },
    message: "Guest order updated"
  });
}
