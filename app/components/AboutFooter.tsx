"use client";

import {
  ArrowUpRight,
  AtSign,
  Mail,
  MapPin,
} from "lucide-react";

export default function AboutFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* ABOUT SECTION */}
      <section
        id="about"
        className="relative overflow-hidden border-t border-[#dfc8c1] bg-[#f8eee9] px-6 py-24 md:px-10 md:py-32"
      >
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#d9a9a7]/20 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#ead0c8]/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            {/* LEFT */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#8d4b50]">
                About Ayosa Beauty
              </p>

              <h2 className="mt-5 max-w-xl font-serif text-5xl leading-[1.05] text-[#54252a] md:text-6xl">
                Beauty should feel
                <span className="block italic text-[#8d4b50]">
                  effortless.
                </span>
              </h2>

              <div className="mt-8 h-px w-20 bg-[#8d4b50]" />
            </div>

            {/* RIGHT */}
            <div className="max-w-2xl">
              <p className="text-base leading-8 text-[#6f595a] md:text-lg">
                Ayosa Beauty is an emerging beauty and personal care retailer
                based in Ghana, dedicated to bringing authentic, high-quality
                self-care and beauty products closer to you.
              </p>

              <p className="mt-6 text-base leading-8 text-[#6f595a] md:text-lg">
                We are passionate about making trusted international brands
                more accessible while creating a shopping experience that
                feels considered, premium and personal.
              </p>

              <div className="mt-10 rounded-[1.75rem] border border-[#dfc8c1] bg-[#fbf5f1]/80 p-7 backdrop-blur-sm md:p-8">
                <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-[#8d4b50]">
                  Our Vision
                </p>

                <p className="mt-4 font-serif text-2xl leading-relaxed text-[#54252a] md:text-3xl">
                  “To become one of Ghana&apos;s most trusted destinations
                  for authentic beauty and personal care products.”
                </p>
              </div>
            </div>
          </div>

          {/* COLLECTIONS */}
          <div className="mt-20 border-t border-[#dfc8c1] pt-14">
            <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8d4b50]">
                  Our Collections
                </p>

                <h3 className="mt-4 font-serif text-3xl text-[#54252a] md:text-4xl">
                  Thoughtfully selected.
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
                {[
                  {
                    number: "01",
                    title: "Body Care",
                  },
                  {
                    number: "02",
                    title: "Hair Care",
                  },
                  {
                    number: "03",
                    title: "Skincare",
                  },
                  {
                    number: "04",
                    title: "Beauty Essentials",
                  },
                ].map((item) => (
                  <div key={item.number}>
                    <span className="text-[9px] tracking-[0.2em] text-[#b08f8f]">
                      {item.number}
                    </span>

                    <p className="mt-3 font-serif text-lg leading-tight text-[#54252a]">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MOTTO */}
          <div className="mt-20 rounded-[2rem] bg-[#651f25] px-7 py-12 text-center md:px-12 md:py-16">
            <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#e7c8c3]">
              The Ayosa Standard
            </p>

            <p className="mx-auto mt-5 max-w-3xl font-serif text-3xl leading-relaxed text-[#fff8f4] md:text-4xl">
              “Driven by quality, chosen by those who know the difference.”
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section
        id="contact"
        className="border-t border-[#dfc8c1] bg-[#fbf5f1] px-6 py-20 md:px-10 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-center">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#8d4b50]">
                Get In Touch
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight text-[#54252a] md:text-5xl">
                We&apos;d love to hear from you.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-[#80696a]">
                Questions about an order, a product or simply want to say
                hello? Reach out to the Ayosa Beauty team.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* EMAIL */}
              <a
                href="mailto:Ayosabeauty@gmail.com"
                className="group rounded-[1.5rem] border border-[#ead8d2] bg-[#f8eee9] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#cba9a5] hover:shadow-[0_15px_35px_rgba(84,37,42,0.08)]"
              >
                <Mail
                  size={20}
                  strokeWidth={1.4}
                  className="text-[#651f25]"
                />

                <p className="mt-7 text-[9px] font-medium uppercase tracking-[0.2em] text-[#9a7c7d]">
                  Email
                </p>

                <p className="mt-2 break-words text-sm text-[#54252a]">
                  Ayosabeauty@gmail.com
                </p>

                <ArrowUpRight
                  size={15}
                  strokeWidth={1.4}
                  className="mt-5 text-[#8d4b50] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>

              {/* INSTAGRAM */}
              <a
                href="https://instagram.com/ayosa.beauty"
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.5rem] border border-[#ead8d2] bg-[#f8eee9] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#cba9a5] hover:shadow-[0_15px_35px_rgba(84,37,42,0.08)]"
              >
                <AtSign
                  size={20}
                  strokeWidth={1.4}
                  className="text-[#651f25]"
                />

                <p className="mt-7 text-[9px] font-medium uppercase tracking-[0.2em] text-[#9a7c7d]">
                  Instagram
                </p>

                <p className="mt-2 text-sm text-[#54252a]">
                  @ayosa.beauty
                </p>

                <ArrowUpRight
                  size={15}
                  strokeWidth={1.4}
                  className="mt-5 text-[#8d4b50] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>

              {/* LOCATION */}
              <div className="rounded-[1.5rem] border border-[#ead8d2] bg-[#f8eee9] p-6">
                <MapPin
                  size={20}
                  strokeWidth={1.4}
                  className="text-[#651f25]"
                />

                <p className="mt-7 text-[9px] font-medium uppercase tracking-[0.2em] text-[#9a7c7d]">
                  Location
                </p>

                <p className="mt-2 text-sm text-[#54252a]">
                  Ghana
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#54252a] text-[#f8eee9]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="grid gap-12 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr]">
            {/* BRAND */}
            <div>
              <a href="#top" className="inline-block">
                <div className="font-serif text-5xl leading-none text-[#fff7f3]">
                  AY
                </div>

                <div className="mt-2 text-[9px] tracking-[0.34em] text-[#e4c9c3]">
                  AYOSA BEAUTY
                </div>
              </a>

              <p className="mt-7 max-w-sm font-serif text-2xl leading-relaxed text-[#f8ddd7]">
                Beauty, carefully chosen.
              </p>

              <p className="mt-5 max-w-sm text-sm leading-7 text-[#d5b7b2]">
                Authentic beauty and personal care essentials, thoughtfully
                selected for your everyday rituals.
              </p>
            </div>

            {/* SHOP */}
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-[#d8b9b4]">
                Shop
              </p>

              <div className="mt-6 space-y-4">
                <a
                  href="#skincare"
                  className="block text-sm text-[#f2ddd9] transition hover:text-white"
                >
                  Skincare
                </a>

                <a
                  href="#haircare"
                  className="block text-sm text-[#f2ddd9] transition hover:text-white"
                >
                  Haircare
                </a>

                <a
                  href="#body"
                  className="block text-sm text-[#f2ddd9] transition hover:text-white"
                >
                  Body Care
                </a>

                <a
                  href="#"
                  className="block text-sm text-[#a98d8a] transition hover:text-[#f2ddd9]"
                >
                  Beauty Essentials
                </a>
              </div>
            </div>

            {/* COMPANY */}
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-[#d8b9b4]">
                Company
              </p>

              <div className="mt-6 space-y-4">
                <a
                  href="#about"
                  className="block text-sm text-[#f2ddd9] transition hover:text-white"
                >
                  About Ayosa
                </a>

                <a
                  href="#contact"
                  className="block text-sm text-[#f2ddd9] transition hover:text-white"
                >
                  Contact
                </a>

                <a
                  href="#"
                  className="block text-sm text-[#a98d8a] transition hover:text-[#f2ddd9]"
                >
                  Our Story
                </a>

                <a
                  href="#"
                  className="block text-sm text-[#a98d8a] transition hover:text-[#f2ddd9]"
                >
                  FAQs
                </a>
              </div>
            </div>

            {/* CUSTOMER CARE */}
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-[#d8b9b4]">
                Customer Care
              </p>

              <div className="mt-6 space-y-4">
                <a
                  href="#"
                  className="block text-sm text-[#a98d8a] transition hover:text-[#f2ddd9]"
                >
                  Privacy Policy
                </a>

                <a
                  href="#"
                  className="block text-sm text-[#a98d8a] transition hover:text-[#f2ddd9]"
                >
                  Terms & Conditions
                </a>

                <a
                  href="#"
                  className="block text-sm text-[#a98d8a] transition hover:text-[#f2ddd9]"
                >
                  Returns & Refunds
                </a>

                <a
                  href="#contact"
                  className="block text-sm text-[#f2ddd9] transition hover:text-white"
                >
                  Need Help?
                </a>
              </div>
            </div>
          </div>

          {/* COPYRIGHT */}
          <div className="mt-14 border-t border-[#805b5e] pt-7">
            <div className="flex flex-col gap-5 text-[10px] tracking-[0.08em] text-[#c8a9a5] md:flex-row md:items-center md:justify-between">
              <p>
                © {currentYear} Ayosa Beauty. All rights reserved.
              </p>

              <p>
                Driven by quality. Chosen by those who know the difference.
              </p>

              <p>
                Made with care in Ghana.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}