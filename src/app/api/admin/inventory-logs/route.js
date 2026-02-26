import { ok, err, requireAdmin, paginate } from "@/lib/helpers";

const VALID_TYPES = ["restock", "sale", "return", "adjustment", "damaged", "purchase"];

export async function GET(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const variant_id = searchParams.get("variant_id");
  const type = searchParams.get("type");
  const { limit, offset } = paginate(searchParams);

  let query = supabase
    .from("inventory_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (variant_id) query = query.eq("variant_id", variant_id);
  if (type) query = query.eq("type", type);

  const { data, count, error } = await query;
  if (error) return err(error.message, 500);
  return ok({ data, total: count, limit, offset });
}

export async function POST(request) {
  const { supabase, admin, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { variant_id, change, type, note, reference_id } = body;

  if (!variant_id || change === undefined || !type) return err("variant_id, change, and type are required");
  if (!VALID_TYPES.includes(type)) return err(`type must be one of: ${VALID_TYPES.join(", ")}`);

  const { data, error } = await supabase
    .from("inventory_logs")
    .insert({ variant_id, change, type, note: note ?? null, reference_id: reference_id ?? null, admin_id: admin.id })
    .select()
    .single();

  if (error) return err(error.message, 500);

  await supabase
    .from("product_variants")
    .update({ quantity: supabase.raw(`quantity + ${change}`), updated_at: new Date().toISOString() })
    .eq("id", variant_id);

  return ok({ data, message: "Inventory log created" }, 201);
}
