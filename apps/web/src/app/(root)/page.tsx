import Features from "@/components/home/Features";
import Hero from "../../components/home/Hero";
import Chat from "@/components/home/Chat";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Priority loading for above-the-fold content */}
      <Hero />

      {/* Suspense boundaries for better loading performance */}
      <section className="lazy-section">
        <Features />
      </section>

      <section className="lazy-section">
        <Chat />
      </section>

      {/* <section className="lazy-section">
            <About />
          </section>
          
          <section className="lazy-section">
            <Contact />
          </section> */}
    </main>
  );
}
