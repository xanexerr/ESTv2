import React from "react";
import { Github, Facebook, Code2 } from "lucide-react";

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
    <div className="py-6">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-ssp-light text-ssp-primary mb-2.5">
          <Code2 className="w-3.5 h-3.5" /> Development Team
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          ทีมผู้พัฒนาและติดต่อแอดมิน
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          คณะผู้จัดทำโครงการระบบรวบรวมสถานประกอบการ แผนกเทคโนโลยีสารสนเทศ วิทยาลัยเทคนิคหาดใหญ่
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {developers.map((dev) => (
          <div
            key={dev.name}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition text-center flex flex-col"
          >
            <img
              src={dev.img}
              alt={dev.name}
              className="w-full aspect-[3.6/4] object-cover"
            />
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{dev.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5 mb-4">{dev.role}</p>
              </div>

              <div className="flex justify-center gap-2.5">
                {dev.github && (
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-800 hover:text-white text-xs font-semibold transition"
                  >
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {dev.facebook && (
                  <a
                    href={dev.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition"
                  >
                    <Facebook className="w-3.5 h-3.5" /> Facebook
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
