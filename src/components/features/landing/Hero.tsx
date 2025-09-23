import * as React from "react";

export default function Hero() {
  return (
    <section id="hero">
      <div className="container mx-auto px-4 flex flex-col items-center pt-28 pb-8 sm:pt-35 sm:pb-12">
        <div className="flex flex-col items-center space-y-4 w-full sm:w-4/5 text-center">
          <h1 className="flex flex-col sm:flex-row items-center text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span>JOSH Net</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-4xl sm:max-w-full md:max-w-4xl">
            At JOSH Net, Josephites come first.
            <br />
            We have created platform to solve all your academic problems.
            <br />
            So you can have a great academic journey.
          </p>
        </div>

        <div
          id="image"
          className="self-center w-full h-96 sm:h-[700px] mt-8 sm:mt-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-cover bg-center shadow-lg"
          style={{
            backgroundImage: `url("desktop-image.png")`,
            outline: "6px solid hsla(220, 25%, 80%, 0.2)",
            boxShadow: "0 0 12px 8px hsla(220, 25%, 80%, 0.2)",
          }}
          data-dark-style={{
            backgroundImage: `url("tab-image.png")`,
            outline: "6px solid hsla(220, 20%, 42%, 0.1)",
            boxShadow: "0 0 24px 12px hsla(210, 100%, 25%, 0.2)",
          }}
        />
      </div>

      <style jsx>{`
        @media (prefers-color-scheme: dark) {
          #image {
            background-image: url("tab-image.png") !important;
            outline-color: hsla(220, 20%, 42%, 0.1) !important;
            box-shadow: 0 0 24px 12px hsla(210, 100%, 25%, 0.2) !important;
          }
        }

        .dark #image {
          background-image: url("tab-image.png") !important;
          outline-color: hsla(220, 20%, 42%, 0.1) !important;
          box-shadow: 0 0 24px 12px hsla(210, 100%, 25%, 0.2) !important;
        }
      `}</style>
    </section>
  );
}
