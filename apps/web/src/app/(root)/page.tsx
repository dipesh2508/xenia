import Features from "@/components/home/Features";
import Hero from "../../components/home/Hero";
import Chat from "@/components/home/Chat";
import PdfShare from "@/components/home/PdfShare";

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
    </main>
  );
}
