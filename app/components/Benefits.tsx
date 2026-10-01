import {
  Truck,
  ShieldCheck,
  Heart,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Fast & Reliable",
    subtitle: "Delivery",
  },
  {
    icon: ShieldCheck,
    title: "Authentic",
    subtitle: "Products",
  },
  {
    icon: Heart,
    title: "Customer",
    subtitle: "Satisfaction",
  },
  {
    icon: Sparkles,
    title: "Beauty for",
    subtitle: "Every You",
  },
];

export default function Benefits() {
  return (
    <section className="border-y border-[#dcc4bc] bg-[#ead9d2]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;

          return (
            <div
              key={benefit.title}
              className={`flex items-center justify-center gap-4 px-6 py-7 ${
                index !== benefits.length - 1
                  ? "border-r border-[#cdb2aa]"
                  : ""
              }`}
            >
              <Icon
                size={27}
                strokeWidth={1.3}
                className="shrink-0 text-[#70272d]"
              />

              <div className="text-left">
                <p className="font-serif text-sm text-[#5f292e]">
                  {benefit.title}
                </p>

                <p className="font-serif text-sm text-[#5f292e]">
                  {benefit.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}