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
  const sessionClient = await createSessionClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return { supabase, admin: null, response: err("Unauthorized", 401) };

  const { data: admin } = await supabase
    .from("admins")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!admin) return { supabase, admin: null, response: err("Forbidden", 403) };
  return { supabase, admin, response: null };
}

export function paginate(searchParams) {
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  return { limit, offset };
}
