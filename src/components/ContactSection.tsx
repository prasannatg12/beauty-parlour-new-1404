import { useState } from "react";
import siteData from "../data/site.json";
import { FaInstagram } from "react-icons/fa";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactSection() {
  const [contactState, setContactState] = useState<FormState>("idle");
  const [bookingState, setBookingState] = useState<FormState>("idle");

  const [contact, setContact] = useState({ name: "", phone: "", message: "" });
  const [booking, setBooking] = useState({
    name: "",
    phone: "",
    service: "",
    preferredTime: "",
  });

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactState("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });
      if (res.ok) {
        setContactState("success");
        setContact({ name: "", phone: "", message: "" });
      } else {
        setContactState("error");
      }
    } catch {
      setContactState("error");
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingState("submitting");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      if (res.ok) {
        setBookingState("success");
        setBooking({ name: "", phone: "", service: "", preferredTime: "" });
      } else {
        setBookingState("error");
      }
    } catch {
      setBookingState("error");
    }
  };

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white";

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-pink-500 text-sm font-semibold tracking-widest uppercase mb-2">Reach Us</p>
          <h2 className="text-4xl font-bold text-gray-800">Contact & Book</h2>
          <div className="w-16 h-1 bg-pink-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid lg:grid-cols-1 gap-10">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Visit Us</h3>
            {[
              { icon: "📍", label: "Address", value: siteData.salon.address },
              { icon: "📞", label: "Phone", value: siteData.salon.phone },
              { icon: "📧", label: "Email", value: siteData.salon.email },
              { icon: <FaInstagram />, label: "Instagram", value: siteData.salon.instagram },
              { icon: "🕐", label: "Hours", value: siteData.salon.hours },
            ].map((item) => (
              <div className="flex gap-4">
                <span className="text-2xl shrink-0">{item.icon}</span>

                <div>
                  <div className="font-medium">{item.label}</div>



                  {item.label === "Address" ? (
                    <div style={{background:"", width:"100%"}}>

                      {item.value}
                    <br/><br/>
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3023010211086!2d79.13605717504201!3d10.788142889361366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baab961ba55b68f%3A0xe6755ddf38012e6a!2sMeena&#39;s%20Beauty%20Parlour!5e0!3m2!1sen!2sin!4v1776100651747!5m2!1sen!2sin" width="100%" height="300"
 style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>

                    </div>
                   

                  ) : item.label === "Instagram" ? (
                    <a
                      href="https://www.instagram.com/meenas_beauty_parlour_/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : item.label === "Phone" ? (
                    <a
                     href={`tel:${item.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : item.label === "Email" ? (
                    <a
                      href={`mailto:${item.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div>{item.value}</div>
                  )}
                </div>
              </div>
              // <div key={item.label} className="flex gap-4">
              //   <span className="text-2xl shrink-0">{item.icon}</span>
              //   <div>
              //     <p className="text-xs text-pink-500 font-semibold uppercase tracking-wide">{item.label}</p>
              //     <p className="text-gray-700 text-sm">{item.value}</p>
              //   </div>
              // </div>
            ))}
          </div>

          {/* <div id="booking" className="bg-rose-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Send a Message</h3>
            {contactState === "success" ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-green-700 font-semibold">Message sent!</p>
                <p className="text-gray-500 text-sm mt-1">We'll get back to you shortly.</p>
                <button
                  onClick={() => setContactState("idle")}
                  className="mt-4 text-pink-600 text-sm underline"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-4">
                <input
                  className={inputCls}
                  placeholder="Your Name"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  required
                />
                <input
                  className={inputCls}
                  placeholder="Phone Number"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  required
                />
                <textarea
                  className={`${inputCls} resize-none h-28`}
                  placeholder="Your Message"
                  value={contact.message}
                  onChange={(e) => setContact({ ...contact, message: e.target.value })}
                  required
                />
                {contactState === "error" && (
                  <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={contactState === "submitting"}
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {contactState === "submitting" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div> */}

          {/* <div className="bg-pink-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Book Appointment</h3>
            {bookingState === "success" ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-green-700 font-semibold">Booking confirmed!</p>
                <p className="text-gray-500 text-sm mt-1">We'll contact you to confirm details.</p>
                <button
                  onClick={() => setBookingState("idle")}
                  className="mt-4 text-pink-600 text-sm underline"
                >
                  Book another
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <input
                  className={inputCls}
                  placeholder="Your Name"
                  value={booking.name}
                  onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                  required
                />
                <input
                  className={inputCls}
                  placeholder="Phone Number"
                  value={booking.phone}
                  onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                  required
                />
                <select
                  className={inputCls}
                  value={booking.service}
                  onChange={(e) => setBooking({ ...booking, service: e.target.value })}
                  required
                >
                  <option value="">Select a Service</option>
                  {siteData.services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  className={inputCls}
                  placeholder="Preferred Time (e.g. Mon 10 AM)"
                  value={booking.preferredTime}
                  onChange={(e) => setBooking({ ...booking, preferredTime: e.target.value })}
                  required
                />
                {bookingState === "error" && (
                  <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={bookingState === "submitting"}
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {bookingState === "submitting" ? "Booking..." : "Book Appointment"}
                </button>
              </form>
            )}
          </div> */}
        </div>
      </div>
    </section>
  );
}
