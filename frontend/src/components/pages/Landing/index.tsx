"use client";
import Header from "./Header";
import Hero from "./Hero";
import Features from "./Features";
import Highlights from "./Highlights";
import FAQ from "./FAQ";
import Footer from "./Footer";
import Blog from "./Blog";
import { useRef } from "react";

const smoothScrollTo = (target: HTMLElement, duration: number = 1000) => {
  const start = window.scrollY;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  const distance = targetTop - start;
  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    const easeInOut =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

    window.scrollTo(0, start + distance * easeInOut);

    if (timeElapsed < duration) requestAnimationFrame(animation);
  }
  requestAnimationFrame(animation);
};

export default function Landing() {
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const setRef = (key: string, node: HTMLElement | null) => {
    if (node) refs.current[key] = node;
  };

  const scrollTo = (key: string) => {
    const target = refs.current[key];

    if (target) smoothScrollTo(target, 1000);
  };
  return (
    <>
      <Header scrollTo={scrollTo} />
      <div >
        <Hero />
        <Features setRef={setRef}/>
        <Highlights setRef={setRef}/>
        <Blog setRef={setRef}/>
        <FAQ setRef={setRef}/>
        <Footer/>
      </div>
    </>
  );
}
