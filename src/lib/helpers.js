import { NextResponse } from "next/server";
import { createSessionClient, createAdminClient } from "./supabase/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const ok = (data, status = 200) => NextResponse.json(data, { status });
export const err = (message, status = 400) => NextResponse.json({ error: message }, { status });

export async function getSessionUser() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function requireUser() {
  const supabase = await createSessionClient();
  const token = (await cookies()).get("token");

  if (!token) {
    return { supabase, user: null, response: err("Unauthorized", 401) };
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);

    return {
      supabase,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      },
      response: null,
    };
  } catch {
    return { supabase, user: null, response: err("Unauthorized", 401) };
  }
}

export async function requireAdmin() {
  const supabase = createAdminClient();
  const token = (await cookies()).get("token");

  if (!token) {
    return { supabase, admin: null, response: err("Unauthorized", 401) };
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);

    const adminRoles = ['admin', 'superadmin', 'manager', 'staff', 'kasir', 'gudang', 'cs'];
    
    if (payload.account_type !== 'admin' || !adminRoles.includes(payload.role)) {
      return { supabase, admin: null, response: err("Forbidden", 403) };
    }

    const { data: user, error: queryError } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", payload.sub)
      .single();

    if (queryError || !user) {
      console.error("[requireAdmin] User not found:", queryError);
      return { supabase, admin: null, response: err("Forbidden", 403) };
    }

    // Verifikasi ulang
    if (!adminRoles.includes(user.role)) {
      return { supabase, admin: null, response: err("Forbidden", 403) };
    }

    return {
      supabase,
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      response: null
    };

  } catch (error) {
    console.error("[requireAdmin] Token verification failed:", error);
    return { supabase, admin: null, response: err("Unauthorized", 401) };
  }
}


export function paginate(searchParams) {
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  return { limit, offset };
}
