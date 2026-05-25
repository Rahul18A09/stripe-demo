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
    X,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/plans", label: "Plans" },
    { href: "/contact", label: "Contact" },
] as const;

export default function Navbar() {
    const userMenuRef = useRef<HTMLDetailsElement>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMenus = () => {
        userMenuRef.current?.removeAttribute("open");
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        const media = window.matchMedia("(min-width: 1024px)");

        const handleChange = () => {
            if (media.matches) {
                setMobileMenuOpen(false);
            }
        };

        handleChange();
        media.addEventListener("change", handleChange);
        return () => media.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);

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

                <div className="nav-desktop-links items-center gap-8 text-sm font-medium">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-gray-600 hover:text-black transition"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex shrink-0 items-center gap-4 text-gray-700 sm:gap-5">
                    <Search size={18} aria-hidden="true" className="hidden sm:block" />
                    <Link href="/products" aria-label="View products" className="hover:text-black">
                        <ShoppingBag size={18} />
                    </Link>
                    <details ref={userMenuRef} className="group relative">
                        <summary className="flex cursor-pointer list-none items-center rounded-full hover:text-black [&::-webkit-details-marker]:hidden">
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
                    <button
                        type="button"
                        className="nav-mobile-toggle items-center rounded-full hover:text-black"
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-nav-menu"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        <span className="sr-only">
                            {mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                        </span>
                    </button>
                </div>
            </div>

            <div
                id="mobile-nav-menu"
                className={`nav-mobile-panel border-t border-gray-200 bg-white shadow-xl ${mobileMenuOpen ? "is-open" : ""}`}
                aria-hidden={!mobileMenuOpen}
            >
                <nav className="mx-auto flex max-w-sm flex-col items-center gap-1 px-4 py-6 text-sm font-medium">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMenus}
                            className="w-full rounded-md px-4 py-3 text-center text-gray-700 hover:bg-gray-50 hover:text-black"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </nav>
    );
}
