import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  RotateCcw,
  ArrowRight,
  Bot,
  User,
  BookOpen,
  ShieldCheck,
  Copy,
  Check,
  Send,
  Cpu,
  GraduationCap,
  Briefcase,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Sahayak AI Scheme Assistant — NAGSI" },
      {
        name: "description",
        content:
          "Ask questions about Indian AI government schemes, compute access under IndiaAI, and governance frameworks.",
      },
      { property: "og:title", content: "Sahayak AI Scheme Assistant — NAGSI" },
      {
        property: "og:description",
        content:
          "Intelligent conversational assistant powered by Qwen 3.8 Max and grounded in live Supabase data.",
      },
    ],
  }),
  component: Assistant,
});

const SUGGESTIONS = [
  {
    icon: Cpu,
    category: "Startups & Compute",
    label: "GPU Compute Subsidies",
    text: "Are there AI schemes for startups needing GPU compute under the IndiaAI Mission?",
  },
  {
    icon: GraduationCap,
    category: "Students & Academia",
    label: "Student AI Fellowships",
    text: "I'm a student interested in AI research — what fellowships, grants, or dataset platforms can I apply for?",
  },
  {
    icon: Briefcase,
    category: "MSME & Industry",
    label: "MSME AI Adoption Grants",
    text: "Show schemes for MSMEs looking to adopt AI in manufacturing, quality inspection, or business.",
  },
  {
    icon: ShieldCheck,
    category: "Policy & Standards",
    label: "DPDP & AI Governance",
    text: "Explain how the DPDP Act 2023 and India AI Governance Guidelines (2025) apply to AI systems.",
  },
  {
    icon: HelpCircle,
    category: "Decision Support",
    label: "How Risk Triage Works",
    text: "Explain NAGSI's 8-dimension AI risk triage scoring formula, weights, and risk tiers.",
  },
];

function Assistant() {
  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    ta.current?.focus();
  }, [status]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput("");
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
    toast.info("Conversation reset");
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-5xl flex-col px-4 py-4 sm:px-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-saffron to-amber-600 font-display text-xl font-bold text-white shadow-sm">
            स
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Sahayak AI Scheme Assistant
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Qwen 3.8 Max Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              42 Central & State Schemes · IndiaAI Mission · DPDP Act 2023 · Explainable Triage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearChat}
              className="h-8 gap-1.5 text-xs rounded-lg"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset chat
            </Button>
          )}
          <Button size="sm" variant="ghost" asChild className="hidden text-xs sm:inline-flex h-8">
            <Link to="/schemes">
              Browse 42 schemes <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="my-auto space-y-6 py-6">
            {/* Welcome banner */}
            <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-muted/20 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="h-4 w-4 text-saffron" />
                Namaste! Welcome to Sahayak
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I am your intelligent assistant grounded in India's <strong>National AI Governance & Schemes Intelligence (NAGSI)</strong> directory.
                I can help you navigate subsidized GPU compute under the IndiaAI Mission, identify research fellowships, explore MSME technology grants, and explain compliance under the DPDP Act 2023 and India AI Governance Guidelines (2025).
              </p>

              <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                <Link
                  to="/eligibility"
                  className="flex items-center gap-2.5 rounded-xl border bg-background/80 p-3 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
                >
                  <BookOpen className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold">Interactive Eligibility Finder</p>
                    <p className="text-[10px] text-muted-foreground font-normal">Filter by age, income, category & occupation</p>
                  </div>
                </Link>

                <Link
                  to="/frameworks"
                  className="flex items-center gap-2.5 rounded-xl border bg-background/80 p-3 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold">6 Governance Frameworks</p>
                    <p className="text-[10px] text-muted-foreground font-normal">Explore India AI Guidelines, DPDP Act & NIST RMF</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Suggested Prompts Cards */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Suggested Questions To Get Started
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {SUGGESTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.label}
                      onClick={() => send(s.text)}
                      className="group flex flex-col items-start rounded-xl border bg-card p-3.5 text-left transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        <Icon className="h-3 w-3 text-saffron" />
                        <span>{s.category}</span>
                      </div>
                      <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        {s.label}
                      </span>
                      <span className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {s.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === "user";
          const fullMessageText = m.parts
            .filter((p) => p.type === "text")
            .map((p) => (p as { text: string }).text)
            .join("\n");

          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-br from-saffron to-amber-600 text-xs font-bold text-white shadow-2xs mt-0.5">
                  स
                </div>
              )}

              <div
                className={`relative group rounded-2xl px-4 py-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "max-w-[85%] bg-primary text-primary-foreground shadow-sm"
                    : "max-w-[92%] border bg-card text-foreground shadow-sm prose prose-sm max-w-none [&_a]:text-accent [&_a]:font-semibold [&_a]:underline [&_table]:w-full [&_table]:border [&_th]:border [&_th]:bg-muted/50 [&_th]:p-2 [&_td]:border [&_td]:p-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_ul]:my-2 [&_li]:my-0.5"
                }`}
              >
                {m.parts.map((p, i) =>
                  p.type === "text" ? (
                    isUser ? (
                      <p key={i} className="whitespace-pre-wrap">{p.text}</p>
                    ) : (
                      <ReactMarkdown key={i}>{p.text}</ReactMarkdown>
                    )
                  ) : null
                )}

                {/* Copy Button for Assistant */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      Grounded in verified government records
                    </span>
                    <button
                      onClick={() => copyMessage(m.id, fullMessageText)}
                      className="inline-flex items-center gap-1 hover:text-foreground p-1 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-primary/10 text-xs text-primary mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-saffron to-amber-600 text-xs font-bold text-white shadow-2xs">
              स
            </div>
            <div className="rounded-2xl border bg-card px-4 py-3 text-xs text-muted-foreground shadow-sm">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-saffron" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-saffron [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-saffron [animation-delay:0.4s]" />
                Sahayak is reasoning with Qwen 3.8 Max & Supabase…
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center justify-between">
            <span>Something went wrong: {error.message}</span>
            <Button size="sm" variant="outline" onClick={clearChat} className="text-xs h-7">
              Try again
            </Button>
          </div>
        )}

        <div ref={end} />
      </div>

      {/* Input Form */}
      <form
        className="mt-3 flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/30"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <Textarea
          ref={ta}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask Sahayak about schemes, eligibility, GPU compute access, or DPDP Act compliance…"
          className="min-h-[44px] max-h-32 resize-none border-0 shadow-none focus-visible:ring-0 text-xs sm:text-sm"
          rows={1}
        />
        {busy ? (
          <Button type="button" size="sm" variant="outline" onClick={stop} className="h-9 rounded-xl">
            Stop
          </Button>
        ) : (
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim()}
            className="h-9 px-3.5 rounded-xl bg-saffron text-saffron-foreground hover:bg-saffron/90 font-semibold gap-1.5 shadow-2xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </Button>
        )}
      </form>
    </div>
  );
}
