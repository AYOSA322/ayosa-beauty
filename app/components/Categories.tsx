const categories = [
  {
    name: "Skincare",
    description: "Nourish your natural glow",
    image: "/images/ayosa-skincare.jpg",
    available: true,
    target: "#skincare",
  },
  {
    name: "Haircare",
    description: "Care for every strand",
    image: "/images/ayosa-haircare.jpg",
    available: true,
    target: "#haircare",
  },
  {
    name: "Body",
    description: "Indulge your skin",
    image: "/images/ayosa-body.jpg",
    available: true,
    target: "#body",
  },
  {
    name: "Makeup",
    description: "Express your beauty",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85",
    available: false,
    target: "#",
  },
  {
    name: "Accessories",
    description: "Complete your look",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
    available: false,
    target: "#",
  },
];

export default function Categories() {
  return (
    <section
      id="shop"
      className="bg-[#f8eee9] px-6 py-20 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-12 flex items-center gap-6">
          <div className="h-px flex-1 bg-[#b98b84]" />

          <div className="shrink-0 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#9a5559]">
              Explore
            </p>

            <h2 className="mt-2 font-serif text-4xl text-[#61252b] md:text-5xl">
              Shop by Category
            </h2>
          </div>

          <div className="h-px flex-1 bg-[#b98b84]" />
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-5">

          {categories.map((category) => (
            <div
              key={category.name}
              className="group text-center"
            >

              {/* Image */}
              <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[#e7d3cc]">

                {category.available ? (
                  <a
                    href={category.target}
                    className="block h-full w-full"
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-[#5f2027]/0 transition duration-500 group-hover:bg-[#5f2027]/10" />
                  </a>
                ) : (
                  <>
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover brightness-[0.55] grayscale-[15%]"
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 text-white">
                        <span className="text-lg">◷</span>
                      </div>

                      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white">
                        Coming Soon
                      </p>
                    </div>
                  </>
                )}

              </div>

              {/* Category Name */}
              <h3 className="mt-5 font-serif text-sm uppercase tracking-[0.25em] text-[#61252b]">
                {category.name}
              </h3>

              {/* Description */}
              <p className="mt-2 text-xs leading-5 text-[#806365]">
                {category.description}
              </p>

              {/* Action */}
              {category.available ? (
                <a
                  href={category.target}
                  className="mt-4 inline-block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7d3037] transition duration-300 hover:tracking-[0.35em]"
                >
                  Shop <span className="ml-1">→</span>
                </a>
              ) : (
                <div className="mx-auto mt-4 inline-flex rounded-sm bg-[#ead4cd] px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a5559]">
                  Coming Soon
                </div>
              )}

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}