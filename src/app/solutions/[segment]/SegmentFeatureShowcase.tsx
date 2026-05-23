"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Award,
  Building,
  Clock,
  CreditCard,
  FileText,
  Globe,
  Keyboard,
  Landmark,
  MonitorPlay,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Star,
  Users,
  Video,
  Volume2,
  Zap,
} from "lucide-react";

import FeatureVisual from "@/components/FeatureVisual";
import type { SegmentContent } from "./segmentData";

const featureIcons: Record<string, LucideIcon> = {
  activity: Activity,
  award: Award,
  building: Building,
  chart: Activity,
  clock: Clock,
  dollar: CreditCard,
  file: FileText,
  film: Video,
  globe: Globe,
  id: Landmark,
  keyboard: Keyboard,
  lock: ShieldCheck,
  map: Globe,
  monitor: MonitorPlay,
  phone: Phone,
  refresh: RefreshCw,
  shield: ShieldCheck,
  smartphone: Smartphone,
  star: Star,
  tag: Landmark,
  users: Users,
  video: Video,
  volume: Volume2,
  zap: Zap,
  "trending-down": Activity,
};

interface SegmentFeatureShowcaseProps {
  features: SegmentContent["features"];
  segmentLabel: string;
}

export default function SegmentFeatureShowcase({
  features,
  segmentLabel,
}: SegmentFeatureShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = features[activeIndex] ?? features[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
      <div
        className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0"
        role="tablist"
        aria-label={`${segmentLabel} feature screenshots`}
      >
        {features.map((feature, index) => {
          const Icon = featureIcons[feature.icon] ?? Zap;
          const isActive = index === activeIndex;

          return (
            <button
              key={feature.name}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="segment-feature-visual"
              onClick={() => setActiveIndex(index)}
              className={`group flex min-w-[280px] gap-4 rounded-2xl border p-5 text-left transition-all lg:min-w-0 ${
                isActive
                  ? "border-blue-200 bg-blue-50 shadow-lg shadow-blue-900/5"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                }`}
              >
                <Icon size={22} />
              </span>
              <span>
                <span className="block text-lg font-black text-slate-900">
                  {feature.name}
                </span>
                <span className="mt-1 block text-sm font-medium leading-relaxed text-slate-500">
                  {feature.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div id="segment-feature-visual" role="tabpanel" className="lg:sticky lg:top-32">
        <FeatureVisual
          headline={activeFeature.name}
          accent="#2563eb"
          accentBg="bg-blue-600"
        />
        <p className="mt-4 text-center text-sm font-bold uppercase tracking-widest text-slate-400">
          {activeFeature.name} screenshot
        </p>
      </div>
    </div>
  );
}
