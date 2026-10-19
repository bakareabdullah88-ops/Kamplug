import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BuddyAvatar } from "@/components/app/buddy";
import { CategoryStrip } from "@/components/landing/category-strip";
import { FaqPanel } from "@/components/landing/faq-panel";
import { Clouds3D, GateScene } from "@/components/landing/gate-scene";
import { SpotPicker } from "@/components/landing/spot-picker";
import {
  Burst,
  DeliveryKeke,
  HostelRoom,
  SellPanel,
  ShopPanel,
  Sparkle,
  TakeawaySet,
  TuckShop,
} from "@/components/landing/illustrations";
import { HeroHeadline } from "@/components/landing/hero-headline";
import { LandingNav } from "@/components/landing/nav";
import { Reveal } from "@/components/landing/reveal";
import { Page } from "@/components/shell/page";
import { brand } from "@/config/brand";
import { BUDDY_COLORS, BUDDY_SHAPES } from "@/domain/buddy";
import { cn } from "@/lib/cn";
import { seedCampuses } from "@/services/mock/seed/campuses";
import { focusCampusId } from "@/config/brand";
import { CampusBadge } from "@/components/landing/campus-badge";
import { WALKING_MINUTES } from "@/domain/distance";

export const metadata: Metadata = {
  title: { absolute: `${brand.name} · Your campus plug` },
  description: brand.description,
  alternates: { canonical: "/" },
};

const campuses = seedCampuses();
const unilag = campuses.find((c) => c.id === focusCampusId);
const halls = unilag?.zones.filter((z) => z.kind === "hostel").length ?? 0;
const faculties = unilag?.zones.filter((z) => z.kind === "faculty").length ?? 0;
const pickupSpots = unilag?.pickupPoints.length ?? 0;

const steps = [
  {
    n: "1",
    title: "Pick your spot",
    body: "Sign up with email or Google, then choose your hall or faculty at UNILAG.",
  },
  {
    n: "2",
    title: "Shop nearest first",
    body: "See how far each shop is and how long it takes. Your hall and faculty come first.",
  },
  {
    n: "3",
    title: "Chat, pay, collect",
    body: "Message the seller, then pay on delivery or at a pickup spot. Track every step.",
  },
];

const faqs = [
  {
    q: "What is Kamplug?",
    a: "Kamplug is a marketplace for UNILAG students. Students sell food, thrift, beauty, tech, books and more, and other students order from them for delivery to their hall or pickup on campus.",
  },
  {
    q: "Does it cost anything?",
    a: "No. Creating an account, shopping and opening a shop are all free.",
  },
  {
    q: "How do I know which shop is closest?",
    a: `Pick your hall or faculty and every shop shows how far it is and the walk time. Shops in your own faculty or hall come first, and the walking-distance filter keeps it to about ${WALKING_MINUTES} minutes on foot. Kamplug knows ${halls} halls and ${faculties} faculties so far.`,
  },
  {
    q: "How do I pay?",
    a: `On delivery or at pickup, straight to the seller. There are ${pickupSpots} pickup spots on campus, from the Main Gate stand to the Main Library steps. Online payments are coming later.`,
  },
  {
    q: "How do I open a shop?",
    a: "Create an account, tap Open a shop and follow five short steps: name, handle, category, where you deliver from, and your first product. It's free.",
  },
  {
    q: "Which campuses are on Kamplug?",
    a: `Kamplug is live at UNILAG right now. ${campuses
      .filter((c) => c.id !== focusCampusId)
      .map((c) => c.shortName)
      .join(", ")} are coming next.`,
  },
  {
    q: "Is Kamplug only for food?",
    a: "Not at all. Food is popular, but you'll find thrift, fashion, skincare, phone accessories, prints and study materials too.",
  },
];

const INK = "#1b1f3b";

/** Section titles: heavy, tight and big. */
const h2 =
  "text-[clamp(38px,5.6vw,68px)] leading-[0.98] font-extrabold tracking-[-0.055em] text-balance";

