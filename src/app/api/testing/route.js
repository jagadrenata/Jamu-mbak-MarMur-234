
import { ok, err, paginate } from "@/lib/helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const status = searchParams.get("status");
  const { limit, offset } = paginate(searchParams);

  const hasEmail = !!email;
  const hasPhone = !!phone;
  const hasId = !!id;
  const filledCount = [hasEmail, hasPhone, hasId].filter(Boolean).length;

  if (filledCount < 2)
    return err(
      "Minimal dua dari tiga parameter diperlukan: email, phone, id",
      400
    );

  if (hasId) {
    const { data: order, error } = await supabase
      .from("guest_orders")
      .select("*, guest_order_items(*)")
      .eq("id", id)
      .single();

    if (error || !order) return err("Order not found", 404);

    const emailMatch = hasEmail && order.customer_email === email;
    const phoneMatch = hasPhone && order.customer_phone === phone;

    const isAuthorized =
      (hasEmail && hasPhone && (emailMatch || phoneMatch)) ||
      (hasEmail && !hasPhone && emailMatch) ||
      (!hasEmail && hasPhone && phoneMatch);

    if (!isAuthorized) return err("Order not found", 404);

    return ok({
      data: {
        ...order,
        items: order.guest_order_items ?? [],
        guest_order_items: undefined,
        status_label: STATUS_LABEL[order.status]
      }
    });
  }

  // hasEmail && hasPhone (tanpa idd3
  let query = supabase
    .from("guest_orders")
    .select("*, guest_order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  query = query.or(`customer_email.eq.${email},customer_phone.eq.${phone}`);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);

  const normalized = (data ?? []).map(o => ({
    ...o,
    items: o.guest_order_items ?? [],
    guest_order_items: undefined,
    status_label: STATUS_LABEL[o.status]
  }));

  return ok({ data: normalized, total: count, limit, offset });
}