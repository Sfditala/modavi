"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-[#FDF8F3]">
      {/* يسار - Clerk */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full max-w-sm",
              card: "bg-transparent shadow-none p-0",
              headerTitle: "font-serif text-3xl text-[#1C1C1C]",
              headerSubtitle: "text-gray-400 text-sm",
              formFieldLabel: "text-xs tracking-widest text-gray-400 uppercase",
              formFieldInput:
                "bg-transparent border-0 border-b border-gray-200 rounded-none py-2.5 text-sm focus:border-[#6B2737] focus:ring-0",
              formButtonPrimary:
                "bg-[#6B2737] hover:bg-[#4a1a25] text-white text-xs tracking-widest uppercase rounded-none py-3.5",
              footerActionLink: "text-[#6B2737]",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-400 text-xs",
              socialButtonsBlockButton:
                "border border-gray-200 text-sm hover:bg-gray-50",
            },
          }}
        />
      </div>

      {/* يمين - برغاندي */}
      <div className="hidden lg:flex w-1/2 bg-[#6B2737] items-center justify-center relative overflow-hidden">
        <div
          className="absolute w-72 h-72 rounded-full border border-white opacity-10 animate-spin"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute w-44 h-44 rounded-full border border-white opacity-10 animate-spin"
          style={{ animationDuration: "8s", animationDirection: "reverse" }}
        />
        <div className="text-center text-white p-12 relative z-10">
          <h1 className="text-6xl font-serif tracking-widest mb-4">MODAVI</h1>
          <p className="text-base opacity-70 tracking-widest uppercase">
            Your Wardrobe.
            <br />
            Reimagined by AI.
          </p>
        </div>
      </div>
    </div>
  );
}