/** Flat buttons: colour does the work, no shadows. */
const btn = {
  cobalt:
    "inline-flex h-14 items-center gap-2 rounded-xl bg-[#3a5bff] px-7 text-[16px] font-bold text-white transition-colors hover:bg-[#2a45d6]",
  ink: "inline-flex h-14 items-center gap-2 rounded-xl bg-[#1b1f3b] px-7 text-[16px] font-bold text-white transition-colors hover:bg-black",
  white:
    "inline-flex h-14 items-center gap-2 rounded-xl bg-white px-7 text-[16px] font-bold text-[#1b1f3b] transition-colors hover:bg-[#eef1ff]",
};

/** "SEE MORE →" link under each feature card. */
function SeeMore({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="group mt-6 inline-flex items-center gap-2 text-[14px] font-extrabold tracking-[0.2em] text-[#3a5bff] uppercase"
    >
      See more
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

const buddyGrid = Array.from({ length: 10 }, (_, i) => ({
  shape: BUDDY_SHAPES[i % BUDDY_SHAPES.length]!,
  color: BUDDY_COLORS[(i * 3) % BUDDY_COLORS.length]!,
}));
const gridBgs = [
  "#ffd9cf",
  "#3a5bff",
  "#ffd23f",
  "#9fd8ff",
  INK,
  "#ff6a4d",
  "#ffd23f",
  INK,
  "#ffd9cf",
  "#3a5bff",
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-white font-sans text-[#1b1f3b]">
      <LandingNav />
      <Page>
        {/* Hero: the UNILAG gate on a clear morning, the whole width of the page */}
        <section className="relative overflow-hidden bg-[#f4f5f8] pt-28 md:pt-36">
          <Clouds3D />
          <div className="relative mx-auto max-w-4xl px-5 text-center">
            <CampusBadge />
            <HeroHeadline />
            <p className="mx-auto mt-5 max-w-xl text-[18px] leading-snug md:text-[20px]">
              Food, thrift, beauty and more from UNILAG students near you. See how far each shop is
              and how soon it gets to you.
            </p>
            <div className="mt-8 flex justify-center">
              <SpotPicker />
            </div>
          </div>
          <GateScene className="relative mt-6 h-[260px] w-full sm:h-[340px] md:mt-2 md:h-[420px] xl:h-[460px]" />
        </section>

        {/* Categories */}
        <section id="shop" className="scroll-mt-24 bg-white px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-[1240px]">
            <Reveal
              from="top"
              className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between"
            >
              <h2 className={h2}>
                Everything
                <br />
                on campus
              </h2>
              <p className="max-w-sm text-[18px] leading-snug">
                Whatever you need between lectures, someone in your hall or faculty is selling it.
              </p>
            </Reveal>
            <CategoryStrip />
          </div>
        </section>

        {/* Sell: a full-width sunny band with the tuck shop standing on its bottom edge */}
        <section
          id="sell"
          className="relative scroll-mt-20 overflow-hidden bg-[#ffe9a8] px-4 pt-20 md:px-8 md:pt-28"
        >
          <Burst className="lp-twinkle absolute top-10 left-[6%] size-9" color="#ff6a4d" />
          <Sparkle className="lp-twinkle absolute top-16 right-[8%] size-8" color="#3a5bff" />
          <div className="mx-auto grid max-w-[1240px] items-end gap-10 md:grid-cols-2">
            <Reveal from="top" className="md:order-2 md:pb-28">
              <h2 className={h2}>
                Open a shop for <span className="text-[#2a3fc4]">₦0</span>
              </h2>
              <p className="mt-5 max-w-md text-[18px] leading-snug md:text-[20px]">
                No setup fee and no monthly fee. Set where you sell from, list your products and
                buyers nearby see you first.
              </p>
              <Link href="/open-shop" className={cn(btn.cobalt, "mt-8")}>
                Open your shop <ArrowRight className="size-5" />
              </Link>
            </Reveal>
            <Reveal from="top" delay={120}>
              <TuckShop className="relative block w-full translate-y-1" />
            </Reveal>
          </div>
        </section>

        {/* Three ways in */}
        <section className="bg-white px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-[1240px] gap-8 md:grid-cols-3 md:gap-6">
            {[
              {
                mark: <Burst className="size-9" color="#ff6a4d" />,
                title: "Start selling",
                body: "Cook, thrift, braid or print? Open a shop in minutes and reach every student on your campus.",
                href: "/open-shop",
                panel: <SellPanel className="h-full w-full" />,
              },
              {
                mark: <span className="block h-7 w-14 rounded-t-full bg-[#3ddc97]" aria-hidden />,
                title: "Shop your campus",
                body: "Shops nearest you come first, with the walk time. Order in a few taps and track it to your hall.",
                href: "/signup",
                panel: <ShopPanel className="h-full w-full" />,
              },
              {
                mark: <Sparkle className="size-10" color="#3a5bff" />,
                title: "Meet the buddies",
                body: "Every account gets an animated buddy as its profile picture. Pick your shape and colour.",
                href: "/signup",
                panel: (
                  <div className="grid h-full grid-cols-5 grid-rows-2">
                    {buddyGrid.map((b, i) => (
                      <div
                        key={i}
                        className="grid place-items-center"
                        style={{ background: gridBgs[i] }}
                      >
                        <BuddyAvatar buddy={b} size={58} className="!bg-transparent" />
                      </div>
                    ))}
                  </div>
                ),
              },
            ].map((c, i) => (
              <Reveal
                key={c.title}
                from="top"
                delay={i * 120}
                className="flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-[#1b1f3b]/10"
              >
                <div className="flex-1 p-7 md:p-8">
                  {c.mark}
                  <h3 className="mt-5 text-[30px] leading-none font-extrabold tracking-[-0.04em] md:text-[32px]">
                    {c.title}
                  </h3>
                  <p className="mt-4 text-[17px] leading-relaxed">{c.body}</p>
                  <SeeMore href={c.href} />
                </div>
                <div className="h-[220px]">{c.panel}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Delivery: a full-width coral band with stripes racing behind the keke */}
        <section
          id="delivery"
          className="relative scroll-mt-20 overflow-hidden bg-[#ffd9cf] px-4 py-20 md:px-8 md:py-28"
        >
          <div
            aria-hidden
            className="lp-stripes pointer-events-none absolute inset-y-0 left-0 flex w-[200%]"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className="mx-[4%] h-full w-[6%] shrink-0 -skew-x-[24deg] bg-white/35"
              />
            ))}
          </div>
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 md:grid-cols-2">
            <Reveal from="top">
              <h2 className={h2}>
                Delivered to <span className="text-[#a8321b]">your hall</span>
              </h2>
              <p className="mt-5 max-w-lg text-[18px] leading-snug md:text-[20px]">
                Shops deliver to your hall or faculty, or meet you at a pickup spot like the Main
                Gate stand or the Library steps. Every order shows when it should reach you.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/signup" className={btn.ink}>
                  Start shopping
                </Link>
                <Link href="/open-shop" className={btn.white}>
                  Deliver for your shop
                </Link>
              </div>
            </Reveal>
            <Reveal from="top" delay={120}>
              <DeliveryKeke className="relative w-full" />
            </Reveal>
          </div>
        </section>

        {/* Order, chat, track: night in the hostel, the full width of the page */}
        <section className="relative overflow-hidden bg-[#1b1f3b] text-white">
          <div className="mx-auto grid max-w-[1400px] items-end md:grid-cols-[1fr_1.25fr]">
            <Reveal from="top" className="px-5 pt-20 pb-8 md:px-12 md:py-28">
              <h2 className={h2}>Order, chat and track in one place</h2>
              <p className="mt-5 max-w-md text-[18px] leading-snug md:text-[20px]">
                Message the seller about your order, agree a pickup time and see each update as it
                happens. All without leaving your room.
              </p>
              <Link href="/signup" className={cn(btn.white, "mt-8")}>
                Create your account
              </Link>
            </Reveal>
            <HostelRoom className="block w-full" />
          </div>
        </section>

        {/* Get started in 3 steps */}
        <section id="how" className="scroll-mt-20 bg-[#f4f5f8] px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-[1240px]">
            <Reveal from="top">
              <h2 className={cn(h2, "text-center")}>Get started in 3 steps</h2>
            </Reveal>
            <ol className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal
                  as="li"
                  key={s.n}
                  from="top"
                  delay={i * 140}
                  className="rounded-[26px] bg-white p-8 ring-1 ring-[#1b1f3b]/10"
                >
                  <span
                    className="grid size-14 place-items-center rounded-2xl text-[26px] font-extrabold text-white"
                    style={{ background: ["#3a5bff", "#ff6a4d", "#1b1f3b"][i] }}
                  >
                    {s.n}
                  </span>
                  <h3 className="mt-6 text-[24px] font-extrabold tracking-[-0.03em]">{s.title}</h3>
                  <p className="mt-2 text-[17px] leading-snug">{s.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Be the plug: a full-width cobalt band */}
        <section className="relative overflow-hidden bg-[#3a5bff] px-5 pt-20 text-center text-white md:pt-28">
          <Sparkle className="lp-twinkle absolute top-12 left-[10%] size-9" color="#ffd23f" />
          <Burst className="lp-twinkle absolute top-28 right-[9%] size-10" color="#ff6a4d" />
          <Reveal from="top" className="relative mx-auto max-w-3xl">
            <h2 className={h2}>Be the plug</h2>
            <p className="mx-auto mt-4 max-w-lg text-[18px] leading-snug md:text-[20px]">
              UNILAG is already buying. One free account for buying and selling.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/signup" className={btn.white}>
                Create your account
              </Link>
              <Link href="/login" className={btn.ink}>
                Log in
              </Link>
            </div>
          </Reveal>
          <TakeawaySet className="relative mx-auto mt-10 block w-full max-w-[640px] translate-y-2" />
        </section>

        {/* FAQs */}
        <section id="faq" className="scroll-mt-20 bg-[#f4f5f8] px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-[1240px]">
            <FaqPanel items={faqs} />
          </div>
        </section>
      </Page>

      <footer className="bg-[#1b1f3b] text-white">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:px-8">
          <div>
            <p className="text-[30px] font-extrabold tracking-[-0.055em]">
              kam<span className="text-[#9fb0ff]">plug</span>
            </p>
            <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-white/85">
              {brand.description}
            </p>
          </div>
          {[
            {
              title: "Buy",
              links: [
                ["Discover", "/explore"],
                ["Orders", "/orders"],
                ["Saved", "/wishlist"],
              ],
            },
            {
              title: "Sell",
              links: [
                ["Open a shop", "/open-shop"],
                ["Shop dashboard", "/studio"],
              ],
            },
            {
              title: "Kamplug",
              links: [
                ["How it works", "/#how"],
                ["FAQs", "/#faq"],
                ["Log in", "/login"],
                ["Create an account", "/signup"],
              ],
            },
          ].map((c) => (
            <div key={c.title}>
              <p className="text-[13px] font-extrabold tracking-[0.18em] text-[#ffd23f] uppercase">
                {c.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {c.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href!}
                      className="text-[15px] text-white/90 hover:text-white hover:underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-[1240px] overflow-hidden px-5 md:px-8" aria-hidden>
          <svg viewBox="0 0 1000 210" className="block w-full translate-y-[14%]">
            <text
              x="0"
              y="190"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fill="#ffffff"
              opacity="0.1"
              style={{ fontSize: 250, fontWeight: 800, letterSpacing: "-0.07em" }}
            >
              kamplug
            </text>
          </svg>
        </div>
        <div className="border-t border-white/15">
          <p className="mx-auto max-w-[1240px] px-5 py-6 text-[13px] text-white/80 md:px-8">
            © {brand.name}. Made for Nigerian campuses.
          </p>
        </div>
      </footer>
    </div>
  );
}
