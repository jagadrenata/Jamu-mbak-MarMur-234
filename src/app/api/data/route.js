/**
 * /api/data/route.js
 * Single route handler for multiple tables using Supabase.
 * Usage: GET /api/data?table=products&...params
 * Tables: products, categories, product_variants, product_tags, banner_ads
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const id = searchParams.get("id");
  const category_id = searchParams.get("category_id");
  const product_id = searchParams.get("product_id");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    switch (table) {
      case "categories": {
        const parent_id = searchParams.get("parent_id");

        let query = supabase
          .from("categories")
          .select("*", { count: "exact" })
          .order("id");

        if (id) query = query.eq("id", id);
        // parent_id=0 atau '' → filter parent_id IS NULL
        if (parent_id !== null) {
          query =
            parent_id === "" || parent_id === "0"
              ? query.is("parent_id", null)
              : query.eq("parent_id", parent_id);
        }

        const { data, count, error } = await query;
        if (error) throw error;

        return NextResponse.json({ data, total: count });
      }

      case "products": {
        /*
         * Query dengan JOIN:
         *- categories→ category_name, category_slug
         *- product_images (is_primary=true) → primary_image
         *- product_variants → min_price, max_price
         *
         * Supabase select() mendukung embedded relations jika foreign key
         * sudah terdefinisi di DB.
         */
        let query = supabase
          .from("products")
          .select(
            `
id, category_id, name, slug, sku, description, status, views_count, created_at, updated_at,
categories ( name, slug ),
product_images ( url, is_primary ),
product_variants ( price, is_active )
`,
            { count: "exact" }
          )
          .order("id");

        if (id) query = query.eq("id", id);
        if (category_id) query = query.eq("category_id", category_id);
        if (status) query = query.eq("status", status);
        if (search)
          query = query.or(
            `name.ilike.%${search}%,description.ilike.%${search}%`
          );

        // pagination
        query = query.range(offset, offset + limit - 1);

        const { data: raw, count, error } = await query;
        if (error) throw error;

        // Flatten / reshape supaya mirip format sebelumnya
        const data = (raw || []).map(p => {
          const primaryImg =
            (p.product_images || []).find(i => i.is_primary) ??
            p.product_images?.[0];
          const activePrices = (p.product_variants || [])
            .filter(v => v.is_active)
            .map(v => v.price);

          return {
            id: p.id,
            category_id: p.category_id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            description: p.description,
            status: p.status,
            views_count: p.views_count,
            created_at: p.created_at,
            updated_at: p.updated_at,
            category_name: p.categories?.name ?? null,
            category_slug: p.categories?.slug ?? null,
            primary_image: primaryImg?.url ?? null,
            min_price: activePrices.length ? Math.min(...activePrices) : null,
            max_price: activePrices.length ? Math.max(...activePrices) : null
          };
        });

        return NextResponse.json({ data, total: count, limit, offset });
      }

      case "product_variants": {
        const is_active = searchParams.get("is_active");

        let query = supabase
          .from("product_variants")
          .select(
            `
id, product_id, name, sku, price, cost_price, quantity, weight, attributes, is_active, created_at, updated_at,
product_variant_images ( url, alt_text, is_primary, position )
`,
            { count: "exact" }
          )
          .order("id");

        if (id) query = query.eq("id", id);
        if (product_id) query = query.eq("product_id", product_id);
        if (is_active !== null)
          query = query.eq("is_active", is_active === "true");

        const { data, count, error } = await query;
        if (error) throw error;

        return NextResponse.json({ data, total: count });
      }

      case "product_tags": {
        // Opsional: filter tag berdasarkan product_id via product_tag_map
        let data, count, error;

        if (product_id) {
          // Ambil tag yang terhubung ke produk tertentu
          ({ data, count, error } = await supabase
            .from("product_tag_map")
            .select("product_tags ( id, name, slug, created_at )", {
              count: "exact"
            })
            .eq("product_id", product_id));

          if (error) throw error;
          // Flatten
          data = (data || []).map(row => row.product_tags).filter(Boolean);
          count = data.length;
        } else {
          ({ data, count, error } = await supabase
            .from("product_tags")
            .select("*", { count: "exact" })
            .order("id"));
          if (error) throw error;
        }

        return NextResponse.json({ data, total: count });
      }

      case "banner_ads": {
        /*
         * Tabel banner_ads belum ada di skema DB yang diberikan.
         * Jika sudah dibuat di Supabase, kolom yang diharapkan:
         *id, title, image_url, link_url, position, is_active,
         *start_date, end_date, created_at, updated_at
         */
        const position = searchParams.get("position");
        const now = new Date().toISOString();

        let query = supabase
          .from("banner_ads")
          .select("*", { count: "exact" })
          .eq("is_active", true)
          .or(`start_date.is.null,start_date.lte.${now}`)
          .or(`end_date.is.null,end_date.gte.${now}`)
          .order("position");

        if (position) query = query.eq("position", position);

        const { data, count, error } = await query;
        if (error) throw error;

        return NextResponse.json({ data, total: count });
      }

      default:
        return NextResponse.json(
          {
            error: `Table "${table}" not found. Available: categories, products, product_variants, product_tags, banner_ads`
          },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("[/api/data] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
