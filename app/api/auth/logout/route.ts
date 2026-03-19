import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

function redirect(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

export async function GET(request: Request) {
  return redirect(request);
}

export async function POST(request: Request) {
  return redirect(request);
}
