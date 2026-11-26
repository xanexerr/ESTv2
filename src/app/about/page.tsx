import React from "react";
import { Github, Facebook } from "lucide-react";

const developers = [
  {
    name: "นายณัฐภูมินทร์ กล่ำมาตย์",
    role: "ผู้พัฒนาระบบ / ผู้ดูแลระบบ",
    img: "/img/xan.jpg",
    github: "https://github.com/xanexerr",
    facebook: "https://www.facebook.com/natthapumin.klammat/",
  },
  {
    name: "นายธีรภัทร แซ่ตั้ง",
    role: "ผู้ร่วมพัฒนาระบบ",
    img: "/img/handsome.jpg",
    facebook: "https://www.facebook.com/profile.php?id=100005825707675",
  },
  {
    name: "นายธนชาต นามเจริญ",
    role: "ผู้ร่วมพัฒนาระบบ",
    img: "/img/bast.jpg",
    facebook: "https://www.facebook.com/thanachart.namcharoen",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">
          ผู้พัฒนาและติดต่อผู้ดูแลระบบ EST
        </h1>
        <p className="text-xs text-ink-secondary mt-0.5">
          ช่องทางติดต่อสำหรับแจ้งปัญหาการใช้งานหรือสอบถามการอนุมัติบัญชี
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
        {developers.map((dev) => (
          <div
            key={dev.name}
            className="bg-paper-surface rounded-xl border border-line overflow-hidden flex flex-col"
          >
            <img
              src={dev.img}
              alt={dev.name}
              className="w-full aspect-square object-cover border-b border-line"
            />
            <div className="p-4 flex-grow flex flex-col justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink-primary">
                  {dev.name}
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">{dev.role}</p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-line">
                {dev.github && (
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line-strong text-ink-secondary hover:text-ink-primary text-xs font-medium transition-colors"
                  >
                    <Github strokeWidth={1.5} className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {dev.facebook && (
                  <a
                    href={dev.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line-strong text-ink-secondary hover:text-brand text-xs font-medium transition-colors"
                  >
                    <Facebook strokeWidth={1.5} className="w-3.5 h-3.5" /> Facebook
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
