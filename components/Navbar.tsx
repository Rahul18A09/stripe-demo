import Link from "next/link";
import {
    Headphones,
    LayoutDashboard,
    LogIn,
    LogOut,
    Search,
    ShoppingBag,
    UserPlus,
    UserRound,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                <Link
                    href="/"
                    className="flex items-center gap-3 text-2xl tracking-[0.25em] font-light text-gray-900"
                >
                    <Headphones size={24} strokeWidth={1.7} />
                    Headphones
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/" className="text-gray-600 hover:text-black transition">
                        Home
                    </Link>
                    <Link href="/products" className="text-gray-600 hover:text-black transition">
                        Products
                    </Link>
                    <Link href="/plans" className="text-gray-600 hover:text-black transition">
                        Plans
                    </Link>
                    <Link href="/contact" className="text-gray-600 hover:text-black transition">
                        Contact
                    </Link>
                </div>

                <div className="flex items-center gap-5 text-gray-700">
                    <Search size={18} aria-hidden="true" />
                    <Link href="/products" aria-label="View products" className="hover:text-black">
                        <ShoppingBag size={18} />
                    </Link>
                    <details className="group relative">
                        <summary className="flex cursor-pointer list-none items-center rounded-full hover:text-black">
                            <UserRound size={18} />
                            <span className="sr-only">Open account menu</span>
                        </summary>
                        <div className="absolute right-0 mt-4 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-2 text-sm shadow-xl">
                            <Link
                                href="/account"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                                <LayoutDashboard size={16} />
                                Account
                            </Link>
                            <Link
                                href="/login"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                                <LogIn size={16} />
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                                <UserPlus size={16} />
                                Sign up
                            </Link>
                            <form action={logout}>
                                <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-black">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </form>
                        </div>
                    </details>
                </div>
            </div>
        </nav>
    );
}
