"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroupCard } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "./countdown";
import { createPageAction, updatePageAction } from "@/lib/actions";
import { backgroundPresets, type BackgroundKey } from "@/lib/themes";
import { cn } from "@/lib/utils";

type FormMode = "create" | "edit";

export type PageFormValues = {
  title: string;
  description?: string | null;
  eventDateTime: string;
  bgType: BackgroundKey;
  buttons: { label: string; url: string }[];
  ownerEmail?: string | null;
  afterLaunchText?: string | null;
  analyticsId?: string | null;
  showBranding?: boolean | null;
  isPro?: boolean;
  slug?: string;
  editToken?: string;
};

const defaultDate = () => {
  const dt = new Date();
  dt.setDate(dt.getDate() + 7);
  dt.setHours(12, 0, 0, 0);
  return dt;
};

const defaultValues: PageFormValues = {
  title: "New product launch",
  description: "We’ll share the demo and open early access.",
  eventDateTime: defaultDate().toISOString(),
  bgType: "dark-gradient",
  buttons: [
    { label: "Join waitlist", url: "https://t.me/" },
    { label: "Website", url: "https://example.com" },
  ],
  showBranding: true,
};

type State =
  | { status: "idle" }
  | { status: "created"; slug: string; editToken: string }
  | { status: "saved" };

