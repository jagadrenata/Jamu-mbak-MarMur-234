// app/api/login/route.js
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const TOKEN_TTL = "7d";

export async function POST(req) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Identifier dan password wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const isEmail = identifier.includes("@");
    const normalizedIdentifier = isEmail
      ? identifier.toLowerCase().trim()
      : identifier.trim();

    // Query berdasarkan email atau phone
    const { data: user, error: queryError } = await supabase
      .from("users")
      .select("id, name, email, phone, password_hash, role, avatar_url")
      .eq(isEmail ? "email" : "phone", normalizedIdentifier)
      .maybeSingle();

    if (queryError) {
      console.error("[/api/login] query error:", queryError);
      return NextResponse.json(
        { error: "Terjadi kesalahan server." },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Email/nomor telepon atau password salah." },
        { status: 401 }
      );
    }

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Email/nomor telepon atau password salah." },
        { status: 401 }
      );
    }

    // Buat JWT
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(TOKEN_TTL)
      .sign(JWT_SECRET);

    // Set cookie & return
    const response = NextResponse.json({
      message: "Login berhasil.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[/api/login]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
