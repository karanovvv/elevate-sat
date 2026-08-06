import { Building2, GraduationCap, Instagram, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-zinc-950 text-zinc-200 py-10 px-4 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-px w-full bg-border/40 mb-8" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 text-sm">
          {/* Left Block: Logo & Company Name */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
                <GraduationCap className="size-6" />
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                MK Education
              </span>
            </div>

            <div className="text-xs text-zinc-400 space-y-1">
              <p className="text-zinc-500">Исполнитель</p>
              <p className="font-medium text-zinc-300">ИП "MK Education"</p>
            </div>
          </div>

          {/* Right Block: Phone, Instagram, Requisites */}
          <div className="flex flex-col md:items-end text-left md:text-right space-y-3">
            <div className="flex items-center gap-2 text-xl font-extrabold text-white md:justify-end">
              <Phone className="size-5 text-primary" />
              <a href="tel:+77059114954" className="hover:underline">
                +7 705 911 49 54
              </a>
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-300 md:justify-end">
              <Instagram className="size-4 text-pink-500" />
              <a
                href="https://instagram.com/mk.education"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                @mk.education
              </a>
            </div>

            <div className="text-xs text-zinc-400 space-y-1 pt-2 border-t border-zinc-800/60 md:border-t-0 md:pt-0">
              <p className="flex items-center gap-1.5 md:justify-end text-zinc-300">
                <Building2 className="size-3.5 text-zinc-400" />
                <span className="font-semibold">Банковские реквизиты:</span> Банк: AO "Kaspi Bank"
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800/40 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} MK Education. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
