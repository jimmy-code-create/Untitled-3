import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { LoginForm } from "@/components/account/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with your mobile number to track orders at JMD Gems & Jewellery.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const sp = await searchParams;
  return (
    <PageShell>
      <div className="container-x">
        <LoginForm next={sp.next ?? "/account"} adminReason={sp.reason === "admin"} />
      </div>
    </PageShell>
  );
}
