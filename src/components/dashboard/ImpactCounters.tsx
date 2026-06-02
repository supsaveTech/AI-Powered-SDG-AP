"use client";

import { StatCard } from "./StatCard";
import { Users, MapPin, School, Mic, Target, CalendarDays } from "lucide-react";

interface ImpactCountersProps {
  totalRespondents: number;
  communitiesReached: number;
  schoolsEngaged: number;
  awarenessSessions: number;
  sdgsSupported: number;
  projectDurationDays: number;
}

export function ImpactCounters({
  totalRespondents,
  communitiesReached,
  schoolsEngaged,
  awarenessSessions,
  sdgsSupported,
  projectDurationDays
}: ImpactCountersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      <StatCard
        title="Total Respondents"
        value={totalRespondents}
        icon={Users}
        delay={0.1}
        colorClass="text-primary"
      />
      <StatCard
        title="Communities"
        value={communitiesReached}
        icon={MapPin}
        delay={0.2}
        colorClass="text-[#FD6925]"
      />
      <StatCard
        title="Schools Engaged"
        value={schoolsEngaged}
        icon={School}
        delay={0.3}
        colorClass="text-[#8F1838]"
      />
      <StatCard
        title="Awareness Sessions"
        value={awarenessSessions}
        icon={Mic}
        delay={0.4}
        colorClass="text-primary"
      />
      <StatCard
        title="SDGs Supported"
        value={sdgsSupported}
        icon={Target}
        delay={0.5}
        colorClass="text-[#FD6925]"
      />
      <StatCard
        title="Project Days"
        value={projectDurationDays}
        icon={CalendarDays}
        delay={0.6}
        colorClass="text-[#8F1838]"
      />
    </div>
  );
}
