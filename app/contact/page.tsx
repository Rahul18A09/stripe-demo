import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <Navbar />
      <section className="max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 px-6 py-12 lg:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f6f68]">
            Contact
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-950">
            We are here to help with your sound.
          </h1>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            Ask about orders, headphone specs, warranty details, or business
            purchases. We usually reply within one business day.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-center gap-4 text-gray-700">
              <Mail className="text-[#2f6f68]" />
              support@headphones.test
            </div>
            <div className="flex items-center gap-4 text-gray-700">
              <Phone className="text-[#2f6f68]" />
              +91 98765 43210
            </div>
            <div className="flex items-center gap-4 text-gray-700">
              <MapPin className="text-[#2f6f68]" />
              Bengaluru, India
            </div>
          </div>
        </div>

        <form className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="text-sm font-medium text-gray-700">
              Name
              <input
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#2f6f68]"
                name="name"
                placeholder="Your name"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Email
              <input
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#2f6f68]"
                name="email"
                type="email"
                placeholder="you@example.com"
              />
            </label>
          </div>
          <label className="mt-5 block text-sm font-medium text-gray-700">
            Message
            <textarea
              className="mt-2 min-h-40 w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#2f6f68]"
              name="message"
              placeholder="How can we help?"
            />
          </label>
          <button
            type="button"
            className="mt-6 rounded-lg bg-black px-7 py-3 font-semibold text-white hover:bg-gray-900"
          >
            Send Message
          </button>
        </form>
      </section>
      <Footer />
    </main>
  );
}
