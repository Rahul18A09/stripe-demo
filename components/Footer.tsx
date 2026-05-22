import Link from "next/link";
import { Headphones, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-xl tracking-[0.25em] font-light text-gray-950"
            >
              <Headphones size={22} strokeWidth={1.7} />
              Headphones
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600">
              Premium wireless headphones made for clean sound, long listening,
              and everyday comfort.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-950">
              Explore
            </h2>
            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
              <Link href="/" className="hover:text-black">
                Home
              </Link>
              <Link href="/products" className="hover:text-black">
                Products
              </Link>
              <Link href="/plans" className="hover:text-black">
                Plans
              </Link>
              <Link href="/contact" className="hover:text-black">
                Contact
              </Link>
              <Link href="/account" className="hover:text-black">
                Account
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-950">
              Support
            </h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <p className="flex items-center gap-3">
                <Mail size={16} className="text-[#2f6f68]" />
                support@headphones.test
              </p>
              <p className="flex items-center gap-3">
                <Phone size={16} className="text-[#2f6f68]" />
                +91 98765 43210
              </p>
              <p className="flex items-center gap-3">
                <MapPin size={16} className="text-[#2f6f68]" />
                Bengaluru, India
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Headphones. All rights reserved.</p>
          <p>Secure checkout powered by Stripe.</p>
        </div>
      </div>
    </footer>
  );
}
