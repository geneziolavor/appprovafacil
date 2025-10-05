'use client';

import { Pie, PieChart, Cell } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

type ResultsChartProps = {
    data: { name: string, value: number, fill: string }[];
}

const chartConfig = {
  acertos: {
    label: 'Acertos',
    color: 'hsl(var(--chart-2))',
  },
  erros: {
    label: 'Erros',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function ResultsChart({ data }: ResultsChartProps) {
  return (
    <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-[250px]"
    >
        <PieChart>
        <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
        />
        <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
        >
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
        </Pie>
        </PieChart>
    </ChartContainer>
  );
}
