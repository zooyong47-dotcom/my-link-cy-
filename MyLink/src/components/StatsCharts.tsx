"use client";

import React, { useId, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { CustomLink } from "@/types/mylink";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart3,
  PieChart as PieChartIcon,
  MousePointerClick,
  Sparkles,
} from "lucide-react";

const CHART_PALETTE = [
  "#4154FF", // primary-main
  "#4AB0F9", // sky blue
  "#8249D8", // violet
  "#008161", // platinum emerald
  "#6181EA", // cobalt
] as const;

interface StatsChartsProps {
  links: CustomLink[];
  totalClicks: number;
}

interface BarDatum {
  id: string;
  shortTitle: string;
  fullTitle: string;
  clicks: number;
  sharePercent: number;
  enabled: boolean;
  barFill: string;
  swatchColor: string;
}

interface PieDatum {
  key: string;
  label: string;
  fullTitle: string;
  clicks: number;
  sharePercent: number;
  fill: string;
}

export function getSafeClicks(link: CustomLink): number {
  return typeof link.clicks === "number" &&
    Number.isFinite(link.clicks) &&
    link.clicks >= 0
    ? link.clicks
    : 0;
}

function truncateLabel(text: string, maxLength: number): string {
  const chars = Array.from(text.trim());
  if (chars.length <= maxLength) return chars.join("");
  return `${chars.slice(0, maxLength).join("")}…`;
}

function formatSharePercent(clicks: number, totalClicks: number): number {
  if (totalClicks <= 0 || clicks <= 0) return 0;
  return Math.round((clicks / totalClicks) * 1000) / 10;
}

