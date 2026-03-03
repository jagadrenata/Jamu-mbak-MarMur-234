import { createSessionClient, createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

const supabase = createAdminClient()

function mapMidtransStatus(transactionStatus, fraudStatus) {
  if (transactionStatus === "capture") {
    return fraudStatus === "accept" ? "paid" : "cancelled";
  }
  if (transactionStatus === "settlement") return "paid";
  if (transactionStatus === "pending") return "pending";
  if (["cancel", "deny"].includes(transactionStatus)) return "cancelled";
  if (transactionStatus === "expire") return "expired";
  if (transactionStatus === "refund") return "refunded";
  return null;
}

function timestampFields(status) {
  const now = new Date().toISOString();
  if (status === "paid") return { paid_at: now };
  if (status === "delivered") return { delivered_at: now };
  if (status === "completed") return { completed_at: now };
  return {};
}

export async function POST(request) {
  const body = await request.json();

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
  } = body;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const expectedSignature = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  if (signature_key !== expectedSignature) {
    return Response.json({ message: "Invalid signature" }, { status: 401 });
  }

  const newStatus = mapMidtransStatus(transaction_status, fraud_status);
  if (!newStatus) {
    return Response.json({ message: "Unhandled status" }, { status: 200 });
  }

  const updatePayload = {
    status: newStatus,
    updated_at: new Date().toISOString(),
    ...timestampFields(newStatus),
  };

  const { error: guestError } = await supabase
    .from("guest_orders")
    .update(updatePayload)
    .eq("id", order_id);

  const { error: orderError } = await supabase 
    .from("orders")
    .update({ status: newStatus })
    .eq("id", order_id);

  if (guestError && orderError) {
    return Response.json({ message: "DB update failed" }, { status: 500 });
  }

  return Response.json({ message: "OK" }, { status: 200 });
}
