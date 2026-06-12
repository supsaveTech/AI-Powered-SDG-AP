"use client";

import { StatCard } from "./StatCard";
import { Users, MapPin, BrainCircuit, Briefcase, Target } from "lucide-react";

interface ImpactCountersProps {
  totalRespondents: number;
  communitiesReached: number;
  aiAdoptionRate: number;
  remoteWorkInterest: number;
  sdgsSupported: number;
}

export function ImpactCounters({
  totalRespondents,
  communitiesReached,
  aiAdoptionRate,
  remoteWorkInterest,
  sdgsSupported
}: ImpactCountersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
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
        title="AI Adoption Rate"
        value={`${aiAdoptionRate}%`}
        icon={BrainCircuit}
        delay={0.3}
        colorClass="text-[#8F1838]"
      />
      <StatCard
        title="Remote Work Interest"
        value={`${remoteWorkInterest}%`}
        icon={Briefcase}
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
    </div>
  );
}
