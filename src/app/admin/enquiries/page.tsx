import { listEnquiries } from "@/lib/repo";
import { EnquiriesTable } from "@/components/admin/EnquiriesTable";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await listEnquiries();
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Leads</p>
        <h1 className="mt-1 font-serif text-3xl text-navy">Enquiries</h1>
        <p className="mt-1 text-[11.5px] text-stone">WhatsApp requests, store-visit bookings and newsletter signups land here.</p>
      </div>
      <EnquiriesTable enquiries={enquiries} />
    </div>
  );
}
