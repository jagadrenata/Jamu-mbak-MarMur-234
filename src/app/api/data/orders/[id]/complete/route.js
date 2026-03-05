import { ok, err, requireUser, requireAdmin } from "@/lib/helpers";

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

// Hanya buyer (user pemilik order) yang boleh menyelesaikan pesanan.
// Pesanan hanya bisa diselesaikan jika status saat ini adalajh "delivered".
export async function PATCH(request, { params }) {
  const { user, response } = await requireUser();
  const { supabase } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!id) return err("Order ID is required", 400);

  // Ambil order, pastikan milik user ini
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, user_id, status")
    .eq("id", id)
    .single();

  if (fetchError || !order) return err("Order not found", 404);
  if (order.user_id !== user.id) return err("Forbidden", 403);

  // Hanya boleh bomplete jika status "delivered"
  if (order.status !== "delivered") {
    return err(
      `Pesanan tidak bisa diselesaikan. Status saat ini: ${STATUS_LABEL[order.status] ?? order.status}`,
      422
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (updateError) return err(updateError.message, 500);

  return ok({
    data: {
      ...updated,
      status_label: STATUS_LABEL[updated.status]
    },
    message: "Pesanan berhasil diselesaikan"
  });
}
