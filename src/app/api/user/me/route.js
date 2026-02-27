// app/api/user/me/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name, options) =>
          cookieStore.set({ name, value: "", ...options }),
      },
    }
  );
}

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

export async function GET(req) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 }
    );
  }

  const supabase = await createClient();

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

export async function PATCH(req) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 }
    );
  }

  const supabase = await createClient();

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

  let avatar_url;

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const filename = `avatars/${userId}-${Date.now()}.${ext}`;
    const arrayBuffer = await avatarFile.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("user-assets")
      .upload(filename, arrayBuffer, {
        contentType: avatarFile.type,
        upsert: true,
      });

    if (uploadError) {
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

  const updates = {
    name,
    phone,
    updated_at: new Date().toISOString(),
  };

  if (avatar_url) updates.avatar_url = avatar_url;

  const { data: updatedUser, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, name, email, phone, avatar_url, role, created_at")
    .single();

  if (error || !updatedUser) {
    return NextResponse.json(
      { error: "Gagal memperbarui profil." },
      { status: 500 }
    );
  }

  return NextResponse.json({ user: updatedUser });
}