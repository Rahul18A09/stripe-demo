
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { signup } from "@/app/actions/auth";

export default async function SignupPage({
                                             searchParams,
                                         }: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;

    return (
        <main className="min-h-screen bg-[#f7f8fb]">
            <Navbar />

            <section className="max-w-md mx-auto px-6 py-14">
                <div className="bg-white border border-gray-200 rounded-lg p-7 shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-950">
                        Create account
                    </h1>

                    <p className="mt-3 text-gray-600">
                        Make a demo account to unlock the private route.
                    </p>

                    {params.error && (
                        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                            {params.error === "supabase"
                                ? "Supabase is not ready. Check your environment keys and users table."
                                : params.error === "invalid"
                                    ? "Please fill all fields correctly."
                                    : "Something went wrong."}
                        </p>
                    )}

                    <form action={signup} className="mt-7 space-y-5">
                        <label className="block text-sm font-medium text-gray-700">
                            Name
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#2f6f68]"
                                name="name"
                                required
                                placeholder="Your name"
                            />
                        </label>

                        <label className="block text-sm font-medium text-gray-700">
                            Email
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#2f6f68]"
                                name="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                            />
                        </label>

                        <label className="block text-sm font-medium text-gray-700">
                            Password
                            <input
                                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#2f6f68]"
                                name="password"
                                type="password"
                                minLength={6}
                                required
                                placeholder="Create password"
                            />
                        </label>

                        <button className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-900">
                            Sign up
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-[#2f6f68]"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}