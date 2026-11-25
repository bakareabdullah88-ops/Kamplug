import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryStrip } from "@/components/landing/category-strip";
import { FaqPanel } from "@/components/landing/faq-panel";
import { Clouds3D, GateScene } from "@/components/landing/gate-scene";
import { SpotPicker } from "@/components/landing/spot-picker";
import {
  DeliveryKeke,
  HostelRoom,
  SellPanel,
  ShopPanel,
  TuckShop,
} from "@/components/landing/illustrations";
import { HeroHeadline } from "@/components/landing/hero-headline";
import { LandingNav } from "@/components/landing/nav";
import { Reveal } from "@/components/landing/reveal";
import { Page } from "@/components/shell/page";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { seedCampuses } from "@/services/mock/seed/campuses";
import { focusCampusId } from "@/config/brand";
import { CampusBadge } from "@/components/landing/campus-badge";
import { KamplugLogo } from "@/components/app/kamplug-mark";
import { WALKING_MINUTES } from "@/domain/distance";
import { features } from "@/config/features";
import { WaitlistForm } from "@/components/landing/waitlist-form";

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

/** Before launch every way in is the waitlist form at the top of the page. */
const waitlist = features.waitlist;

const faqs = [
  {
    q: "What is Kamplug?",
    a: waitlist
      ? "Kamplug is a marketplace for UNILAG students, opening soon. Students will sell food, thrift, beauty, tech, books and more, and other students will order from them for delivery to their hall or pickup on campus."
      : "Kamplug is a marketplace for UNILAG students. Students sell food, thrift, beauty, tech, books and more, and other students order from them for delivery to their hall or pickup on campus.",
  },
  {
    q: "Does it cost anything?",
    a: waitlist
      ? "No. Joining the waitlist is free, and so are shopping and opening a shop once we open."
      : "No. Creating an account, shopping and opening a shop are all free.",
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
    a: waitlist
      ? 'Join the waitlist and pick "I want to sell". When Kamplug opens you create an account, tap Open a shop and follow five short steps: name, handle, category, where you deliver from, and your first product. It\'s free.'
      : "Create an account, tap Open a shop and follow five short steps: name, handle, category, where you deliver from, and your first product. It's free.",
  },
  {
    q: "Which campuses are on Kamplug?",
    a: `${waitlist ? "Kamplug opens at UNILAG first." : "Kamplug is live at UNILAG right now."} ${campuses
      .filter((c) => c.id !== focusCampusId)
      .map((c) => c.shortName)
      .join(", ")} are coming next.`,
  },
  {
    q: "Is Kamplug only for food?",
    a: "Not at all. Food and groceries are popular, but you'll also find fashion and thrift, beauty, tech gadgets, textbooks and past questions, and lifestyle items like gifts and room essentials.",
  },
];

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

