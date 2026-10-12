import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-token";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const ok = await isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value, process.env.ADMIN_PASSWORD);
  if (ok) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = { matcher: ["/admin/:path*"] };
