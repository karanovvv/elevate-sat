import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Question } from "@/lib/queries";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface AiHelperSheetProps {
  question?: Question | null;
  topicName?: string;
  floating?: boolean;
}

export function AiHelperSheet({ question, topicName, floating = true }: AiHelperSheetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: question
        ? "Привет! Я твой ИИ-репетитор от MK Education. Я помогу тебе разобраться с этой задачей. С чего начнем? Нужна подсказка по правилу или формуле?"
        : "Привет! Я ИИ-консультант MK Education. Я отвечу на любые вопросы по подготовке к Digital SAT, формату теста, математике или грамматике. Чем могу помочь?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  // Reset chat when question changes
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: question
          ? "Привет! Я твой ИИ-репетитор от MK Education. Я помогу тебе разобраться с этой задачей. С чего начнем? Нужна подсказка по правилу или формуле?"
          : "Привет! Я ИИ-консультант MK Education. Я отвечу на любые вопросы по подготовке к Digital SAT, формату теста, математике или грамматике. Чем могу помочь?",
      },
    ]);
    setInput("");
  }, [question]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiKey =
        import.meta.env["VITE_GROQ_API_KEY"] ||
        (typeof window !== "undefined"
          ? atob("Z3NrX1pRTTNQYVdoVjByZVA4Y2VkZHYyV0dkeTdyUVk5Q0NOaHM4VGxBWEhXRWdQTEFROElraUY=")
          : "");

      const systemPrompt = question
        ? `You are a friendly, expert Digital SAT Tutor from "MK Education". 
Your goal is to help the student understand and solve the current SAT question. 
CRITICAL RULE: Do NOT give the direct answer (e.g. "The correct answer is B") immediately. Instead, guide the student step-by-step, explain the concepts, point out clues, and ask helpful guiding questions to let them arrive at the answer themselves. Only reveal the full answer and explanation if the student explicitly asks for it or is completely stuck after several attempts.
Always write your responses in Russian, keeping a positive, supportive, and educational tone. Use LaTeX format for math formulas if needed (e.g. \\(y = mx + b\\)).

Current question details:
- Topic: ${topicName || "General"}
- Difficulty: ${question.difficulty}
- Passage: ${question.passage ?? "None"}
- Question Prompt: ${question.prompt}
- Choices:
  A) ${question.choices[0] || "N/A"}
  B) ${question.choices[1] || "N/A"}
  C) ${question.choices[2] || "N/A"}
  D) ${question.choices[3] || "N/A"}
- Correct Choice Index: ${question.correct_index} (Answer is: ${String.fromCharCode(65 + question.correct_index)})
- Explanation: ${question.explanation}`
        : `You are a friendly, expert Digital SAT AI Advisor from "MK Education".
Your goal is to help students with any questions regarding Digital SAT preparation, test rules, scoring, study schedules, math formulas, reading techniques, or MK Education services.
Always write your responses in Russian, keeping an encouraging, clear, and highly helpful tone. Use markdown formatting and lists where appropriate.`;

      const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
      let assistantMessage = "";
      let lastError = "";

      for (const model of models) {
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey.trim()}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                ...newMessages.map((m) => ({ role: m.role, content: m.content })),
              ],
              temperature: 0.7,
              max_tokens: 1024,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            assistantMessage = data.choices?.[0]?.message?.content || "";
            if (assistantMessage) break;
          } else {
            const errJson = await response.json().catch(() => ({}));
            lastError = errJson.error?.message || `HTTP ${response.status}`;
          }
        } catch (e) {
          lastError = e instanceof Error ? e.message : "Network error";
        }
      }

      if (!assistantMessage) {
        assistantMessage =
          "Извини, произошла небольшая задержка соединения с сервером ИИ. Попробуй задать вопрос ещё раз!";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Извини, сейчас связь с ИИ-помощником временно недоступна. Напиши свой вопрос ещё раз через пару секунд!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {floating ? (
          <Button
            size="lg"
            className="fixed bottom-20 md:bottom-6 right-6 z-50 shadow-2xl rounded-full px-5 py-6 bg-primary text-primary-foreground hover:scale-105 transition-all flex items-center gap-2.5 border-2 border-white/20"
          >
            <Sparkles className="size-5 text-yellow-300 animate-pulse" />
            <span className="font-semibold text-sm">ИИ Помощник</span>
          </Button>
        ) : (
          <Button variant="outline" className="gap-2 border-primary/30 hover:border-primary">
            <Sparkles className="size-4 text-primary animate-pulse" />
            <span>ИИ Помощник</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg flex flex-col h-full bg-card border-l border-border p-0 z-[100]">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <Bot className="size-6 text-primary" />
            <span>ИИ Помощник MK Education</span>
          </SheetTitle>
          <SheetDescription>
            {question
              ? "Ваш персональный репетитор по текущему вопросу."
              : "Ваш консультант по подготовке к Digital SAT."}
          </SheetDescription>
        </SheetHeader>

        {/* Messages Scroll Area */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "assistant"
                    ? "bg-secondary text-foreground self-start rounded-tl-none shadow-sm"
                    : "bg-primary text-primary-foreground self-end rounded-tr-none ml-auto"
                }`}
              >
                <span className="text-[10px] opacity-60 font-semibold mb-1">
                  {m.role === "assistant" ? "ИИ Репетитор" : "Вы"}
                </span>
                <div className="whitespace-pre-line">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>ИИ отвечает...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Bar */}
        <div className="p-4 border-t border-border bg-card flex gap-2 items-center">
          <input
            type="text"
            placeholder="Спросить про формулу, правила, форматы..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={loading}
            className="flex-1 bg-secondary hover:bg-secondary/80 focus:bg-background border border-border/80 focus:border-primary rounded-xl px-4 py-3 text-sm transition-all outline-none"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-xl size-10 shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
