import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-[#f7f8fb] overflow-hidden relative">
            <Navbar />

            <section className="relative max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-24">
                <div className="relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    <div className="z-10 text-center lg:text-left">

                        <div className="inline-flex items-center bg-black text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg">
                            Premium Audio Experience
                        </div>

                        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-black leading-tight text-gray-900">
                            Feel The
                            <span className="block text-[#2f6f68]">
                Music
              </span>
                        </h1>

                        <p className="mt-6 text-base sm:text-lg leading-7 text-gray-600 max-w-xl mx-auto lg:mx-0">
                            Immerse yourself in crystal-clear sound, deep bass, and next-level
                            comfort with our premium wireless headphones built for music lovers.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">

                            <Link
                                href="/products"
                                className="px-8 py-4 rounded-lg bg-black text-white font-semibold text-lg hover:bg-gray-900 transition shadow-xl"
                            >
                                Buy Now
                            </Link>

                            <Link
                                href="/products"
                                className="px-8 py-4 rounded-lg bg-white border border-gray-200 text-gray-900 font-semibold text-lg hover:border-black hover:shadow-lg transition"
                            >
                                Explore More
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-10 max-w-lg mx-auto lg:mx-0">

                            {[
                                { value: "30H", label: "Battery" },
                                { value: "5.3", label: "Bluetooth" },
                                { value: "HD", label: "Audio" },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm text-center"
                                >
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        {item.value}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center">

                        <div className="relative w-full max-w-[520px] aspect-square rounded-lg bg-white border border-gray-200 shadow-[0_20px_80px_rgba(0,0,0,0.10)] flex items-center justify-center p-8">
                            <Image
                                src="/headphone.jpg"
                                alt="Wireless Headphones"
                                width={450}
                                height={450}
                                priority
                                className="object-contain w-full max-w-[420px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
                            />
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
