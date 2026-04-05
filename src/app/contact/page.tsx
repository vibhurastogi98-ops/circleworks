"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
   const [submitted, setSubmitted] = useState(false);
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      const form = e.currentTarget;

      const firstName = (form[0] as HTMLInputElement).value;
      const lastName = (form[1] as HTMLInputElement).value;
      const email = (form[2] as HTMLInputElement).value;
      const message = (form[4] as HTMLTextAreaElement).value;

      try {
         const res = await fetch(
            "https://circleworks-worker.vibhurastogi98.workers.dev/contact",
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({
                  name: `${firstName} ${lastName}`,
                  email,
                  message,
               }),
            }
         );

         const data = (await res.json()) as { success: boolean };

         if (data.success) {
            setSubmitted(true);
            form.reset();
         } else {
            alert("Failed to send message");
         }
      } catch (error) {
         console.error(error);
         alert("Something went wrong");
      }

      setLoading(false);
   };

   return (
      <main className="min-h-screen bg-[#0A1628] font-sans">
         <Navbar />

         <section className="pt-32 pb-24 flex items-center justify-center">
            <div className="max-w-xl w-full px-6">
               <div className="bg-white rounded-2xl p-8 shadow-xl">
                  {submitted ? (
                     <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Message Sent ✅</h3>
                        <button
                           onClick={() => setSubmitted(false)}
                           className="mt-4 px-4 py-2 bg-gray-200 rounded"
                        >
                           Send another
                        </button>
                     </div>
                  ) : (
                     <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                           type="text"
                           placeholder="First Name"
                           required
                           className="w-full border p-3 rounded"
                        />
                        <input
                           type="text"
                           placeholder="Last Name"
                           required
                           className="w-full border p-3 rounded"
                        />
                        <input
                           type="email"
                           placeholder="Email"
                           required
                           className="w-full border p-3 rounded"
                        />
                        <select className="w-full border p-3 rounded">
                           <option>Company Size</option>
                           <option>1-50</option>
                           <option>50-200</option>
                        </select>
                        <textarea
                           placeholder="Message"
                           required
                           className="w-full border p-3 rounded"
                        />

                        <button
                           type="submit"
                           disabled={loading}
                           className="w-full bg-blue-600 text-white py-3 rounded"
                        >
                           {loading ? "Sending..." : "Submit Request"}
                        </button>
                     </form>
                  )}
               </div>
            </div>
         </section>

         <Footer />
      </main>
   );
}