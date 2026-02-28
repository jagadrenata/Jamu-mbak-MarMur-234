import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  console.log("TOKEN FROM COOKIE:", token);

  return Response.json({ token });
}