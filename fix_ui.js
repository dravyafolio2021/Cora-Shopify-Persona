const fs = require('fs');

let content = fs.readFileSync('src/app/customer-profile/page.tsx', 'utf8');

// 1. Add Playfair_Display import
content = content.replace(
  "import { useSearchParams } from 'next/navigation';",
  "import { useSearchParams } from 'next/navigation';\nimport { Playfair_Display } from 'next/font/google';\nconst playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700', '900'] });"
);

// 2. Remove duplicated checkin modal (lines 397 to 421)
// Looking for the second occurrence of "      {/* CHECK-IN MODAL */}"
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
  const endOfRoutineHistory = content.indexOf("          <div className=\"bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] mt-6\">", routineHistoryStart);
  if (endOfRoutineHistory !== -1) {
    content = content.slice(0, routineHistoryStart) + content.slice(endOfRoutineHistory);
  }
}

// 4. Remove duplicate Habit Log sections at the bottom
// They appear after {/* Purchased Products */}
const habitLog1Str = "          <div className=\"bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] mt-6\">\n            <h3 className=\"text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-1.5\"><Calendar className=\"w-3 h-3 text-slate-400\" /> Skincare Habit Log</h3>";
const hlFirst = content.indexOf(habitLog1Str);
const hlSecond = content.indexOf(habitLog1Str, hlFirst + 1);
if (hlSecond !== -1) {
    // just cut from the second occurrence to the end of main
    const mainEnd = content.indexOf("        </div>\n\n      </main>");
    content = content.slice(0, hlSecond) + "\n" + content.slice(mainEnd);
}

// remove another duplicate that might have a different comment
const hlDupeStr = "          {/* Habit Log / Check-in History */}";
const hlDupeIdx = content.indexOf(hlDupeStr);
if (hlDupeIdx !== -1) {
    const mainEnd = content.indexOf("        </div>\n\n      </main>", hlDupeIdx);
    content = content.slice(0, hlDupeIdx) + "\n" + content.slice(mainEnd);
}

// 5. Update Fonts on all headings
// Regex to add playfair.className to h1, h2, h3, h4, h5 classes
content = content.replace(/<(h[1-6]) className="([^"]+)"/g, (match, tag, classes) => {
  return `<${tag} className={\`${classes} \${playfair.className}\`}`;
});

// 6. Update Colors globally to match brand moodboard
// Emerald to Gold/Bronze
content = content.replace(/emerald-500/g, '[#b89768]');
content = content.replace(/emerald-600/g, '[#a3855a]');
content = content.replace(/emerald-50/g, '[#fdfaf6]');
content = content.replace(/emerald-100/g, '[#f3e8d6]');
content = content.replace(/emerald-700/g, '[#8a6e45]');

// Orange to Gold/Bronze (for streak card and badges)
content = content.replace(/orange-600/g, '[#b89768]');
content = content.replace(/orange-50/g, '[#fdfaf6]');
content = content.replace(/orange-100/g, '[#f3e8d6]');

// Slate backgrounds to soft warm off-white (for a luxury feel)
content = content.replace(/bg-slate-50/g, 'bg-[#faf9f6]');

// 7. Update any remaining max-h overflow
content = content.replace(/max-h-\[260px\] overflow-y-auto/g, '');

fs.writeFileSync('src/app/customer-profile/page.tsx', content);
