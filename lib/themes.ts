export const backgroundOptions = [
  "dark-gradient",
  "purple-glow",
  "light-clean",
  "sunset",
] as const;

export const backgroundPresets = {
  "dark-gradient":
    "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white",
  "purple-glow":
    "bg-gradient-to-br from-[#3b1d60] via-[#2b103f] to-[#0f0c29] text-white",
  "light-clean": "bg-gradient-to-br from-slate-50 to-white text-slate-900",
  sunset: "bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-700 text-white",
};

export type BackgroundKey = (typeof backgroundOptions)[number];

