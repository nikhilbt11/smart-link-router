import Card from "@/components/ui/Card";
import type { PlatformDistribution } from "@/lib/services/analyticsService";

interface SummaryCardsProps {
  totalClicks: number;
  platformDistribution: PlatformDistribution;
}

export default function SummaryCards({ totalClicks, platformDistribution }: SummaryCardsProps) {
  const cards = [
    { label: "Total Clicks", value: totalClicks },
    { label: "iOS", value: platformDistribution.iOS },
    { label: "Android", value: platformDistribution.Android },
    { label: "Desktop", value: platformDistribution.Desktop },
    { label: "Other", value: platformDistribution.Other },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
