export const freeBackgroundOptions = [
  "dark-gradient",
  "purple-glow",
  "light-clean",
  "sunset",
] as const;

export const proBackgroundOptions = [
  "ocean-blue",
  "forest-green",
  "neon-pink",
  "golden-hour",
  "midnight-purple",
  "cyberpunk",
] as const;

export const backgroundOptions = [
  ...freeBackgroundOptions,
  ...proBackgroundOptions,
] as const;

export const backgroundPresets = {
  "dark-gradient":
    "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white",
  "purple-glow":
    "bg-gradient-to-br from-[#3b1d60] via-[#2b103f] to-[#0f0c29] text-white",
  "light-clean": "bg-gradient-to-br from-slate-50 to-white text-slate-900",
  sunset: "bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-700 text-white",
  "ocean-blue": "bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 text-white",
  "forest-green": "bg-gradient-to-br from-green-800 via-emerald-600 to-lime-500 text-white",
  "neon-pink": "bg-gradient-to-br from-pink-600 via-fuchsia-500 to-purple-600 text-white",
  "golden-hour": "bg-gradient-to-br from-orange-400 via-yellow-500 to-amber-600 text-white",
  "midnight-purple": "bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 text-white",
  cyberpunk: "bg-gradient-to-br from-violet-600 via-pink-500 to-cyan-400 text-white",
};

export type BackgroundKey = (typeof backgroundOptions)[number];
export type FreeBackgroundKey = (typeof freeBackgroundOptions)[number];
export type ProBackgroundKey = (typeof proBackgroundOptions)[number];

export function getButtonStyles(bgType: BackgroundKey) {
  const styles: Record<
    BackgroundKey,
    { primary: string; secondary: string }
  > = {
    "dark-gradient": {
      primary: "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:from-sky-500/90 hover:to-indigo-600/90",
      secondary: "border border-white/20 bg-white/10 text-white hover:bg-white/20",
    },
    "purple-glow": {
      primary: "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:from-purple-500/90 hover:to-pink-600/90",
      secondary: "border border-purple-300/30 bg-purple-500/20 text-white hover:bg-purple-500/30",
    },
    "light-clean": {
      primary: "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg hover:from-slate-800 hover:to-slate-600",
      secondary: "border border-slate-300 bg-white/80 text-slate-900 hover:bg-white",
    },
    sunset: {
      primary: "bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/30 hover:from-orange-500/90 hover:to-rose-600/90",
      secondary: "border border-orange-300/40 bg-orange-500/20 text-white hover:bg-orange-500/30",
    },
    "ocean-blue": {
      primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-500/90 hover:to-blue-600/90",
      secondary: "border border-cyan-300/40 bg-cyan-500/20 text-white hover:bg-cyan-500/30",
    },
    "forest-green": {
      primary: "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-500/90 hover:to-green-600/90",
      secondary: "border border-emerald-300/40 bg-emerald-500/20 text-white hover:bg-emerald-500/30",
    },
    "neon-pink": {
      primary: "bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/30 hover:from-pink-500/90 hover:to-fuchsia-600/90",
      secondary: "border border-pink-300/40 bg-pink-500/20 text-white hover:bg-pink-500/30",
    },
    "golden-hour": {
      primary: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:from-amber-500/90 hover:to-orange-600/90",
      secondary: "border border-amber-300/40 bg-amber-500/20 text-white hover:bg-amber-500/30",
    },
    "midnight-purple": {
      primary: "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-500/90 hover:to-purple-600/90",
      secondary: "border border-violet-300/30 bg-violet-500/20 text-white hover:bg-violet-500/30",
    },
    cyberpunk: {
      primary: "bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 text-white shadow-lg shadow-violet-500/30 hover:from-violet-500/90 hover:to-cyan-500/90",
      secondary: "border border-cyan-300/40 bg-cyan-500/20 text-white hover:bg-cyan-500/30",
    },
  };

  return styles[bgType];
}

