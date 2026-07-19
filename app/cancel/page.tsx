
import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f7f8fb] px-6 text-center">
      <h1 className="text-4xl font-bold text-red-700">Payment Cancelled</h1>
      <p className="mt-4 max-w-md text-gray-600">
        No payment was taken. You can return to the product page whenever you
        are ready.
      </p>
      <Link
        href="/products"
        className="mt-8 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-900"
      >
        Back to Products
      </Link>
    </main>
  );
}
