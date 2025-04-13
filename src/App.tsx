import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Lock } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

// Load your Stripe public key
const stripePromise = loadStripe(
  "pk_test_51R3BLMA5gH1ZfN72S1hVfOBQRDrmeoVKIJbnsq2SEqH2MSouFHTAyLuvVGvzeGubtCfeFeZjtI4oahr8A3j2CfNZ00nySTc394"
);

function App() {
  const [amount, setAmount] = useState("");
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await stripePromise;
      if (!stripeInstance) {
        console.error("Stripe failed to load");
        return;
      }

      const elementsInstance = stripeInstance.elements();
      const card = elementsInstance.create("card");
      card.mount("#card");

      setStripe(stripeInstance);
      setElements(elementsInstance);
      setCardElement(card);
    };

    initializeStripe();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !cardElement) {
      toast.error("Stripe not fully loaded yet.");
      return;
    }

    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      // 1. Create payment intent
      const res = await fetch(
        "http://localhost:4000/api/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount) * 100 }),
        }
      );

      const data = await res.json();

      if (!data.clientSecret) {
        throw new Error(data.error || "Failed to get client secret");
      }

      // 2. Confirm payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
      } else if (result.paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        setAmount("");
        cardElement.clear();
      } else {
        toast.error("Payment failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <CreditCard className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Checkout
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure payment processing with 3D Secure
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  $
                </span>
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div id="card" className="border p-2 rounded-md" />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
              </span>
              Pay
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p className="flex items-center justify-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Payments are secure and encrypted</span>
          </p>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
