import Features from "@/components/home/Features";
import Hero from "../../components/home/Hero";
import Chat from "@/components/home/Chat";
import PdfShare from "@/components/home/PdfShare";
import Whiteboard from "@/components/home/Whiteboard";
import Cta from "@/components/home/Cta";

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

      <section className="lazy-section">
        <PdfShare />
      </section>

      <section className="lazy-section">
        <Whiteboard />
      </section>

      <section className="lazy-section">
        <Cta />
      </section>
    </main>
  );
}
