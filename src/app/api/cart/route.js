/**
 * /api/cart/route.js
 * Handles user_carts table operations.
 * GET    /api/cart?user_id=xxx          → list cart items (joined with product_variants + products)
 * POST   /api/cart                      → add item to cart
 * PATCH  /api/cart                      → update quantity
 * DELETE /api/cart?id=xxx               → remove item
 */

import { NextResponse } from "next/server";

// Dummy cart data sesuai skema user_carts
// Dalam implementasi nyata, ini query ke DB dengan JOIN ke product_variants dan products
let dummyCarts = [
  {
    id: 1,
    user_id: "user-uuid-001",
    variant_id: 1,
    quantity: 2,
    created_at: "2024-03-10T08:00:00Z",
    updated_at: "2024-03-10T08:00:00Z",
    // joined fields dari product_variants + products + product_images
    variant_name: "250ml",
    variant_sku: "JKA-001-250",
    variant_price: 15000,
    variant_attributes: { volume: "250ml" },
    product_id: 1,
    product_name: "Jamu Kunyit Asam Segar",
    product_slug: "jamu-kunyit-asam-segar",
    product_image:
      "https://placehold.co/200x200/C4956A/F5F0E8?text=Kunyit+Asam",
    stock: 50
  },
  {
    id: 2,
    user_id: "user-uuid-001",
    variant_id: 5,
    quantity: 3,
    created_at: "2024-03-10T09:00:00Z",
    updated_at: "2024-03-10T09:00:00Z",
    variant_name: "Isi 10 sachet",
    variant_sku: "JTS-001-10",
    variant_price: 8000,
    variant_attributes: { isi: 10 },
    product_id: 3,
    product_name: "Jamu Temulawak Sachet",
    product_slug: "jamu-temulawak-sachet",
    product_image: "https://placehold.co/200x200/6B3A2A/F5F0E8?text=Temulawak",
    stock: 100
  },
  {
    id: 3,
    user_id: "user-uuid-001",
    variant_id: 8,
    quantity: 1,
    created_at: "2024-03-11T10:00:00Z",
    updated_at: "2024-03-11T10:00:00Z",
    variant_name: "200gr",
    variant_sku: "WUP-001-200",
    variant_price: 20000,
    variant_attributes: { berat: "200gr" },
    product_id: 5,
    product_name: "Wedang Uwuh Premium",
    product_slug: "wedang-uwuh-premium",
    product_image:
      "https://placehold.co/200x200/8B5E3C/FAF7F2?text=Wedang+Uwuh",
    stock: 40
  }
];

let nextId = 4;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const items = dummyCarts.filter(c => c.user_id === user_id);
  const subtotal = items.reduce(
    (sum, item) => sum + item.variant_price * item.quantity,
    0
  );
  const total_items = items.reduce((sum, item) => sum + item.quantity, 0);

  return NextResponse.json({ data: items, subtotal, total_items });
}

export async function POST(request) {
  const body = await request.json();
  const { user_id, variant_id, quantity } = body;

  if (!user_id || !variant_id || !quantity) {
    return NextResponse.json(
      { error: "user_id, variant_id, quantity are required" },
      { status: 400 }
    );
  }

  // Cek apakah variant sudah ada di cart user
  const existing = dummyCarts.find(
    c => c.user_id === user_id && c.variant_id === variant_id
  );
  if (existing) {
    existing.quantity += quantity;
    existing.updated_at = new Date().toISOString();
    return NextResponse.json({ data: existing, message: "Quantity updated" });
  }

  const newItem = {
    id: nextId++,
    user_id,
    variant_id,
    quantity,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Dalam implementasi nyata: join dari DB
    variant_name: "Variant",
    variant_sku: "SKU-000",
    variant_price: 0,
    variant_attributes: {},
    product_id: null,
    product_name: "Produk",
    product_slug: "",
    product_image: "",
    stock: 0
  };

  dummyCarts.push(newItem);
  return NextResponse.json(
    { data: newItem, message: "Item added to cart" },
    { status: 201 }
  );
}

export async function PATCH(request) {
  const body = await request.json();
  const { id, quantity } = body;

  if (!id || quantity === undefined) {
    return NextResponse.json(
      { error: "id and quantity are required" },
      { status: 400 }
    );
  }

  if (quantity < 1) {
    return NextResponse.json(
      { error: "Quantity must be at least 1" },
      { status: 400 }
    );
  }

  const item = dummyCarts.find(c => c.id === parseInt(id));
  if (!item) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  item.quantity = quantity;
  item.updated_at = new Date().toISOString();

  return NextResponse.json({ data: item, message: "Quantity updated" });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const index = dummyCarts.findIndex(c => c.id === parseInt(id));
  if (index === -1) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  dummyCarts.splice(index, 1);
  return NextResponse.json({ message: "Item removed from cart" });
}