const JOIN = "#waitlist";
const signupHref = waitlist ? JOIN : "/signup";
const sellHref = waitlist ? JOIN : "/open-shop";

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-white font-sans text-[#1b1f3b]">
      <LandingNav />
      <Page>
        {/* Hero: the UNILAG gate on a clear morning, the whole width of the page */}
        <section
          id="waitlist"
          className="relative scroll-mt-0 overflow-hidden bg-[#f4f5f8] pt-28 md:pt-36"
        >
          <Clouds3D />
          <div className="relative mx-auto max-w-4xl px-5 text-center">
            <CampusBadge />
            <HeroHeadline />
            <p className="mx-auto mt-5 max-w-xl text-[18px] leading-snug md:text-[20px]">
              Food, thrift, beauty and more from UNILAG students near you. See how far each shop is
              and how soon it gets to you.
            </p>
            {waitlist ? (
              <div className="mt-8 flex flex-col items-center gap-3">
                <p className="text-[15px] font-bold text-[#3a5bff]">
                  Opening soon. Be first in when we launch.
                </p>
                <WaitlistForm anchor />
              </div>
            ) : (
              <div className="mt-8 flex justify-center">
                <SpotPicker />
              </div>
            )}
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

        {/* Trust: how a handover works, plainly, with the real campus numbers */}
        <section
          aria-labelledby="trust-title"
          className="bg-[#1b1f3b] px-4 py-20 text-white md:px-8 md:py-28"
        >
          <div className="mx-auto grid max-w-[1240px] items-center gap-12 md:grid-cols-[1.1fr_1fr]">
            <Reveal from="top">
              <p className="text-[13px] font-bold tracking-[0.18em] text-[#9fb0ff] uppercase">
                Safe handover
              </p>
              <h2 id="trust-title" className={cn(h2, "mt-4")}>
                Pay when it&apos;s in your hands
              </h2>
              <dl className="mt-10 divide-y divide-white/15 border-y border-white/15">
                {[
                  [
                    "Handover code",
                    "Every order gets a 4-digit code only the buyer sees. The seller enters it when you have your order, and not before.",
                  ],
                  [
                    "Pay on delivery",
                    "Pay the seller when you collect or when it reaches your hall. No money changes hands before then.",
                  ],
                  [
                    "Reviews from real buyers",
                    "Only people who received an order can review it, so ratings come from real purchases.",
                  ],
                ].map(([t, d]) => (
                  <div key={t} className="grid gap-1 py-5 md:grid-cols-[200px_1fr] md:gap-6">
                    <dt className="text-[17px] font-bold">{t}</dt>
                    <dd className="text-[16px] leading-relaxed text-white/80">{d}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal from="top" delay={120}>
              {/* What the buyer sees on their order: an example code. */}
              <div className="mx-auto max-w-[400px] rounded-2xl bg-white p-7 text-[#1b1f3b]">
                <p className="text-[12px] font-bold tracking-[0.16em] text-[#5a5f78] uppercase">
                  Your handover code
                </p>
                <p
                  className="mt-3 font-mono text-[56px] leading-none font-semibold tracking-[0.3em]"
                  aria-label="Example handover code 4 8 2 7"
                >
                  4827
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-[#4a4f68]">
                  Read this to the seller once your order is in your hands.
                </p>
                <p className="mt-6 border-t border-[#1b1f3b]/10 pt-4 text-[13px] text-[#5a5f78]">
                  Example. Every order gets its own code.
                </p>
              </div>
              <p className="mt-8 text-center text-[15px] text-white/70 tabular-nums">
                {halls} halls · {faculties} faculties · {pickupSpots} pickup spots mapped at UNILAG
              </p>
            </Reveal>
          </div>
        </section>

        {/* Sell: a full-width sunny band with the tuck shop standing on its bottom edge */}
        <section
          id="sell"
          className="relative scroll-mt-20 overflow-hidden bg-[#ffe9a8] px-4 pt-20 md:px-8 md:pt-28"
        >
          <div className="mx-auto grid max-w-[1240px] items-end gap-10 md:grid-cols-2">
            <Reveal from="top" className="md:order-2 md:pb-28">
              <h2 className={h2}>
                Open a shop for <span className="text-[#2a3fc4]">₦0</span>
              </h2>
              <p className="mt-5 max-w-md text-[18px] leading-snug md:text-[20px]">
                No setup fee and no monthly fee. Set where you sell from, list your products and
                buyers nearby see you first.
              </p>
              <Link href={sellHref} className={cn(btn.cobalt, "mt-8")}>
                {waitlist ? "Join as a seller" : "Open your shop"} <ArrowRight className="size-5" />
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
                title: "Start selling",
                body: "Cook, thrift or sell gadgets and books? Open a shop in minutes and reach every student on your campus.",
                href: sellHref,
                panel: <SellPanel className="h-full w-full" />,
              },
              {
                title: "Shop your campus",
                body: "Shops nearest you come first, with the walk time. Order in a few taps and track it to your hall.",
                href: signupHref,
                panel: <ShopPanel className="h-full w-full" />,
              },
              {
                title: "Track every order",
                body: "See each step from the shop to your hall, and message the seller in the same place.",
                href: signupHref,
                panel: (
                  <div className="flex h-full flex-col justify-center gap-3 bg-[#eef1ff] px-7">
                    {["Placed", "Accepted", "On the way", "Handed over"].map((step, n) => (
                      <div key={step} className="flex items-center gap-3">
                        <span
                          className={cn(
                            "size-3 shrink-0 rounded-full",
                            n < 3 ? "bg-[#3a5bff]" : "bg-[#1b1f3b]/20",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[15px]",
                            n === 2 ? "font-bold text-[#1b1f3b]" : "text-[#4a4f68]",
                          )}
                        >
                          {step}
                        </span>
                        {n === 2 && (
                          <span className="ml-auto text-[13px] font-semibold text-[#3a5bff]">
                            About 12 min
                          </span>
                        )}
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
                  <h3 className="text-[30px] leading-none font-extrabold tracking-[-0.04em] md:text-[32px]">
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

        {/* Delivery: a full-width coral band with the keke */}
        <section
          id="delivery"
          className="relative scroll-mt-20 overflow-hidden bg-[#ffd9cf] px-4 py-20 md:px-8 md:py-28"
        >
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
                <Link href={signupHref} className={btn.ink}>
                  {waitlist ? "Join the waitlist" : "Start shopping"}
                </Link>
                {!waitlist && (
                  <Link href="/open-shop" className={btn.white}>
                    Deliver for your shop
                  </Link>
                )}
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
              <Link href={signupHref} className={cn(btn.white, "mt-8")}>
                {waitlist ? "Join the waitlist" : "Create your account"}
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
                  <span className="grid size-12 place-items-center rounded-xl bg-[#1b1f3b] text-[20px] font-bold text-white">
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
        <section className="relative overflow-hidden bg-[#3a5bff] px-5 py-20 text-center text-white md:py-28">
          <Reveal from="top" className="relative mx-auto max-w-3xl">
            <h2 className={h2}>Be the plug</h2>
            <p className="mx-auto mt-4 max-w-lg text-[18px] leading-snug md:text-[20px]">
              {waitlist
                ? "Kamplug opens at UNILAG soon. Join the waitlist and be first in, to buy or to sell."
                : "UNILAG is already buying. One free account for buying and selling."}
            </p>
            {waitlist ? (
              <div className="mt-8 flex justify-center">
                <WaitlistForm tone="dark" />
              </div>
            ) : (
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/signup" className={btn.white}>
                  Create your account
                </Link>
                <Link href="/login" className={btn.ink}>
                  Log in
                </Link>
              </div>
            )}
          </Reveal>
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
            <p className="text-[30px]">
              <KamplugLogo wordClassName="text-white" />
            </p>
            <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-white/85">
              {brand.description}
            </p>
          </div>
          {(waitlist
            ? [
                {
                  title: "Kamplug",
                  links: [
                    ["How it works", "/#how"],
                    ["FAQs", "/#faq"],
                    ["Join the waitlist", "/#waitlist"],
                  ],
                },
              ]
            : [
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
              ]
          ).map((c) => (
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
