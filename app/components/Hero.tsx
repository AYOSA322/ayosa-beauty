"use client";

import { motion } from "framer-motion";

const ownerPhotos = [
  {
    image: "/images/ayosa-hero-1.jpg",
    label: "VISION",
    position:
      "left-1/2 top-8 -translate-x-1/2 md:left-[20%] md:top-[5%] md:translate-x-0",
  },
  {
    image: "/images/ayosa-hero-2.jpg",
    label: "PASSION",
    position:
      "left-[4%] top-[46%] md:left-[5%] md:top-[49%]",
  },
  {
    image: "/images/ayosa-hero-3.jpg",
    label: "QUALITY",
    position:
      "right-[4%] top-[46%] md:right-[5%] md:top-[49%]",
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-[700px] overflow-hidden bg-[#ead5ce]">
      
      {/* Soft background glow */}
      <div className="absolute left-[45%] top-0 h-[500px] w-[500px] rounded-full bg-[#f7e8e3]/70 blur-3xl" />

      <div className="absolute bottom-[-200px] right-[-100px] h-[500px] w-[500px] rounded-full bg-[#b98278]/20 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-[700px] max-w-7xl items-center gap-12 px-6 py-16 md:px-10 lg:grid-cols-[0.9fr_1.1fr]">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center lg:text-left"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#7a3035]">
            Premium Beauty Essentials
          </p>

          <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-[#5f2027] sm:text-6xl md:text-7xl">
            Beauty That
            <br />
            Works for{" "}
            <span className="italic text-[#8d454b]">
              You
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-md text-sm leading-7 text-[#684b4d] lg:mx-0">
            Discover carefully selected beauty essentials designed
            to help you care for yourself, express your confidence,
            and feel beautiful in every moment.
          </p>

          <button
            type="button"
            className="mt-8 bg-[#6d2229] px-9 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-white transition duration-300 hover:-translate-y-1 hover:bg-[#50171d] hover:shadow-xl"
          >
            Shop Now
            <span className="ml-5">→</span>
          </button>

          {/* Founder statement */}
          <div className="mt-12 border-l border-[#a56d68] pl-5 text-left">
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#7a3035]">
              The Face Behind Ayosa
            </p>

            <p className="mt-2 font-serif text-lg italic text-[#6c3035]">
              Driven by quality.
            </p>

            <p className="text-xs leading-5 text-[#806365]">
              Chosen by those who know the difference.
            </p>
          </div>
        </motion.div>

        {/* RIGHT — THREE OWNER PHOTOS */}
        <div className="relative mx-auto h-[560px] w-full max-w-[620px]">

          {/* Decorative ring */}
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b98278]/30" />

          <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b98278]/20" />

          {ownerPhotos.map((photo, index) => (
            <motion.div
              key={photo.label}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
              }}
              className={`absolute ${photo.position} z-20 group`}
            >
              {/* Label */}
              <div className="absolute -top-9 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap">
                <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-[#70272d]">
                  {photo.label}
                </p>

                <div className="mx-auto mt-2 h-px w-6 bg-[#9f625f]" />
              </div>

              {/* Number */}
              <div className="absolute -right-1 top-2 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-[#70272d]/40 bg-[#f8eee9] font-serif text-[10px] text-[#70272d]">
                0{index + 1}
              </div>

              {/* Circle */}
              <div className="relative h-48 w-48 overflow-hidden rounded-full border-[5px] border-[#f8eee9] shadow-[0_20px_50px_rgba(91,37,43,0.22)] transition duration-700 group-hover:scale-105 md:h-56 md:w-56">
                <img
                  src={photo.image}
                  alt={`Ayosa Beauty owner - ${photo.label}`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="pointer-events-none absolute inset-2 rounded-full border border-white/40" />
              </div>
            </motion.div>
          ))}

          {/* CENTER BADGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="absolute left-1/2 top-[48%] z-50 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#f4ddd7] bg-[#6b252b] shadow-[0_15px_50px_rgba(75,20,25,0.35)]"
          >
            <div className="text-center">
              <div className="font-serif text-4xl italic text-[#f7e4df]">
                AY
              </div>

              <p className="mt-1 text-[7px] uppercase tracking-[0.35em] text-[#e2b8b0]">
                Founder & CEO
              </p>
            </div>
          </motion.div>

          {/* Small decorative text */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
            <p className="text-[9px] uppercase tracking-[0.35em] text-[#7a3035]">
              Beauty • Quality • Confidence
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}