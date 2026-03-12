import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

function redirect() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = NextResponse.redirect(new URL("/", url));
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

export async function GET() {
  return redirect();
}

export async function POST() {
  return redirect();
}
