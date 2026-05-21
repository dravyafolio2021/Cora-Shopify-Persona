const fs = require('fs');

let content = fs.readFileSync('src/app/customer-profile/page.tsx', 'utf8');

// 1. Add Playfair_Display import
content = content.replace(
  "import { useSearchParams, useRouter } from 'next/navigation';",
  "import { useSearchParams, useRouter } from 'next/navigation';\nimport { Playfair_Display } from 'next/font/google';\nconst playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700', '900'] });"
);

// 2. Remove duplicated checkin modal (lines 397 to 421)
const modalString = "      {/* CHECK-IN MODAL */}\n      {showCheckinModal && (";
const firstIndex = content.indexOf(modalString);
const secondIndex = content.indexOf(modalString, firstIndex + 1);
if (secondIndex !== -1) {
  const endOfSecondModal = content.indexOf("      {/* Outer Branding Container", secondIndex);
  content = content.slice(0, secondIndex) + content.slice(endOfSecondModal);
}

// 3. Remove "Routine Check-In History" entirely to prevent duplicate checkin lists
const routineHistoryStart = content.indexOf("          {/* Routine Check-In History */}");
if (routineHistoryStart !== -1) {
  const endOfRoutineHistory = content.indexOf("          <div className=\"bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] mt-6\">\n            <h3 className=\"text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-1.5\"><Calendar className=\"w-3 h-3 text-slate-400\" /> Skincare Habit Log</h3>", routineHistoryStart);
  if (endOfRoutineHistory !== -1) {
    content = content.slice(0, routineHistoryStart) + content.slice(endOfRoutineHistory);
  }
}

// 4. Remove duplicate Habit Log sections at the bottom
const habitLog1Str = "          <div className=\"bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] mt-6\">\n            <h3 className=\"text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-1.5\"><Calendar className=\"w-3 h-3 text-slate-400\" /> Skincare Habit Log</h3>";
const hlFirst = content.indexOf(habitLog1Str);
const hlSecond = content.indexOf(habitLog1Str, hlFirst + 1);
if (hlSecond !== -1) {
    const mainEnd = content.indexOf("        </div>\n\n      </main>");
    content = content.slice(0, hlSecond) + "\n" + content.slice(mainEnd);
}

const hlDupeStr = "          {/* Habit Log / Check-in History */}";
const hlDupeIdx = content.indexOf(hlDupeStr);
if (hlDupeIdx !== -1) {
    const mainEnd = content.indexOf("        </div>\n\n      </main>", hlDupeIdx);
    content = content.slice(0, hlDupeIdx) + "\n" + content.slice(mainEnd);
}

// 5. Update Colors globally to match brand moodboard
content = content.replace(/emerald-500/g, '[#b89768]');
content = content.replace(/emerald-600/g, '[#a3855a]');
content = content.replace(/emerald-50/g, '[#fdfaf6]');
content = content.replace(/emerald-100/g, '[#f3e8d6]');
content = content.replace(/emerald-700/g, '[#8a6e45]');

content = content.replace(/orange-600/g, '[#b89768]');
content = content.replace(/orange-50/g, '[#fdfaf6]');
content = content.replace(/orange-100/g, '[#f3e8d6]');

content = content.replace(/bg-slate-50/g, 'bg-[#faf9f6]');

// 6. Font injection explicitly on major headings:
// Customer Name
content = content.replace(
  '<h2 className="text-sm font-extrabold text-slate-900">',
  '<h2 className={`text-xl font-extrabold text-slate-900 ${playfair.className}`}>'
);
// Streak Header
content = content.replace(
  '<h4 className="text-xl font-black text-slate-900 leading-none">',
  '<h4 className={`text-2xl font-black text-slate-900 leading-none ${playfair.className}`}>'
);
// Modal Header
content = content.replace(
  '<h3 className="text-xl font-bold text-white mb-1">Skincare Check-In</h3>',
  '<h3 className={`text-2xl font-bold text-white mb-1 ${playfair.className}`}>Skincare Check-In</h3>'
);

// Recommendation Step Product Title
content = content.replace(
  /<h5 className="text-sm font-extrabold text-slate-900">\{rec\.title\}<\/h5>/g,
  '<h5 className={`text-base font-extrabold text-slate-900 ${playfair.className}`}>{rec.title}</h5>'
);

fs.writeFileSync('src/app/customer-profile/page.tsx', content);
