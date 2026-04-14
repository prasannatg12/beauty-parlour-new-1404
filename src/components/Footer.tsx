import siteData from "../data/site.json";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-pink-400 font-bold text-lg mb-2">{siteData.salon.name}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{siteData.salon.description}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm tracking-wider uppercase text-gray-300">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {["About", "Services", "Gallery", "Offers", "Reviews", "Contact"].map((l) => (
                <li key={l}>
                  <a href={`#${l.toLowerCase()}`} className="hover:text-pink-400 transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm tracking-wider uppercase text-gray-300">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>{siteData.salon.address}</li>
              <li>{siteData.salon.phone}</li>
              <li>{siteData.salon.email}</li>
              <li>{siteData.salon.hours}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} {siteData.salon.name}. All rights reserved. | Thanjavur, Tamil Nadu
        </div>
      </div>
    </footer>
  );
}
