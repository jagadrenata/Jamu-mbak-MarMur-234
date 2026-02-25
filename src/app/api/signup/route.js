// app/api/signup/route.js
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const SALT_ROUNDS = 12;

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Ambil nama dari email (sebelum @)
    const rawName = normalizedEmail.split("@")[0];
    const name =
      rawName
        .replace(/[._\-+]/g, " ")
        .replace(/\d+/g, "")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
        .trim() || rawName;

    // Pakai admin client (bypass RLS)
    const supabase = createAdminClient();

    // Cek duplikasi email
    const { data: existing, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error("[/api/signup] check error:", checkError);
      return NextResponse.json(
        { error: "Terjadi kesalahan server." },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user baru
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        name,
        email: normalizedEmail,
        password_hash,
        role: "customer",
      })
      .select("id, name, email, phone, avatar_url, role, created_at")
      .single();

    if (insertError || !newUser) {
      console.error("[/api/signup] insert error:", insertError);
      return NextResponse.json(
        { error: "Gagal membuat akun. Coba lagi." },
        { status: 500 }
      );
    }

    // Buat JWT
    const token = await new SignJWT({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Response & set cookie
    const response = NextResponse.json(
      {
        message: "Akun berhasil dibuat.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          avatar_url: newUser.avatar_url,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[/api/signup]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}