import { ok, err, requireAdmin } from "@/lib/helpers";

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

export async function GET(request, { params }) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("orders")
    .select("id, status, final_price, total_price, shipping_price, created_at, customer_name", { count: "exact" })
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);

  const normalized = (data ?? []).map(o => ({ ...o, status_label: STATUS_LABEL[o.status] }));
  return ok({ data: normalized, total: count });
}
