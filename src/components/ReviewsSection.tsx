import siteData from "../data/site.json";

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-20 bg-rose-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-pink-500 text-sm font-semibold tracking-widest uppercase mb-2">Testimonials</p>
          <h2 className="text-4xl font-bold text-gray-800">What Our Clients Say</h2>
          <div className="w-16 h-1 bg-pink-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteData.reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
               <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
                <p className="font-semibold text-gray-800 text-sm">{review.name}</p>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-0">"{review.review}"</p>
             
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
