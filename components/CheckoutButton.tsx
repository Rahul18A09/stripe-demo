"use client";

export default function CheckoutButton() {

  const handleCheckout = async () => {

    try {

      const response = await fetch("/api/checkout", {
        method: "POST",
      });

      const data = await response.json();

      console.log(data);

      // MODERN STRIPE REDIRECT
      window.location.href = data.url;

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={handleCheckout}
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        Pay Now
      </button>
    </div>
  );
}
