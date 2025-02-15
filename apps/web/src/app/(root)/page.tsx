import Features from "@/components/home/Features";
import Hero from "../../components/home/Hero";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Priority loading for above-the-fold content */}
      <Hero />

      {/* Suspense boundaries for better loading performance */}
      <section className="lazy-section">
        <Features />
      </section>

      {/* <section className="lazy-section">
            <CTA />
          </section>
          
          <section className="lazy-section">
            <About />
          </section>
          
          <section className="lazy-section">
            <Contact />
          </section> */}
    </main>
  );
}
