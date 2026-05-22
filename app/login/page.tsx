import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PopupMessage from "@/components/PopupMessage";
import { login } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: "logout"; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <Navbar />
      <PopupMessage type={params.message} />
      <section className="max-w-md mx-auto px-6 py-14">
        <div className="bg-white border border-gray-200 rounded-lg p-7 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-950">Login</h1>
          <p className="mt-3 text-gray-600">
            Sign in to view your private account page.
          </p>

          {params.error && (
            <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {params.error === "supabase"
                ? "Supabase is not ready. Check your environment keys and users table."
                : "Please enter your email and password."}
            </p>
          )}

          <form action={login} className="mt-7 space-y-5">
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
                required
                placeholder="Enter password"
              />
            </label>
            <button className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-900">
              Login
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-[#2f6f68]">
              Create an account
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
