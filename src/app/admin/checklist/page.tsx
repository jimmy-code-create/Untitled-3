import { Camera, ClipboardList, MessageCircleQuestion } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Owner-facing checklist. Two things live here: how to photograph a piece so it
 * does not look like stock, and every fact this website is still guessing at.
 */

const photoSteps = [
  {
    title: "Background",
    body: "Plain ivory or soft grey cloth. No marble slabs, no flowers, no hand models in the background.",
  },
  {
    title: "Light",
    body: "Daylight near a window, or one white light pointed at the piece. No flash straight on the metal.",
  },
  {
    title: "Four shots per piece",
    body: "Front, side, a close-up of the stone or the work, and one shot on a hand or wrist so the size makes sense.",
  },
  {
    title: "Consistency",
    body: "Same background, same distance, same light for every piece. A tidy grid of four beats one dramatic photo.",
  },
];

const confirmItems = [
  "Year the shop opened, and who customers should ask for at the counter.",
  "Opening hours, and whether the shop closes on any weekday.",
  "Whether every gold piece is BIS hallmarked, and which lab certifies stones (IGI, GIA or local).",
  "Exchange window in days, and whether made-to-order pieces can be exchanged.",
  "Whether gold and silver buyback is offered, at what rate, and which documents are needed.",
  "Courier partner, delivery charge and typical delivery time around Hindaun.",
  "How often the metal rate is updated, and whether the rate is locked once an order is placed.",
  "Payment provider keys (Razorpay) and photo upload keys (Cloudinary).",
  "The shop's real Facebook, Instagram and Google Business profile links.",
  "Whether the shop wants a separate email address for privacy requests.",
  "The old-gold exchange valuation method, making-charge deduction and documents required.",
  "The first-order offer headline, sub-line and any terms — leave blank until confirmed.",
  "The gift collection starting price shown on the home page banner.",
  "Which assurance badges the shop confirms: purity, old gold, replacement, lifetime maintenance.",
  "India adjustment for the live rate: import duty %, local premium per gram, and the shop-rate rule.",
];

export default function AdminChecklistPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">For the shop owner</p>
        <h1 className="mt-1 font-serif text-3xl text-white">Photo guide and open questions</h1>
        <p className="mt-1 max-w-2xl text-[11.5px] leading-relaxed text-stone">
          The website can only look like a real shop if the photos are the shop&apos;s own. Use this page before
          uploading a new piece, and answer the questions below so nothing on the site is a guess.
        </p>
      </div>

      <section className="border border-copper/20 bg-white/[0.04] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Camera className="h-4 w-4 text-copper-dark" strokeWidth={1.4} />
          <h2 className="font-serif text-xl text-white">How to photograph a piece</h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {photoSteps.map((s, i) => (
            <li key={s.title} className="border-l border-copper/30 pl-4">
              <p className="text-[9px] uppercase tracking-widest2 text-copper-dark">Step {i + 1}</p>
              <p className="mt-1 text-sm text-white">{s.title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-stone">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-copper/15 pt-3 text-[11px] text-stone">
          Upload size: 1200 × 1500 px, WebP or JPG under 300 KB. Product photos are cropped 4:5, collection photos
          3:4, the hero 16:10.
        </p>
      </section>

      <section className="border border-copper/20 bg-white/[0.04] p-5">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-copper-dark" strokeWidth={1.4} />
          <h2 className="font-serif text-xl text-white">[CONFIRM WITH SHOP] — open questions</h2>
        </div>
        <p className="mb-4 text-[11.5px] leading-relaxed text-stone">
          Every item below is written into the website as a visible placeholder in the code comments. Until you
          confirm it, the site must not state it as fact.
        </p>
        <ul className="space-y-2">
          {confirmItems.map((item) => (
            <li key={item} className="flex items-start gap-3 border-b border-copper/10 pb-2 last:border-0">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-copper" aria-hidden />
              <span className="text-[12px] leading-relaxed text-charcoal/80">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-copper/20 bg-white/[0.04] p-5">
        <div className="mb-2 flex items-center gap-2">
          <MessageCircleQuestion className="h-4 w-4 text-copper-dark" strokeWidth={1.4} />
          <h2 className="font-serif text-xl text-white">Before the first real order</h2>
        </div>
        <p className="text-[11.5px] leading-relaxed text-stone">
          Orders and enquiries currently live in the server&apos;s memory on the hosted site, so they can
          disappear. Connect a database before selling through the website, and test one order end to end.
        </p>
      </section>
    </div>
  );
}
