const galleryItems = [
  { id: 1, label: "Bridal Makeup", src: "/gallery/bridal-makeup.png" },
  { id: 2, label: "Hair Styling", src: "/gallery/hair-styling.png" },
  { id: 3, label: "Mehendi Art", src: "/gallery/mehendi-art.png" },
  { id: 4, label: "Skin Glow", src: "/gallery/skin-glow.png" },
  { id: 5, label: "Nail Art", src: "/gallery/nail-art.png" },
  { id: 6, label: "Party Look", src: "/gallery/party-look.png" },
  { id: 7, label: "Eye Makeup", src: "/gallery/eye-makeup.png" },
  { id: 8, label: "Bridal Glow", src: "/gallery/bridal-glow.png" },
  { id: 9, label: "Classic Look", src: "/gallery/classic-look.png" },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-pink-500 text-sm font-semibold tracking-widest uppercase mb-2">Our Work</p>
          <h2 className="text-4xl font-bold text-gray-800">Gallery</h2>
          <div className="w-16 h-1 bg-pink-500 mx-auto mt-4 rounded-full" />
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            A glimpse into the transformations we create every day.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <img
                src={item.src}
                alt={item.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-4">
                <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
