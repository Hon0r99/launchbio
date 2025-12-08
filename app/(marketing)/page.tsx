import Link from "next/link";
import { ArrowRight, Check, Clock3, Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  { title: "Set your date", icon: Clock3, desc: "Pick the exact launch time." },
  { title: "Add your links", icon: Link2, desc: "Buttons to product, socials, chat." },
  { title: "One link in bio", icon: Sparkles, desc: "Copy the public URL." },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-10">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              <Sparkles className="h-4 w-4 text-amber-300" /> One launch link, done
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Your launch. One link. One countdown.
            </h1>
            <p className="text-lg text-white/70">
              Build a launch link with a huge countdown in 5 minutes. Perfect for
              Instagram, TikTok, and X bios.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/create">
                  Create your page
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="#pricing">View pricing</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_-45px_rgba(59,130,246,0.8)]">
            <div className="text-sm text-white/60 mb-2">Preview</div>
            <div className="rounded-xl bg-gradient-to-br from-indigo-700 via-slate-900 to-black p-6 text-center shadow-inner shadow-black/40">
              <p className="text-sm text-white/70">Dream Product launch</p>
              <p className="text-3xl font-semibold text-white mt-2">12 days 04:22:10</p>
              <div className="mt-4 flex justify-center gap-3">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="outline">
                  Secondary
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="rounded-full bg-white/10 p-2">
                  <step.icon className="h-5 w-5 text-sky-300" />
                </div>
                <div>
                  <CardTitle className="text-white">{step.title}</CardTitle>
                  <CardDescription className="text-white/70">
                    {step.desc}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section id="pricing" className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Free</CardTitle>
              <CardDescription className="text-white/70">
                For quick launches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-white/80">
              <p>1 page</p>
              <p>LaunchBio subdomain</p>
              <p>Made with LaunchBio branding</p>
              <p>View counter</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-700 to-sky-600 border-transparent shadow-2xl shadow-indigo-700/30">
            <CardHeader>
              <CardTitle className="text-white">Launch Pack — $9</CardTitle>
              <CardDescription className="text-white/90">
                One-time, no subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-white/90">
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Remove branding
              </p>
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Extra themes
              </p>
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4" /> After-launch text
              </p>
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4" /> GA/Plausible field
              </p>
              <Button asChild className="mt-4">
                <Link href="/create">Start and upgrade inside the editor</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

