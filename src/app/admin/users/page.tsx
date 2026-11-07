import { listUsers } from "@/lib/repo";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await listUsers();
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Relationships</p>
        <h1 className="mt-1 font-serif text-3xl text-white">Customers</h1>
        <p className="mt-1 text-[11.5px] text-stone">{users.length} people have signed in or ordered.</p>
      </div>
      <div className="overflow-x-auto border border-copper/20 bg-white/[0.04]">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-copper/15 text-[9px] uppercase tracking-widest2 text-stone">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-copper/10">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-lilacsoft/30">
                <td className="px-4 py-3 text-[11.5px] text-white">{u.name}</td>
                <td className="px-4 py-3 text-[11px] text-stone">{u.phone || "—"}</td>
                <td className="px-4 py-3 text-[11px] text-stone">{u.email || "—"}</td>
                <td className="px-4 py-3">
                  <span className={u.role === "ADMIN" ? "bg-navy px-2 py-0.5 text-[8.5px] uppercase tracking-wider text-ivory" : "text-[9px] uppercase tracking-wider text-stone"}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[10px] text-stone">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
