import { getCurrentUser } from "@/lib/auth-server";
import { LandingHero } from "@/components/landing/landing-hero";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <LandingHero
      user={user ? { username: user.username, email: user.email } : null}
    />
  );
}
