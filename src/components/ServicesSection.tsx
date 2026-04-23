import { useState, type FormEvent } from "react";
import siteData from "../data/site.json";
import supabase from "../hooks/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

const icons: Record<string, string> = {
  "Bridal Makeup": "👰",
  "Hair Styling": "💇",
  "Facial & Skin Care": "🧖",
  "Mehendi": "🌿",
  "Threading & Waxing": "✂️",
  "Manicure & Pedicure": "💅",
};

type BookingForm = {
  name: string;
  phone: string;
  email: string;
  service: string;
  preferredTime: string;
  notes: string;
};

type BookingErrors = Partial<Record<keyof Omit<BookingForm, "email" | "notes">, string>>;

export default function ServicesSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [booking, setBooking] = useState<BookingForm>({
    name: "",
    phone: "",
    email: "",
    service: "",
    preferredTime: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<BookingErrors>({});
  const [submissionState, setSubmissionState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const openBookingDialog = (serviceName: string) => {
    setBooking((prev) => ({ ...prev, service: serviceName }));
    setFormErrors({});
    setSubmissionState("idle");
    setDialogOpen(true);
  };

  const validateBooking = () => {
    const errors: BookingErrors = {};
    if (!booking.name.trim()) {
      errors.name = "Please enter your name.";
    }
    if (!booking.phone.trim()) {
      errors.phone = "Please enter your mobile number.";
    } else if (!/^\d{10,15}$/.test(booking.phone.trim())) {
      errors.phone = "Please enter a valid mobile number.";
    }
    if (!booking.service.trim()) {
      errors.service = "Please select a service.";
    }
    if (!booking.preferredTime.trim()) {
      errors.preferredTime = "Please enter your preferred time.";
    }
    return errors;
  };

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateBooking();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmissionState("error");
      return;
    }

    setSubmissionState("submitting");

    const now = new Date().toISOString();
    const createdBy = booking.email.trim() || booking.name.trim() || "Guest";

    const { error } = await supabase.from("booking").insert([
      {
        name: booking.name.trim(),
        phone: booking.phone.trim(),
        email: booking.email.trim() || null,
        service: booking.service,
        preferred_time: booking.preferredTime.trim(),
        notes: booking.notes.trim() || null,
        created_by: createdBy,
        created_on: now,
        updated_by: createdBy,
        updated_on: now,
      },
    ]);

    if (error) {
      setSubmissionState("error");
      console.error("Booking save failed:", error);
      return;
    }

    setSubmissionState("success");
    setBooking({ name: "", phone: "", email: "", service: "", preferredTime: "", notes: "" });
  };

  const inputCls =
    "w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white";

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
                <button
                  type="button"
                  onClick={() => openBookingDialog(service.name)}
                  className="bg-white group-hover:bg-pink-700 text-pink-600 group-hover:text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-lg rounded-3xl bg-white text-gray-900 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold">Book an Appointment</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Complete your booking details below and we will confirm your appointment.
              </DialogDescription>
            </div>
            <DialogClose className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          {submissionState === "success" ? (
            <div className="space-y-4 pt-6 text-center">
              <p className="text-4xl">🎉</p>
              <p className="text-lg font-semibold text-gray-900">Booking submitted!</p>
              <p className="text-sm text-gray-600">
                We have received your request and will contact you soon.
              </p>
              <DialogFooter className="mt-2 flex justify-center gap-3">
                <DialogClose className="inline-flex items-center justify-center rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-700">
                  Close
                </DialogClose>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Name *</label>
                  <input
                    className={inputCls}
                    placeholder="Your Name"
                    value={booking.name}
                    onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Mobile Number *</label>
                  <input
                    className={inputCls}
                    placeholder="10 digit number"
                    value={booking.phone}
                    onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="Optional email address"
                    value={booking.email}
                    onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Service *</label>
                  <select
                    className={inputCls}
                    value={booking.service}
                    onChange={(e) => setBooking({ ...booking, service: e.target.value })}
                  >
                    <option value="">Select a Service</option>
                    {siteData.services.map((serviceOption) => (
                      <option key={serviceOption.id} value={serviceOption.name}>
                        {serviceOption.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.service && <p className="text-red-500 text-xs mt-1">{formErrors.service}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Preferred Time *</label>
                  <input
                    className={inputCls}
                    placeholder="Preferred time (e.g., Mon 10 AM)"
                    value={booking.preferredTime}
                    onChange={(e) => setBooking({ ...booking, preferredTime: e.target.value })}
                  />
                  {formErrors.preferredTime && <p className="text-red-500 text-xs mt-1">{formErrors.preferredTime}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Notes</label>
                  <textarea
                    className={`${inputCls} h-28 resize-none`}
                    placeholder="Optional notes"
                    value={booking.notes}
                    onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                  />
                </div>
              </div>

              {submissionState === "error" && (
                <p className="text-red-500 text-sm">There was a problem saving your booking. Please try again.</p>
              )}

              <DialogFooter className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </DialogClose>
                <button
                  type="submit"
                  disabled={submissionState === "submitting"}
                  className="inline-flex items-center justify-center rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-700 disabled:opacity-60"
                >
                  {submissionState === "submitting" ? "Saving..." : "Confirm Booking"}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
