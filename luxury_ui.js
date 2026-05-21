const fs = require('fs');
let content = fs.readFileSync('src/app/customer-profile/page.tsx', 'utf8');

// Replace the main page background with a very soft ivory
content = content.replace(/bg-\[#faf9f6\]/g, 'bg-[#fcfbf9]');

// Card 1: Brand/User Card - Soft Peach/Sun vibe
content = content.replace(
  '<div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] relative">',
  '<div className="bg-gradient-to-b from-[#fcebd4]/60 to-[#fdf7ee]/80 border border-[#fcebd4] rounded-3xl p-6 shadow-sm relative overflow-hidden">'
);

// Card 2: Daily Streak - Soft Lavender/Anti-Aging vibe
content = content.replace(
  '<div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">',
  '<div className="bg-gradient-to-br from-[#eadbef]/50 to-[#f9f5fa]/80 border border-[#eadbef] rounded-3xl p-6 shadow-sm">'
);

// Card 3: Device Push Service - Soft Green/Barrier Repair vibe
content = content.replace(
  '<div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">',
  '<div className="bg-gradient-to-br from-[#e5ead5]/60 to-[#f3f0e0]/80 border border-[#e5ead5] rounded-3xl p-6 shadow-sm">'
);

// Card 4: Routine Focus Areas - Soft Blue/Hydration vibe
content = content.replace(
  '<div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">',
  '<div className="bg-gradient-to-b from-[#c3e3f7]/40 to-[#eaf5fc]/70 border border-[#c3e3f7]/60 rounded-3xl p-7 shadow-sm">'
);

// Card 5: Active Skincare Routine - Elegant White with Bronze accents
content = content.replace(
  '<div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">',
  '<div className="bg-white border border-[#e5e1d8] rounded-3xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">'
);

// Card 6: Synced Product Purchases - Elegant White
content = content.replace(
  '<div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">',
  '<div className="bg-white border border-[#e5e1d8] rounded-3xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">'
);

// Card 7: Skincare Habit Log - Elegant White
content = content.replace(
  '<div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] mt-6">',
  '<div className="bg-white border border-[#e5e1d8] rounded-3xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mt-8">'
);

// General rounded corners boost
content = content.replace(/rounded-2xl/g, 'rounded-3xl');
content = content.replace(/rounded-xl/g, 'rounded-2xl');
content = content.replace(/rounded-lg/g, 'rounded-xl');

// Increase heading sizes for luxury feel
content = content.replace(/text-xs font-bold text-slate-500 uppercase tracking-widest/g, 'text-[10px] font-bold text-[#b89768] uppercase tracking-widest');

fs.writeFileSync('src/app/customer-profile/page.tsx', content);
