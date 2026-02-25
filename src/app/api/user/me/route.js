// app/api/user/me/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createClient } from "@/lib/supabase/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

//  Helper: extract & verify token from cookie
async function getAuthUserId(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

//
// GET /api/user/me  →  Validasi sesi & return data user
//
export async function GET(req) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 }
    );
  }

  const supabase = createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, phone, avatar_url, role, created_at")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "User tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}

//
// PATCH /api/user/me  →  Update name, phone, avatar
//
export async function PATCH(req) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 }
    );
  }

  const supabase = createClient();

  const formData = await req.formData();
  const name = formData.get("name")?.trim();
  const phone = formData.get("phone")?.trim() || null;
  const avatarFile = formData.get("avatar");

  if (!name) {
    return NextResponse.json(
      { error: "Nama tidak boleh kosong." },
      { status: 400 }
    );
  }

  //  Upload avatar jika ada
  let avatar_url;
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const filename = `avatars/${userId}-${Date.now()}.${ext}`;

    const arrayBuffer = await avatarFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("user-assets")
      .upload(filename, arrayBuffer, {
        contentType: avatarFile.type,
        upsert: true
      });

    if (uploadError) {
      console.error("[PATCH /api/user/me] upload error:", uploadError);
      return NextResponse.json(
        { error: "Gagal mengunggah avatar." },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("user-assets")
      .getPublicUrl(filename);
    avatar_url = urlData.publicUrl;
  }

  //  Update database
  const updates = {
    name,
    phone,
    updated_at: new Date().toISOString()
  };
  if (avatar_url) updates.avatar_url = avatar_url;

  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, name, email, phone, avatar_url, role, created_at")
    .single();

  if (updateError || !updatedUser) {
    console.error("[PATCH /api/user/me]", updateError);
    return NextResponse.json(
      { error: "Gagal memperbarui profil." },
      { status: 500 }
    );
  }

  return NextResponse.json({ user: updatedUser });
}
