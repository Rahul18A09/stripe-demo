import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f7f8fb] px-6 text-center">
      <h1 className="text-4xl font-bold text-green-700">Payment Successful</h1>
      <p className="mt-4 max-w-md text-gray-600">
        Thanks for your order. Your checkout completed successfully.
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
