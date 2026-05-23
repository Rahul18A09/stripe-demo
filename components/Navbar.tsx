"use client";

import Link from "next/link";
import {
    Headphones,
    LayoutDashboard,
    LogIn,
    LogOut,
    Menu,
    Search,
    ShoppingBag,
    UserPlus,
    UserRound,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useRef } from "react";

export default function Navbar() {
    const userMenuRef = useRef<HTMLDetailsElement>(null);
    const mobileMenuRef = useRef<HTMLDetailsElement>(null);

    const closeMenus = () => {
        userMenuRef.current?.removeAttribute("open");
        mobileMenuRef.current?.removeAttribute("open");
    };

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <Link
                    href="/"
                    className="flex min-w-0 items-center gap-2 text-lg tracking-[0.12em] font-light text-gray-900 sm:gap-3 sm:text-2xl sm:tracking-[0.25em]"
                >
                    <Headphones size={22} strokeWidth={1.7} className="shrink-0" />
                    <span className="truncate">Headphones</span>
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

                <div className="flex shrink-0 items-center gap-4 text-gray-700 sm:gap-5">
                    <Search size={18} aria-hidden="true" className="hidden sm:block" />
                    <Link href="/products" aria-label="View products" className="hover:text-black">
                        <ShoppingBag size={18} />
                    </Link>
                    <details ref={userMenuRef} className="group relative">
                        <summary className="flex cursor-pointer list-none items-center rounded-full hover:text-black">
                            <UserRound size={18} />
                            <span className="sr-only">Open account menu</span>
                        </summary>
                        <div className="absolute right-0 mt-4 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-2 text-sm shadow-xl">
                            <Link
                                href="/account"
                                onClick={closeMenus}
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                                <LayoutDashboard size={16} />
                                Account
                            </Link>
                            <Link
                                href="/login"
                                onClick={closeMenus}
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                                <LogIn size={16} />
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                onClick={closeMenus}
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                                <UserPlus size={16} />
                                Sign up
                            </Link>
                            <form action={logout} onSubmit={closeMenus}>
                                <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-black">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </form>
                        </div>
                    </details>
                    <details ref={mobileMenuRef} className="group md:hidden">
                        <summary className="flex cursor-pointer list-none items-center rounded-full hover:text-black">
                            <Menu size={22} />
                            <span className="sr-only">Open mobile menu</span>
                        </summary>
                        <div className="fixed left-0 right-0 top-[61px] border-b border-gray-200 bg-white p-3 text-sm font-medium shadow-xl">
                            <Link
                                href="/"
                                onClick={closeMenus}
                                className="block rounded-md px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                                Home
                            </Link>
                            <Link
                                href="/products"
                                onClick={closeMenus}
                                className="block rounded-md px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                                Products
                            </Link>
                            <Link
                                href="/plans"
                                onClick={closeMenus}
                                className="block rounded-md px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                                Plans
                            </Link>
                            <Link
                                href="/contact"
                                onClick={closeMenus}
                                className="block rounded-md px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                                Contact
                            </Link>
                        </div>
                    </details>
                </div>
            </div>
        </nav>
    );
}
