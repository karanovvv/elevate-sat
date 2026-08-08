import { Building2, GraduationCap, Instagram, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0b0e17]/80 backdrop-blur-2xl text-[#e0e2ef] py-12 px-4 sm:px-8 mt-auto">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 text-sm">
          {/* Left Block: Logo & Company Name */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#8083ff] to-[#6001d1] text-white shadow-[0_0_20px_rgba(128,131,255,0.3)] font-bold">
                <GraduationCap className="size-6" />
              </span>
              <div>
                <span className="text-xl font-headline font-extrabold tracking-tight text-white block">
                  MK Education
                </span>
                <span className="text-xs text-[#8083ff] font-semibold">Elevate-SAT AI Platform</span>
              </div>
            </div>

            <div className="text-xs text-[#c7c4d7]/70 space-y-0.5">
              <p className="text-[#908fa0]">Исполнитель</p>
              <p className="font-medium text-[#e0e2ef]">ИП "MK Education"</p>
            </div>
          </div>

          {/* Right Block: Phone, Instagram, Requisites */}
          <div className="flex flex-col md:items-end text-left md:text-right space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white md:justify-end">
              <Phone className="size-4 text-[#c0c1ff]" />
              <a href="tel:+77059114954" className="hover:text-[#c0c1ff] transition-colors">
                +7 705 911 49 54
              </a>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#c7c4d7] md:justify-end">
              <Instagram className="size-4 text-pink-400" />
              <a
                href="https://instagram.com/mk.education"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                @mk.education
              </a>
            </div>

            <div className="text-xs text-[#c7c4d7]/80 space-y-1 pt-2 border-t border-white/5 md:border-t-0 md:pt-0">
              <p className="flex items-center gap-1.5 md:justify-end text-[#c7c4d7]">
                <Building2 className="size-3.5 text-[#908fa0]" />
                <span className="font-semibold text-white">Банковские реквизиты:</span> Банк AO "Kaspi Bank"
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#908fa0] gap-4">
          <p>© {new Date().getFullYear()} MK Education. Все права защищены.</p>
          <p className="flex items-center gap-2">
            <span>Aligned with College Board Digital SAT</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
