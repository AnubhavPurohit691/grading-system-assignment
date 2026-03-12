/** Cookie name for the auth JWT (used by server components and API). */
export const AUTH_COOKIE_NAME = "gradingtoken";

/** Cookie options when setting the auth token. */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

/** Standard 401 message when no valid auth. */
export const AUTH_MESSAGE_NOT_AUTHENTICATED = "Not authenticated";
