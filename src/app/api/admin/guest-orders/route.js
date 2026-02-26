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
  expired: "Kedaluwarsa",
};

const VALID_STATUSES = Object.keys(STATUS_LABEL);

export async function GET(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const { limit, offset } = paginate(searchParams);

  if (id) {
    const { data: order, error } = await supabase
      .from("guest_orders")
      .select("*, guest_order_items(*)")
      .eq("id", id)
      .single();

    if (error || !order) return err("Order not found", 404);
    return ok({ data: { ...order, items: order.guest_order_items ?? [], guest_order_items: undefined, status_label: STATUS_LABEL[order.status] } });
  }

  let query = supabase
    .from("guest_orders")
    .select("*, guest_order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (search) query = query.or(`customer_email.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);

  const normalized = (data ?? []).map(o => ({ ...o, items: o.guest_order_items ?? [], guest_order_items: undefined, status_label: STATUS_LABEL[o.status] }));
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
  if (!VALID_STATUSES.includes(status)) return err(`status must be one of: ${VALID_STATUSES.join(", ")}`);

  const updates = { status, updated_at: new Date().toISOString() };
  if (status === "paid") updates.paid_at = new Date().toISOString();
  if (status === "delivered") updates.delivered_at = new Date().toISOString();
  if (status === "completed") updates.completed_at = new Date().toISOString();

  const { data, error } = await supabase.from("guest_orders").update(updates).eq("id", id).select().single();
  if (error) return err(error.message, 500);

  return ok({ data: { ...data, status_label: STATUS_LABEL[data.status] }, message: "Guest order updated" });
}
