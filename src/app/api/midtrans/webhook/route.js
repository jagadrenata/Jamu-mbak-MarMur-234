import { createSessionClient, createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

const supabase = createAdminClient();

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

export async function POST(request) {
  const body = await request.json();

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status
  } = body;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const expectedSignature = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  if (signature_key !== expectedSignature) {
    return new Response(JSON.stringify({ message: "Invalid signature" }), {
      status: 401
    });
  }

  const newStatus = mapMidtransStatus(transaction_status, fraud_status);
  if (!newStatus) {
    return new Response(JSON.stringify({ message: "Unhandled status" }), {
      status: 200
    });
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", order_id);

  if (error) {
    return new Response(JSON.stringify({ message: "DB update failed" }), {
      status: 500
    });
  }

  return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
}
