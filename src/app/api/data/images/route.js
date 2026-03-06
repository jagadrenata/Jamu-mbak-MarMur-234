import { ok, err, requireAdmin } from "@/lib/helpers";

const BUCKET = "product-images";

function getTable(type) {
  return type === "variant" ? "product_variant_images" : "product_images";
}

/** Unset is_primary for all images belonging to the same product/variant */
async function clearPrimary(supabase, type, { product_id, variant_id }) {
  if (type === "variant" && variant_id) {
    await supabase
      .from("product_variant_images")
      .update({ is_primary: false })
      .eq("variant_id", variant_id);
  } else if (product_id) {
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", product_id);
  }
}

export async function GET(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const product_id = searchParams.get("product_id");
  const variant_id = searchParams.get("variant_id");

  if (!product_id && !variant_id)
    return err("product_id or variant_id is required");

  if (product_id) {
    const { data, error } = await supabase
      .from("product_images")
      .select(
        "id, product_id, url, alt_text, description, is_primary, position, created_at"
      )
      .eq("product_id", product_id)
      .order("position");
    if (error) return err(error.message, 500);
    return ok({ data });
  }

  const { data, error } = await supabase
    .from("product_variant_images")
    .select(
      "id, variant_id, url, alt_text, description, is_primary, position, created_at"
    )
    .eq("variant_id", variant_id)
    .order("position");
  if (error) return err(error.message, 500);
  return ok({ data });
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const contentType = request.headers.get("content-type") || "";

  let product_id,
    variant_id,
    alt_text,
    description_text,
    is_primary,
    position,
    imageUrl;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    product_id = formData.get("product_id");
    variant_id = formData.get("variant_id");
    alt_text = formData.get("alt_text") || "";
    description_text = formData.get("description") || "";
    is_primary = formData.get("is_primary") === "true";
    position = parseInt(formData.get("position") || "1");

    const file = formData.get("file");
    if (!file) return err("file is required");

    const ext = file.name.split(".").pop().toLowerCase();
    const allowed = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
    if (!allowed.includes(ext))
      return err(
        "File type not allowed. Accepted: jpg, jpeg, png, webp, gif, avif"
      );

    const folder = product_id
      ? `products/${product_id}`
      : `variants/${variant_id}`;
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (uploadError) return err(uploadError.message, 500);

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  } else {
    //  JSON body → external URL
    const body = await request.json();
    product_id = body.product_id;
    variant_id = body.variant_id;
    alt_text = body.alt_text || "";
    description_text = body.description || "";
    is_primary = body.is_primary ?? false;
    position = body.position ?? 1;
    imageUrl = body.url;

    if (!imageUrl) return err("url is required");
    try {
      new URL(imageUrl);
    } catch {
      return err("Invalid URL format");
    }
  }

  if (!product_id && !variant_id)
    return err("product_id or variant_id is required");

  const type = variant_id ? "variant" : "product";

  // Unset existing primary before inserting new one
  if (is_primary) {
    await clearPrimary(supabase, type, { product_id, variant_id });
  }

  if (product_id) {
    const { data, error } = await supabase
      .from("product_images")
      .insert({
        product_id: parseInt(product_id),
        url: imageUrl,
        alt_text,
        description: description_text,
        is_primary,
        position
      })
      .select()
      .single();
    if (error) return err(error.message, 500);
    return ok({ data, message: "Image added" }, 201);
  }

  const { data, error } = await supabase
    .from("product_variant_images")
    .insert({
      variant_id: parseInt(variant_id),
      url: imageUrl,
      alt_text,
      description: description_text,
      is_primary,
      position
    })
    .select()
    .single();
  if (error) return err(error.message, 500);
  return ok({ data, message: "Image added" }, 201);
}

export async function PATCH(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "product"; // "product" | "variant"
  if (!id) return err("id is required");

  const body = await request.json();
  const allowed = ["alt_text", "description", "is_primary", "position"];
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  if (!Object.keys(updates).length) return err("No valid fields to update");

  const table = getTable(type);

  if (updates.is_primary === true) {
    const ownerCol = type === "variant" ? "variant_id" : "product_id";
    const { data: existing, error: fetchErr } = await supabase
      .from(table)
      .select(ownerCol)
      .eq("id", id)
      .single();

    if (fetchErr) return err(fetchErr.message, 500);

    const ownerId = existing?.[ownerCol];
    if (ownerId) {
      const clearCol = type === "variant" ? "variant_id" : "product_id";
      await supabase
        .from(table)
        .update({ is_primary: false })
        .eq(clearCol, ownerId)
        .neq("id", id); // don't clear the one we're about to set
    }
  }

  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ data, message: "Image updated" });
}

export async function DELETE(request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "product";
  if (!id) return err("id is required");

  const table = getTable(type);

  // Fetch URL before deleting so we can clean up bucket storage
  const { data: existing } = await supabase
    .from(table)
    .select("url")
    .eq("id", id)
    .single();

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return err(error.message, 500);

  // Remove from Supabase storage if it was uploaded to our bucket
  if (existing?.url) {
    const bucketPrefix = `/storage/v1/object/public/${BUCKET}/`;
    if (existing.url.includes(bucketPrefix)) {
      const filePath = existing.url.split(bucketPrefix)[1];
      await supabase.storage.from(BUCKET).remove([filePath]);
    }
  }

  return ok({ message: "Image deleted" });
}
