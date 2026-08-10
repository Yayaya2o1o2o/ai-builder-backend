import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchView } from "@/components/SearchView";

export const metadata = { title: "Search — Svaram" };

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">
        <Suspense fallback={<div className="px-5 py-10 text-center opacity-50">Loading…</div>}>
          <SearchView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
