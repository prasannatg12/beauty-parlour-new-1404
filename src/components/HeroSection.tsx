import siteData from "../data/site.json";


export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col items-center justify-center text-white overflow-hidden pt-24 pb-32 md:py-20"
      style={{
        background: "linear-gradient(135deg, #831843 100%, #9d174d 80%, #be185d 0%, #db2777 0%)",
      }}
    >
      <div>
        <img src="/gallery/bg.jpg" alt="Salon Hero" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      </div>
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              background: "white",
              top: `${10 + i * 12}%`,
              left: `${5 + i * 13}%`,
              animation: `float ${3 + i}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div> */}

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-pink-200 text-sm font-semibold tracking-[0.3em] uppercase mb-4">
          Welcome to
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 leading-tight">
          {siteData.salon.name}
        </h1>
        <p className="text-xl md:text-2xl text-pink-100 font-light mb-3 italic">
          "{siteData.salon.tagline}"
        </p>
        <p className="text-pink-200 mb-10 text-sm tracking-widest">
          Thanjavur, Tamil Nadu
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {/* <a
            href="#booking"
            className="bg-white text-pink-700 font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Book Appointment
          </a> */}
          <a
            href="#services"
            className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-pink-700 transition-all"
          >
            Our Services
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-16">
          {[
            { value: siteData.salon.happyCustomers, label: "Happy Customers" },
            { value: siteData.salon.yearsExperience, label: "Years Experience" },
            { value: siteData.salon.services, label: "Services" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-pink-200 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-pink-200 hover:text-white transition-colors"
      >
        <span className="text-xs tracking-widest">Scroll</span>
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </a>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </section>
  );
}
