import type { ShopSettings } from "@/lib/settings";

function Emblem({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative grid h-24 w-24 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-[#E4C68F] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] sm:h-28 sm:w-28">
      <span className="absolute inset-1.5 rounded-full border border-white/10" aria-hidden />
      {children}
    </span>
  );
}

const items = [
  {
    key: "purity" as const,
    title: ["Purity", "Guarantee"],
    icon: (
      <svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M24 6 39 12v11c0 9-6.4 15.8-15 19-8.6-3.2-15-10-15-19V12L24 6Z" />
        <path d="m17 24 5 5 9-10" />
      </svg>
    ),
  },
  {
    key: "exchange" as const,
    title: ["Old Gold", "Exchange"],
    icon: (
      <svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M11 21a13 13 0 0 1 21-7" />
        <path d="m31 8 1 6-6 1" />
        <path d="M37 27a13 13 0 0 1-21 7" />
        <path d="m17 40-1-6 6-1" />
        <circle cx="24" cy="24" r="3" />
      </svg>
    ),
  },
  {
    key: "replacement" as const,
    title: ["Easy", "Replacement"],
    icon: (
      <svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="19" cy="27" r="9" />
        <circle cx="29" cy="21" r="9" />
        <path d="m24 10 2.5 3.5L30 11" />
      </svg>
    ),
  },
  {
    key: "maintenance" as const,
    title: ["Lifetime", "Maintenance"],
    icon: (
      <svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M15 20a9 9 0 0 1 18 0v13H15V20Z" />
        <path d="M12 33h24M20 15v-3h8v3" />
        <path d="M19 39h10" />
      </svg>
    ),
  },
];

export function Assurance({ settings }: { settings: ShopSettings }) {
  const visible = items.filter((item) => settings.assurance[item.key]);

  return (
    <section className="bg-peach py-14 sm:py-16">
      <div className="container-x">
        <div className="mx-auto max-w-[520px] text-center">
          <h2 className="text-28 sm:text-34">The JMD Assurance</h2>
          <p className="mt-2 font-serif text-[14px] italic text-bodygrey">The promises the shop confirms</p>
        </div>

        {visible.length ? (
          <div className="mx-auto mt-8 grid max-w-[680px] grid-cols-2 gap-x-4 gap-y-8">
            {visible.map((item) => (
              <div key={item.key} className="flex flex-col items-center text-center">
                <Emblem>{item.icon}</Emblem>
                <p className="mt-3 font-serif text-[17px] leading-tight text-white sm:text-[19px]">
                  {item.title[0]}
                  <br />
                  {item.title[1]}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-6 max-w-[36ch] text-center text-[12px] text-bodygrey">
            [CONFIRM WITH SHOP] — assurance badges appear here once the owner enables them in the admin panel.
          </p>
        )}
      </div>
    </section>
  );
}
