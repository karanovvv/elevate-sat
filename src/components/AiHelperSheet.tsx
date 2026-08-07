import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
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
  question: Question;
  topicName: string;
}

export function AiHelperSheet({ question, topicName }: AiHelperSheetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Привет! Я твой ИИ-репетитор от MK Education. Я помогу тебе разобраться с этой задачей. Давай разберем её вместе — с чего бы ты хотел начать? Нужна подсказка по правилу или формуле?",
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
        content:
          "Привет! Я твой ИИ-репетитор от MK Education. Я помогу тебе разобраться с этой задачей. Давай разберем её вместе — с чего бы ты хотел начать? Нужна подсказка по правилу или формуле?",
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
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("API ключ Groq не настроен в файле .env");
      }

      const systemPrompt = `You are a friendly, expert Digital SAT Tutor from "MK Education". 
Your goal is to help the student understand and solve the current SAT question. 
CRITICAL RULE: Do NOT give the direct answer (e.g. "The correct answer is B") immediately. Instead, guide the student step-by-step, explain the concepts, point out clues, and ask helpful guiding questions to let them arrive at the answer themselves. Only reveal the full answer and explanation if the student explicitly asks for it or is completely stuck after several attempts.
Always write your responses in Russian, keeping a positive, supportive, and educational tone. Use LaTeX format for math formulas if needed (e.g. \\(y = mx + b\\) or display equations).

Here is the current question details for your context:
- Topic: ${topicName}
- Difficulty: ${question.difficulty}
- Passage: ${question.passage ?? "None"}
- Question Prompt: ${question.prompt}
- Choices:
  A) ${question.choices[0] || "N/A"}
  B) ${question.choices[1] || "N/A"}
  C) ${question.choices[2] || "N/A"}
  D) ${question.choices[3] || "N/A"}
- Correct Choice Index: ${question.correct_index} (Answer is: ${String.fromCharCode(65 + question.correct_index)})
- Explanation: ${question.explanation}
`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage =
        data.choices?.[0]?.message?.content || "Извини, не удалось сгенерировать ответ.";

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Ошибка: ${err instanceof Error ? err.message : "Не удалось подключиться к ИИ-помощнику. Пожалуйста, проверьте настройки API ключа."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:border-primary">
          <Sparkles className="size-4 text-primary animate-pulse" />
          <span>ИИ Помощник</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg flex flex-col h-full bg-card border-l border-border p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="size-5 text-primary" />
            <span>ИИ Помощник MK Education</span>
          </SheetTitle>
          <SheetDescription>
            Ваш персональный репетитор по Digital SAT. Задавайте вопросы по текущему заданию.
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
                    ? "bg-secondary text-foreground self-start rounded-tl-none"
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
                <span>ИИ думает...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Bar */}
        <div className="p-4 border-t border-border bg-card flex gap-2 items-center">
          <input
            type="text"
            placeholder="Спросить про формулу, намекнуть на ответ..."
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
