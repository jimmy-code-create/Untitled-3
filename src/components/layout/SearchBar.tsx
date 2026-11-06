"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCamera, IconMic, IconSearch } from "@/components/icons/JmdIcons";
import { waLink } from "@/lib/utils";

const PLACEHOLDERS = ["Search for gold necklace", "Search for silver payal", "Search for ruby ring"];

export function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (focused || query) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % PLACEHOLDERS.length), 3000);
    return () => window.clearInterval(timer);
  }, [focused, query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/collections/all?q=${encodeURIComponent(q)}` : "/collections/all");
  };

  const startVoice = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      inputRef.current?.focus();
      return;
    }
    try {
      const recognition = new Recognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onresult = (event: any) => {
        const text = event.results?.[0]?.[0]?.transcript ?? "";
        setQuery(text);
        if (text) router.push(`/collections/all?q=${encodeURIComponent(text)}`);
      };
      recognition.start();
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="container-x pb-2.5 pt-1">
      <form
        onSubmit={submit}
        role="search"
        className="flex h-12 w-full items-center gap-1 rounded-control border border-burgundy/20 bg-white pl-4 pr-1 shadow-[0_2px_10px_-8px_rgba(46,6,9,0.25)] focus-within:border-burgundy/45"
      >
        <IconSearch className="h-[18px] w-[18px] shrink-0 text-burgundy/70" size={18} />
        <label htmlFor="jmd-search" className="sr-only">
          Search jewellery
        </label>
        <input
          id="jmd-search"
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused || query ? "Search for a piece" : PLACEHOLDERS[index]}
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-[13px] text-ink placeholder:text-bodygrey/70 focus:outline-none"
          autoComplete="off"
        />
        <a
          href={waLink("Namaste JMD Gems & Jewellery. I would like to send a photo of a piece I am looking for.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Send a photo on WhatsApp"
          className="grid h-11 w-11 shrink-0 place-items-center text-burgundy/75 transition-colors hover:text-burgundy"
        >
          <IconCamera size={19} />
        </a>
        <button
          type="button"
          onClick={startVoice}
          aria-label={listening ? "Listening" : "Search by voice"}
          className={`grid h-11 w-11 shrink-0 place-items-center transition-colors ${listening ? "text-burgundy" : "text-burgundy/75 hover:text-burgundy"}`}
        >
          <IconMic size={19} />
        </button>
      </form>
    </div>
  );
}
