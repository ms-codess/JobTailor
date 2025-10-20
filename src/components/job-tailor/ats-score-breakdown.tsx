
'use client';

import { Briefcase, Lightbulb, Star } from "lucide-react";
import { Progress } from "../ui/progress";

type Breakdown = {
    roleMatch: { score: number; analysis: string; };
    experienceMatch: { score: number; analysis: string; };
    skillsMatch: { score: number; analysis: string; };
};

interface AtsScoreBreakdownProps {
  breakdown: Breakdown;
}

const BreakdownItem = ({ title, icon, score, analysis }: { title: string; icon: React.ReactNode; score: number; analysis: string }) => {
    const getScoreColor = (score: number) => {
        if (score < 40) return 'bg-red-500';
        if (score < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    return (
        <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                {icon}
                {title}
            </h4>
            <div className="flex items-center gap-2 mb-1">
                <Progress value={score} className="h-2 [&>div]:bg-primary" />
                <span className="font-bold text-primary text-sm">{score}</span>
            </div>
            <p className="text-xs text-muted-foreground">{analysis}</p>
        </div>
    );
}

export function AtsScoreBreakdown({ breakdown }: AtsScoreBreakdownProps) {
  if (!breakdown || !breakdown.roleMatch || !breakdown.experienceMatch || !breakdown.skillsMatch) {
    return null;
  }
  
  return (
    <div className="space-y-4">
        <h3 className="font-semibold text-base">Score Breakdown</h3>
        <BreakdownItem 
            title="Role & Title Match"
            icon={<Briefcase size={16} />}
            score={breakdown.roleMatch.score}
            analysis={breakdown.roleMatch.analysis}
        />
        <BreakdownItem 
            title="Experience Relevance"
            icon={<Lightbulb size={16} />}
            score={breakdown.experienceMatch.score}
            analysis={breakdown.experienceMatch.analysis}
        />
        <BreakdownItem 
            title="Skills & Keyword Alignment"
            icon={<Star size={16} />}
            score={breakdown.skillsMatch.score}
            analysis={breakdown.skillsMatch.analysis}
        />
    </div>
  );
}

    