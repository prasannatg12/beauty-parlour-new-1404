import siteData from "../data/site.json";

export default function OffersSection() {
  return (
    <section id="offers" className="py-20 bg-gradient-to-br from-pink-700 to-rose-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-pink-200 text-sm font-semibold tracking-widest uppercase mb-2">Special Deals</p>
          <h2 className="text-4xl font-bold">Exclusive Offers</h2>
          <div className="w-16 h-1 bg-pink-300 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {siteData.offers.map((offer, idx) => (
            <div
              key={offer.id}
              className={`relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 ${
                idx === 0 ? "ring-2 ring-pink-300" : ""
              }`}
            >
              {offer.badge && (
                <span className="absolute -top-3 left-6 bg-pink-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {offer.badge}
                </span>
              )}
              <h3 className="text-xl font-bold mt-2">{offer.title}</h3>
              <p className="text-pink-200 text-sm mb-4">{offer.subtitle}</p>

              <ul className="space-y-2 mb-6">
                {offer.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-pink-100">
                    <svg className="w-4 h-4 text-pink-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-white">{offer.offerPrice}</span>
                <span className="text-pink-300 line-through text-sm">{offer.originalPrice}</span>
              </div>

              {/* <a
                href="#booking"
                className="block w-full bg-white text-pink-700 font-semibold text-center py-2.5 rounded-full hover:bg-pink-50 transition-colors"
              >
                Book This Package
              </a> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
