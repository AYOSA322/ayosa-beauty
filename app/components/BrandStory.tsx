const circles = [
  {
    number: "01",
    title: "SELF CARE",
    image: "/images/ayosa-self-care.jpg",
    position:
      "left-1/2 top-16 -translate-x-1/2 md:left-[17%] md:top-8 md:translate-x-0",
    labelPosition: "top-[-38px] left-1/2 -translate-x-1/2",
  },
  {
    number: "02",
    title: "CONFIDENCE",
    image: "/images/confidence.jpg",
    position:
      "left-[7%] top-[52%] md:left-[9%] md:top-[52%]",
    labelPosition: "bottom-[-42px] left-1/2 -translate-x-1/2",
  },
  {
    number: "03",
    title: "YOU, ALWAYS",
    image: "/images/you-always.jpg",
    position:
      "right-[7%] top-[52%] md:right-[9%] md:top-[52%]",
    labelPosition: "bottom-[-42px] left-1/2 -translate-x-1/2",
  },
];

export default function BrandStory() {
  return (
    <section
      id="about"
      className="overflow-hidden bg-[#69262c] px-6 py-24 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-20 lg:grid-cols-[0.9fr_1.1fr]">

          {/* STORY TEXT */}
          <div className="text-center lg:text-left">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#e4c3bc]">
              The Ayosa Story
            </p>

            <h2 className="mt-6 font-serif text-5xl leading-[1.05] text-[#fff6f2] md:text-6xl">
              More Than Beauty,
              <br />
              <span className="italic text-[#e2b8b0]">
                It&apos;s a Lifestyle.
              </span>
            </h2>

            <div className="mx-auto mt-8 h-px w-16 bg-[#d8aaa3] lg:mx-0" />

            <p className="mx-auto mt-8 max-w-lg text-sm leading-7 text-[#efd9d4] lg:mx-0">
              Beauty is more than what you see. It is how you care for
              yourself, how you carry yourself, and how confidently you
              show up as you are.
            </p>

            <p className="mt-8 font-serif text-lg italic text-[#e6bdb6]">
              Driven by quality, chosen by those who know the difference.
            </p>

            <button className="mt-9 border border-[#e3c1ba] px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#fff6f2] transition duration-300 hover:bg-[#fff6f2] hover:text-[#69262c]">
              Our Story
            </button>
          </div>

          {/* THREE CIRCLE DESIGN */}
          <div className="relative mx-auto h-[600px] w-full max-w-[620px]">

            {circles.map((circle) => (
              <div
                key={circle.number}
                className={`absolute ${circle.position} group`}
              >

                {/* Number */}
                <div className="absolute -top-7 left-1/2 z-40 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-[#f8eee9] font-serif text-sm text-[#69262c] shadow-md">
                  {circle.number}
                </div>

                {/* Image Circle */}
                <div className="relative h-56 w-56 overflow-hidden rounded-full border border-[#e4c2ba] bg-[#7c343a] shadow-2xl transition duration-700 group-hover:scale-[1.03] md:h-64 md:w-64">

                  <img
                    src={circle.image}
                    alt={circle.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {/* Soft overlay */}
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-[#69262c]/5" />

                  {/* Inner border */}
                  <div className="pointer-events-none absolute inset-2 rounded-full border border-white/25" />
                </div>

                {/* Label */}
                <div
                  className={`absolute ${circle.labelPosition} z-50 whitespace-nowrap text-center`}
                >
                  <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#fff3ef]">
                    {circle.title}
                  </p>

                  <div className="mx-auto mt-2 h-px w-8 bg-[#d7aaa2]" />
                </div>

              </div>
            ))}

            {/* CENTER AY EMBLEM */}
            <div className="absolute left-1/2 top-[48%] z-[60] flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#f0d8d2] bg-[#69262c] shadow-[0_10px_40px_rgba(0,0,0,0.25)]">

              <div className="text-center">
                <div className="font-serif text-4xl italic text-[#f5ddd7]">
                  AY
                </div>

                <p className="text-[7px] uppercase tracking-[0.3em] text-[#dfb8b0]">
                  Beauty
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}