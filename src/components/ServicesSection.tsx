import siteData from "../data/site.json";

const icons: Record<string, string> = {
  "Bridal Makeup": "👰",
  "Hair Styling": "💇",
  "Facial & Skin Care": "🧖",
  "Mehendi": "🌿",
  "Threading & Waxing": "✂️",
  "Manicure & Pedicure": "💅",
};

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-pink-500 text-sm font-semibold tracking-widest uppercase mb-2">What We Offer</p>
          <h2 className="text-4xl font-bold text-gray-800">Our Services</h2>
          <div className="w-16 h-1 bg-pink-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteData.services.map((service) => (
            <div
              key={service.id}
              className="group bg-rose-50 hover:bg-pink-600 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{icons[service.name] ?? "💄"}</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-white mb-2">
                {service.name}
              </h3>
              <p className="text-gray-500 group-hover:text-pink-100 text-sm mb-4">
                {service.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-600 group-hover:text-white font-bold text-lg">
                    {service.price}
                  </p>
                  <p className="text-gray-400 group-hover:text-pink-200 text-xs">
                    {service.duration}
                  </p>
                </div>
                {/* <a
                  href="#booking"
                  className="bg-white group-hover:bg-pink-700 text-pink-600 group-hover:text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  Book Now
                </a> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
