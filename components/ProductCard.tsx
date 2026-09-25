"use client";

import Image from "next/image";
import {
    Bluetooth,
    BatteryCharging,
    Mic,
    Minus,
    Plus,
    ShieldCheck,
    Lock,
} from "lucide-react";
import { useState } from "react";

export default function ProductCard() {
    const [quantity, setQuantity] = useState(1);
    const unitPrice = 59.99;
    const subtotal = (unitPrice * quantity).toFixed(2);

    const handleCheckout = async () => {
        const response = await fetch("/api/checkout", { method: "POST" });
        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        }
    };

    return (
        <div className="bg-[#f5f5f7] flex items-center justify-center px-4 py-10">

            <div
                className="w-full max-w-[980px] bg-white rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-5 sm:p-8">

                <div className="relative w-full h-[280px] sm:h-[420px] bg-[#eef0f2] rounded-lg overflow-hidden">

                    <Image
                        src="/headphone.jpg"
                        alt="Wireless Headphones"
                        fill
                        sizes="(max-width: 768px) 100vw, 850px"
                        className="object-contain p-6 sm:p-10"
                        priority
                    />
                </div>

                <div className="flex items-start justify-between mt-7 gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-black">
                            Pulse Wireless Headphones
                        </h1>

                        <p className="text-gray-500 text-base sm:text-2xl leading-relaxed mt-4 max-w-[520px]">
                            High quality sound with deep bass and all-day comfort.
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-5xl font-semibold text-black whitespace-nowrap">
                        ${unitPrice}
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-6 sm:gap-10 mt-10">

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                            <Bluetooth size={22} className="text-gray-500"/>
                        </div>

                        <span className="text-gray-600 text-lg">
              Bluetooth 5.3
            </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                            <BatteryCharging size={22} className="text-gray-500"/>
                        </div>

                        <span className="text-gray-600 text-lg">
              30H Battery
            </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                            <Mic size={22} className="text-gray-500"/>
                        </div>

                        <span className="text-gray-600 text-lg">
              Built-in Mic
            </span>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-10 pt-8 flex items-center justify-between">

                    <h3 className="text-2xl font-medium text-black">
                        Quantity
                    </h3>

                    <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                            className="px-5 py-3 hover:bg-gray-100 transition"
                        >
                            <Minus size={18} className="text-gray-500"/>
                        </button>

                        <span className="px-6 text-gray-500 font-medium">
              {quantity}
            </span>

                        <button
                            type="button"
                            onClick={() => setQuantity((value) => value + 1)}
                            className="px-5 py-3 hover:bg-gray-100 transition"
                        >
                            <Plus size={18} className="text-gray-500"/>
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-8 pt-8 flex items-center justify-between">

                    <h3 className="text-2xl font-medium text-black">
                        Subtotal
                    </h3>

                    <h3 className="text-3xl font-semibold text-black">
                        ${subtotal}
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full bg-black hover:bg-[#111111] transition text-white rounded-2xl h-[78px] mt-8 flex items-center justify-center gap-4">

                    <Lock size={24}/>

                    <span className="text-2xl font-semibold">
            Pay ${subtotal}
          </span>
                </button>

                <div className="flex items-center justify-center gap-3 mt-8 text-gray-500">

                    <ShieldCheck size={20}/>

                    <p className="text-base sm:text-lg">
                        Secure payment powered by Stripe
                    </p>
                </div>
            </div>
        </div>
    );
}
