import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listOrders } from "@/lib/repo";
import { AccountView } from "@/components/account/AccountView";
import { PageShell, Breadcrumbs } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const orders = session?.user?.email ? await listOrders(session.user.email) : [];

  return (
    <PageShell>
      <div className="container-x">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My account" }]} />
        <header className="mb-8">
          <p className="label mb-2">Namaste{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}</p>
          <h1 className="font-serif text-4xl text-white sm:text-5xl">My Account</h1>
        </header>
        <AccountView
          orders={orders}
          user={{
            name: session?.user?.name,
            email: session?.user?.email,
            phone: session?.user?.phone,
            role: session?.user?.role,
          }}
        />
      </div>
    </PageShell>
  );
}
