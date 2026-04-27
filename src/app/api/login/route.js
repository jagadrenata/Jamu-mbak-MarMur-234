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

    // Coba cari di tabel users dulu
    const { data: user, error: userQueryError } = await supabase
      .from("users")
      .select("id, name, email, phone, password_hash, role, avatar_url")
      .eq(isEmail ? "email" : "phone", normalizedIdentifier)
      .maybeSingle();

    if (userQueryError) {
      console.error("[/api/login] users query error:", userQueryError);
      return NextResponse.json(
        { error: "Terjadi kesalahan server." },
        { status: 500 }
      );
    }

    // Jika tidak ditemukan di users, coba cari di admins
    let accountType = null;
    let account = null;

    if (user) {
      accountType = "user";
      account = {
        ...user,
        account_type: "user"
      };
    } else {
      // Cari di tabel admins
      const { data: admin, error: adminQueryError } = await supabase
        .from("admins")
        .select("id, name, email, password_hash, role, avatar_url, last_login")
        .eq("email", normalizedIdentifier)
        .maybeSingle();

      if (adminQueryError) {
        console.error("[/api/login] admins query error:", adminQueryError);
        return NextResponse.json(
          { error: "Terjadi kesalahan server." },
          { status: 500 }
        );
      }

      if (admin) {
        accountType = "admin";
        account = {
          ...admin,
          account_type: "admin"
        };
      }
    }

    // Jika tidak ditemukan di kedua tabel
    if (!account) {
      return NextResponse.json(
        { error: "Email/nomor telepon atau password salah." },
        { status: 401 }
      );
    }

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, account.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Email/nomor telepon atau password salah." },
        { status: 401 }
      );
    }

    // Buat JWT dengan informasi account type
    const token = await new SignJWT({
      sub: account.id,
      email: account.email,
      role: account.role,
      account_type: accountType // 'user' atau 'admin'
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(TOKEN_TTL)
      .sign(JWT_SECRET);

    // Update last_login untuk admin
    if (accountType === "admin") {
      const { error: updateError } = await supabase
        .from("admins")
        .update({ last_login: new Date().toISOString() })
        .eq("id", account.id);

      if (updateError) {
        console.error("[/api/login] Failed to update last_login:", updateError);
        // Tidak perlu gagalkan login, hanya log error
      }
    }

    // Siapkan response data
    const responseData = {
      message: "Login berhasil.",
      account_type: accountType,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role
      }
    };

    // Tambahkan fields spesifik berdasarkan tipe akun
    if (accountType === "user") {
      responseData.user.phone = account.phone;
      responseData.user.avatar_url = account.avatar_url;
    } else if (accountType === "admin") {
      responseData.user.avatar_url = account.avatar_url;
      if (account.last_login) {
        responseData.user.last_login = account.last_login;
      }
    }

    // Set cookie & return
    const response = NextResponse.json(responseData);

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
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
