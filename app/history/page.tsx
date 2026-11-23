import type { Metadata } from "next";
import Link from "next/link";
import StartHistory from "@/components/history/start-history";
import Providers from "../providers";

export const metadata: Metadata = {
  title: "Storm start dates · Simon Isaiah Rachelson",
  description:
    "The day each named storm formed since 1979, by name or by season.",
};

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-20">
      <Link href="/" className="text-sm text-zinc-600 hover:underline">
        ← Storm name by date
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Storm start dates
      </h1>
      <p className="mt-2 mb-8 text-zinc-600">
        Pick a name to see the day it reached tropical-storm strength each
        season it was on the list, or pick a year to see the day each of its
        letters did, from 1979 on.
      </p>
      <Providers>
        <StartHistory />
      </Providers>
    </main>
  );
}
