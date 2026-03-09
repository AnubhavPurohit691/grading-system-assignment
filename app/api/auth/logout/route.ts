import { NextResponse } from "next/server";

function redirect() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = NextResponse.redirect(new URL("/", url));
  response.cookies.delete("gradingtoken");
  return response;
}

export async function GET() {
  return redirect();
}

export async function POST() {
  return redirect();
}