export function PageForm({
  mode,
  initialValues,
  editToken,
}: {
  mode: FormMode;
  initialValues?: PageFormValues;
  editToken?: string;
}) {
  const values = initialValues ?? defaultValues;
  const [bgType, setBgType] = useState<BackgroundKey>(values.bgType);
  const [buttons, setButtons] = useState(values.buttons.slice(0, 2));
  const [showBranding, setShowBranding] = useState(
    values.showBranding ?? true
  );
  const [afterLaunchText, setAfterLaunchText] = useState(
    values.afterLaunchText ?? ""
  );
  const [analyticsId, setAnalyticsId] = useState(values.analyticsId ?? "");
  const [isPendingSave, startTransition] = useTransition();
  const [state, formAction, isPendingAction] = useActionState<State, FormData>(
    async (_prev, formData) => {
      formData.set("bgType", bgType);
      formData.set("buttons", JSON.stringify(buttons));
      formData.set("showBranding", String(showBranding));
      if (afterLaunchText) formData.set("afterLaunchText", afterLaunchText);
      if (analyticsId) formData.set("analyticsId", analyticsId);
      try {
        if (mode === "create") {
          const res = await createPageAction(formData);
          return { status: "created", ...res };
        }
        if (!editToken) throw new Error("No edit token");
        await updatePageAction(editToken, formData);
        return { status: "saved" };
      } catch (error: any) {
        toast.error(error?.message ?? "Save failed");
        return { status: "idle" };
      }
    },
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "created") {
      toast.success("Page created!");
    }
    if (state.status === "saved") {
      toast.success("Changes saved");
    }
  }, [state]);

  const eventDate = useMemo(() => new Date(values.eventDateTime), [values.eventDateTime]);
  const [localDate, setLocalDate] = useState(eventDate.toISOString().slice(0, 10));
  const [localTime, setLocalTime] = useState(
    eventDate.toISOString().slice(11, 16)
  );
  const [title, setTitle] = useState(values.title);
  const [description, setDescription] = useState(values.description ?? "");
  const [ownerEmail, setOwnerEmail] = useState(values.ownerEmail ?? "");

  const previewDate = useMemo(() => new Date(`${localDate}T${localTime}:00Z`), [localDate, localTime]);

  const addButton = () => {
    if (buttons.length >= 2) return;
    setButtons([...buttons, { label: "Second button", url: "https://example.com" }]);
  };

  const updateButton = (index: number, key: "label" | "url", value: string) => {
    setButtons((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const removeSecond = () => setButtons((prev) => prev.slice(0, 1));

  const isPending = isPendingAction || isPendingSave;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <form action={formAction} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Date</Label>
            <Input
              id="eventDate"
              name="eventDate"
              type="date"
              value={localDate}
              onChange={(e) => setLocalDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventTime">Time (UTC)</Label>
            <Input
              id="eventTime"
              name="eventTime"
              type="time"
              value={localTime}
              onChange={(e) => setLocalTime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Buttons</Label>
            {buttons.length < 2 ? (
              <Button type="button" size="sm" variant="outline" onClick={addButton}>
                Add second
              </Button>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={removeSecond}>
                Remove second
              </Button>
            )}
          </div>
          {buttons.map((btn, idx) => (
            <div key={idx} className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Button text"
                value={btn.label}
                onChange={(e) => updateButton(idx, "label", e.target.value)}
                required
              />
              <Input
                placeholder="https://"
                value={btn.url}
                onChange={(e) => updateButton(idx, "url", e.target.value)}
                required
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Label>Background</Label>
          <RadioGroupCard
            name="bgType"
            value={bgType}
            onChange={(v) => setBgType(v as BackgroundKey)}
            items={[
              { value: "dark-gradient", label: "Dark gradient" },
              { value: "purple-glow", label: "Purple glow" },
              { value: "light-clean", label: "Light clean" },
              { value: "sunset", label: "Sunset" },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Email (optional)</Label>
            <Input
              id="ownerEmail"
              name="ownerEmail"
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          {values.isPro ? (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">Branding</div>
                <p className="text-xs text-white/70">Show “Made with LaunchBio”</p>
              </div>
              <Switch
                checked={showBranding}
                onChange={(e) => setShowBranding(e.target.checked)}
                name="showBranding"
              />
            </div>
          ) : null}
        </div>

        {values.isPro ? (
          <div className="space-y-2">
            <Label>After-launch text</Label>
            <Textarea
              name="afterLaunchText"
              value={afterLaunchText}
              onChange={(e) => setAfterLaunchText(e.target.value)}
              placeholder="We're live! Click the button to..."
            />
            <Label>Analytics ID (GA/Plausible)</Label>
            <Input
              name="analyticsId"
              value={analyticsId}
              onChange={(e) => setAnalyticsId(e.target.value)}
              placeholder="G-XXXX / plausible"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            More settings unlock after upgrading to Launch Pack.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {mode === "create" ? "Create page" : "Save changes"}
          </Button>
          {mode === "edit" && values.slug ? (
            <Button variant="outline" asChild>
              <Link href={`/u/${values.slug}`}>Open public page</Link>
            </Button>
          ) : null}
        </div>

        {state.status === "created" ? (
          <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-white/80 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success">Ready</Badge>
              <span className="font-semibold">Page created</span>
            </div>
            <p>
              Public URL:{" "}
              <Link className="text-sky-300 underline" href={`/u/${state.slug}`}>
                /u/{state.slug}
              </Link>
            </p>
            <p>
              Editor:{" "}
              <Link className="text-sky-300 underline" href={`/edit/${state.editToken}`}>
                /edit/{state.editToken}
              </Link>
            </p>
          </div>
        ) : null}
      </form>

      <div
        className={cn(
          "rounded-2xl border border-white/10 p-6 shadow-2xl",
          backgroundPresets[bgType]
        )}
      >
        <div className="space-y-3 text-center">
          <div className="flex justify-between text-xs text-white/70">
            <span>Preview</span>
            <span>
              {localDate} · {localTime} UTC
            </span>
          </div>
          <h3 className={cn("text-3xl font-semibold", bgType === "light-clean" && "text-slate-900")}>
            {title || "Your launch"}
          </h3>
          <p className={cn("text-sm text-white/80", bgType === "light-clean" && "text-slate-700")}>
            {description || "Short launch description"}
          </p>
          <Countdown target={previewDate} afterLaunchText={afterLaunchText} />
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {buttons.map((btn) => (
              <Button key={btn.label} variant={bgType === "light-clean" ? "secondary" : "default"}>
                {btn.label}
              </Button>
            ))}
          </div>
          <p className={cn("text-xs", bgType === "light-clean" ? "text-slate-600" : "text-white/60")}>
            {showBranding ? "Made with LaunchBio" : "Branding hidden"}
          </p>
        </div>
      </div>
    </div>
  );
}

