import { getCurrentUser } from "@/lib/auth-server";
import { AppNav } from "@/components/app-nav";

export async function AppNavWrapper() {
  const user = await getCurrentUser();
  return (
    <AppNav
      user={
        user
          ? {
              username: user.username,
              email: user.email,
              role: user.role,
            }
          : null
      }
    />
  );
}
