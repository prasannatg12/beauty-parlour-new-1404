import siteData from "../data/site.json";

export default function AboutSection() {
  const { about, salon } = siteData;
  return (
    <section id="about" className="py-20 bg-rose-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-pink-500 text-sm font-semibold tracking-widest uppercase mb-2">Our Story</p>
          <h2 className="text-4xl font-bold text-gray-800">About Us</h2>
          <div className="w-16 h-1 bg-pink-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-gray-600 text-lg leading-relaxed">{about.story}</p>

            <blockquote className="border-l-4 border-pink-500 pl-6 italic text-gray-700 text-lg">
              "{about.ownerMessage}"
            </blockquote>
            <p className="text-pink-600 font-semibold">
              — {about.ownerName}, {about.ownerTitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: salon.happyCustomers, label: "Happy Customers", icon: "💄" },
              { value: salon.yearsExperience, label: "Years Experience", icon: "✨" },
              { value: salon.services, label: "Services Offered", icon: "💅" },
              { value: "4.8★", label: "Avg. Rating out of 5", icon: "⭐" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-3xl font-bold text-pink-600">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
