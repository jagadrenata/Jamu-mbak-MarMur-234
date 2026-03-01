
import { NextResponse } from "next/server";
import { ok, err } from "@/lib/helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  const supabase = await createAdminClient();
  const { slug } = await params;

  if (!slug) return err("slug is required");

  // Increment views_count
  await supabase.rpc("increment_product_views", { product_slug: slug });

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `id, category_id, name, slug, sku, description, status, views_count, created_at, updated_at,
       categories ( id, name, slug ),
       product_images ( id, url, alt_text, description, is_primary, position ),
       product_variants (
         id, name, sku, price, cost_price, quantity, weight, attributes, is_active, created_at, updated_at,
         product_variant_images ( id, url, alt_text, description, is_primary, position )
       )`
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !product) return err("Product not found", 404);

  // Sort images by position
  const images = (product.product_images || []).sort((a, b) => a.position - b.position);
  const primaryImage = images.find((i) => i.is_primary) ?? images[0] ?? null;

  // Format variants
  const variants = (product.product_variants || [])
    .filter((v) => v.is_active)
    .sort((a, b) => a.price - b.price)
    .map((v) => {
      const vImages = (v.product_variant_images || []).sort((a, b) => a.position - b.position);
      return {
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        cost_price: v.cost_price,
        quantity: v.quantity,
        weight: v.weight,
        attributes: v.attributes,
        is_active: v.is_active,
        images: vImages,
        primary_image: vImages.find((i) => i.is_primary) ?? vImages[0] ?? null,
      };
    });

  const activePrices = variants.map((v) => v.price);

  const data = {
    id: product.id,
    category_id: product.category_id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    status: product.status,
    views_count: product.views_count,
    created_at: product.created_at,
    updated_at: product.updated_at,
    category: product.categories ?? null,
    images,
    primary_image: primaryImage,
    variants,
    min_price: activePrices.length ? Math.min(...activePrices) : null,
    max_price: activePrices.length ? Math.max(...activePrices) : null,
    total_stock: variants.reduce((sum, v) => sum + v.quantity, 0),
  };

  return ok({ data });
}