export function StatsCharts({ links, totalClicks }: StatsChartsProps) {
  const [filterMode, setFilterMode] = useState<"all" | "active">("all");
  const uid = useId().replace(/:/g, "");
  const gradTopId = `stats-bar-top-${uid}`;
  const gradActiveId = `stats-bar-active-${uid}`;
  const gradInactiveId = `stats-bar-inactive-${uid}`;

  const sortedAllLinks = useMemo(
    () =>
      [...links].sort((a, b) => {
        const diff = getSafeClicks(b) - getSafeClicks(a);
        if (diff !== 0) return diff;
        return a.title.localeCompare(b.title, "ko");
      }),
    [links]
  );

  const filteredLinks = useMemo(
    () =>
      filterMode === "active"
        ? sortedAllLinks.filter((link) => link.enabled)
        : sortedAllLinks,
    [sortedAllLinks, filterMode]
  );

  const filteredTotalClicks = useMemo(
    () => filteredLinks.reduce((sum, link) => sum + getSafeClicks(link), 0),
    [filteredLinks]
  );

  const barData = useMemo<BarDatum[]>(() => {
    const denominator = filterMode === "all" ? totalClicks : filteredTotalClicks;
    return filteredLinks.map((link, index) => {
      const clicks = getSafeClicks(link);
      let barFill = "#DADBDF";
      let swatchColor = "#DADBDF";

      if (clicks > 0) {
        if (!link.enabled) {
          barFill = `url(#${gradInactiveId})`;
          swatchColor = "#B2BAFF";
        } else if (index === 0) {
          barFill = `url(#${gradTopId})`;
          swatchColor = "#4154FF";
        } else {
          barFill = `url(#${gradActiveId})`;
          swatchColor = "#6181EA";
        }
      }

      return {
        id: link.id,
        shortTitle: truncateLabel(link.title, 14),
        fullTitle: link.title,
        clicks,
        sharePercent: formatSharePercent(clicks, denominator),
        enabled: link.enabled,
        barFill,
        swatchColor,
      };
    });
  }, [
    filteredLinks,
    filterMode,
    totalClicks,
    filteredTotalClicks,
    gradTopId,
    gradActiveId,
    gradInactiveId,
  ]);

  const maxBarClicks = useMemo(
    () => barData.reduce((max, item) => Math.max(max, item.clicks), 0),
    [barData]
  );

  const barChartConfig = useMemo<ChartConfig>(
    () => ({
      clicks: {
        label: "클릭수",
        color: "#4154FF",
      },
    }),
    []
  );

  const { pieData, pieChartConfig, topSliceShare } = useMemo(() => {
    const clickedLinks = sortedAllLinks.filter((l) => getSafeClicks(l) > 0);
    const items: PieDatum[] = [];
    const config: ChartConfig = {
      clicks: { label: "클릭수" },
    };

    const topSlice = clickedLinks.slice(0, 5);
    topSlice.forEach((link, idx) => {
      const clicks = getSafeClicks(link);
      const key = `slice${idx}`;
      const fill = CHART_PALETTE[idx % CHART_PALETTE.length];
      const label = truncateLabel(link.title, 12);
      items.push({
        key,
        label,
        fullTitle: link.title,
        clicks,
        sharePercent: formatSharePercent(clicks, totalClicks),
        fill,
      });
      config[key] = { label, color: fill };
    });

    if (clickedLinks.length > 5) {
      const rest = clickedLinks.slice(5);
      const restClicks = rest.reduce((sum, l) => sum + getSafeClicks(l), 0);
      const key = "other";
      const label = `기타 (${rest.length}개)`;
      items.push({
        key,
        label,
        fullTitle: `기타 링크 ${rest.length}개`,
        clicks: restClicks,
        sharePercent: formatSharePercent(restClicks, totalClicks),
        fill: "#B6B7BB",
      });
      config[key] = { label, color: "#B6B7BB" };
    }

    return {
      pieData: items,
      pieChartConfig: config,
      topSliceShare: items[0]?.sharePercent ?? 0,
    };
  }, [sortedAllLinks, totalClicks]);

  const activeCount = useMemo(
    () => links.filter((link) => link.enabled).length,
    [links]
  );

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* 1. 링크별 클릭수 막대 차트 */}
      <Card className="lg:col-span-3 bg-static-white border border-neutral-weak2 rounded-[24px] shadow-nol-1 overflow-hidden">
        <CardHeader className="p-5 sm:p-6 pb-3 flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 border-b border-neutral-weak1">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-[12px] bg-primary-weak text-primary-main border border-primary-weak1 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg font-bold text-neutral-main">
                링크별 클릭수
              </CardTitle>
              <CardDescription className="text-xs text-neutral-strong1 mt-0.5">
                각 링크에 누적된 클릭수를 한눈에 비교해 보세요.
              </CardDescription>
            </div>
          </div>

          <div
            role="group"
            aria-label="링크 필터"
            className="inline-flex items-center rounded-full bg-neutral-weak border border-neutral-weak2 p-0.5 shrink-0"
          >
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                filterMode === "all"
                  ? "bg-static-white text-primary-main shadow-2xs"
                  : "text-neutral-medium hover:text-neutral-main"
              }`}
            >
              전체 ({links.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("active")}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                filterMode === "active"
                  ? "bg-static-white text-primary-main shadow-2xs"
                  : "text-neutral-medium hover:text-neutral-main"
              }`}
            >
              활성 ({activeCount})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-4">
          {barData.length === 0 ? (
            <div className="h-[240px] rounded-[18px] border border-dashed border-neutral-weak2 bg-neutral-weak/40 flex flex-col items-center justify-center text-center px-4">
              <p className="text-xs sm:text-sm text-neutral-medium font-medium">
                활성화된 링크가 없습니다.
              </p>
            </div>
          ) : (
            <ChartContainer
              config={barChartConfig}
              className="w-full aspect-auto"
              style={{ height: Math.max(230, barData.length * 48) }}
            >
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 6, right: 54, left: 4, bottom: 6 }}
                barCategoryGap="24%"
              >
                <defs>
                  <linearGradient id={gradTopId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3549FF" />
                    <stop offset="100%" stopColor="#6181EA" />
                  </linearGradient>
                  <linearGradient id={gradActiveId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#5D74FF" />
                    <stop offset="100%" stopColor="#929DFF" />
                  </linearGradient>
                  <linearGradient id={gradInactiveId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#B2BAFF" />
                    <stop offset="100%" stopColor="#DFE2FF" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="3 3"
                  stroke="#E9EAEF"
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, maxBarClicks === 0 ? 5 : "auto"]}
                  tick={{ fontSize: 11, fill: "#8B8D92" }}
                  tickFormatter={(value: number) =>
                    value.toLocaleString("ko-KR")
                  }
                />
                <YAxis
                  type="category"
                  dataKey="shortTitle"
                  width={118}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#1B1C1F", fontWeight: 600 }}
                />
                <ChartTooltip
                  cursor={{ fill: "#F5F6FF", radius: 8 }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      className="rounded-[12px] border-neutral-weak2 bg-static-white/95 backdrop-blur-xs px-3 py-2 shadow-nol-2"
                      labelFormatter={(_value, payload) => {
                        const datum = payload?.[0]?.payload as
                          | BarDatum
                          | undefined;
                        if (!datum) return _value;
                        return (
                          <span className="font-bold text-neutral-main">
                            {datum.fullTitle}
                            {!datum.enabled && (
                              <span className="ml-1.5 text-[10px] font-medium text-neutral-medium">
                                (비활성)
                              </span>
                            )}
                          </span>
                        );
                      }}
                      formatter={(value, _name, item) => {
                        const datum = item?.payload as BarDatum | undefined;
                        const numeric =
                          typeof value === "number"
                            ? value
                            : Number(value || 0);
                        return (
                          <div className="flex flex-1 items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-neutral-strong1">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-[3px]"
                                style={{
                                  backgroundColor:
                                    datum?.swatchColor || "#4154FF",
                                }}
                              />
                              <span>클릭수</span>
                            </span>
                            <span className="font-mono font-bold text-neutral-main tabular-nums">
                              {numeric.toLocaleString("ko-KR")}회
                              {datum && datum.sharePercent > 0 ? (
                                <span className="ml-1 font-normal text-neutral-medium">
                                  ({datum.sharePercent}%)
                                </span>
                              ) : null}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="clicks"
                  fill="var(--color-clicks)"
                  radius={[0, 8, 8, 0]}
                  maxBarSize={26}
                  background={{ fill: "#F7F8FB", radius: 8 }}
                >
                  {barData.map((entry) => (
                    <Cell key={entry.id} fill={entry.barFill} />
                  ))}
                  <LabelList
                    dataKey="clicks"
                    position="right"
                    offset={8}
                    className="fill-neutral-strong1 font-mono text-[11px] font-bold"
                    formatter={(value) =>
                      `${Number(value ?? 0).toLocaleString("ko-KR")}회`
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* 2. 클릭 점유율 도넛 차트 */}
      <Card className="lg:col-span-2 bg-static-white border border-neutral-weak2 rounded-[24px] shadow-nol-1 overflow-hidden flex flex-col">
        <CardHeader className="p-5 sm:p-6 pb-3 flex flex-row items-start justify-between gap-2 space-y-0 border-b border-neutral-weak1">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-[12px] bg-primary-weak text-primary-main border border-primary-weak1 flex items-center justify-center shrink-0">
              <PieChartIcon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg font-bold text-neutral-main">
                클릭 비중
              </CardTitle>
              <CardDescription className="text-xs text-neutral-strong1 mt-0.5">
                상위 링크 점유율 분포
              </CardDescription>
            </div>
          </div>
          <Badge variant="primary" className="text-[10px] shrink-0">
            TOP 5
          </Badge>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-4 flex-1 flex flex-col justify-between gap-3">
          {pieData.length === 0 ? (
            <div className="min-h-[250px] rounded-[18px] border border-dashed border-neutral-weak2 bg-neutral-weak/40 flex flex-col items-center justify-center text-center px-4 gap-2.5">
              <div className="w-11 h-11 rounded-full bg-primary-weak text-primary-main flex items-center justify-center">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-neutral-main">
                아직 발생한 클릭이 없습니다
              </p>
              <p className="text-[11px] text-neutral-medium leading-relaxed">
                내 프로필 링크를 공유하면 링크별 클릭 비중 도넛 차트가 표시됩니다.
              </p>
            </div>
          ) : (
            <>
              <ChartContainer
                config={pieChartConfig}
                className="mx-auto w-full aspect-auto h-[275px] sm:h-[295px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        nameKey="key"
                        className="rounded-[12px] border-neutral-weak2 bg-static-white/95 backdrop-blur-xs px-3 py-2 shadow-nol-2"
                        formatter={(value, _name, item) => {
                          const datum = item?.payload as PieDatum | undefined;
                          const numeric =
                            typeof value === "number"
                              ? value
                              : Number(value || 0);
                          return (
                            <div className="flex flex-1 items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-neutral-main font-medium max-w-[140px] truncate">
                                <span
                                  className="inline-block h-2.5 w-2.5 rounded-[3px] shrink-0"
                                  style={{
                                    backgroundColor: datum?.fill || "#4154FF",
                                  }}
                                />
                                <span className="truncate">
                                  {datum?.fullTitle || datum?.label}
                                </span>
                              </span>
                              <span className="font-mono font-bold text-neutral-main tabular-nums shrink-0">
                                {numeric.toLocaleString("ko-KR")}회
                                {datum ? (
                                  <span className="ml-1 font-normal text-neutral-medium">
                                    ({datum.sharePercent}%)
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          );
                        }}
                      />
                    }
                  />
                  <Pie
                    data={pieData}
                    dataKey="clicks"
                    nameKey="key"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={3}
                    cornerRadius={6}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (
                          viewBox &&
                          "cx" in viewBox &&
                          "cy" in viewBox &&
                          typeof viewBox.cx === "number" &&
                          typeof viewBox.cy === "number"
                        ) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy - 4}
                                className="fill-neutral-main text-xl font-extrabold tabular-nums"
                              >
                                {totalClicks.toLocaleString("ko-KR")}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy + 16}
                                className="fill-neutral-medium text-[11px] font-semibold"
                              >
                                총 클릭
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </Pie>
                  <ChartLegend
                    content={
                      <ChartLegendContent
                        nameKey="key"
                        className="text-[11px] text-neutral-strong1"
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>

              {topSliceShare > 0 && (
                <div className="rounded-[12px] bg-primary-weak/60 border border-primary-weak1 px-3 py-2 flex items-center gap-2 text-[11px] text-neutral-strong1">
                  <Sparkles className="w-3.5 h-3.5 text-primary-main shrink-0" />
                  <span className="truncate">
                    1위 링크가 전체 클릭의{" "}
                    <strong className="text-primary-main font-bold tabular-nums">
                      {topSliceShare}%
                    </strong>
                    를 차지하고 있어요.
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
