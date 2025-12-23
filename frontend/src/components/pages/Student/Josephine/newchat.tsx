"use client";
import { useAppSelector } from "@/src/hooks/redux";
import JosephineInput from "./input";
import { useJosephineContext } from "@/src/context/josephine.provider";
import { useEffect } from "react";
import Image from "next/image";

export default function JosephineNewChat() {
  const { user } = useAppSelector((state) => state.auth);

  const { resetState } = useJosephineContext();

  useEffect(() => {
    resetState();
  }, [resetState]);
  return (
    <section className="flex h-full flex-col bg-card items-center justify-center gap-10 p-4 pb-30">
      {/* Orb Image */}
      <div className="hidden sm:block w-48 h-48 relative">
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/060/158/496/small/timeless-mid-century-a-single-glowing-orb-of-pure-energy-no-background-with-transparent-background-ultra-hd-free-png.png"
          alt="AI Assistant Orb"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Greeting Text */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-light text-foreground">
          Good Morning, {user?.name || "User2"}
        </h1>
        <h2 className="text-3xl font-light">
          How Can I <span className="text-primary">Assist You Today?</span>
        </h2>
      </div>

      {/* Input Component */}
      <JosephineInput />
    </section>
  );
}
