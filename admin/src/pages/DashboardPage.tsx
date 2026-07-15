import { useEffect, useMemo, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { fetchCharacters, type AdminCharacter } from '@/lib/characters';
import { fetchAllTradeListings } from '@/lib/tradeListings';
import { fetchAllTopups } from '@/lib/wallet';
import { fetchAllFeedback } from '@/lib/feedback';
import { RARITY_ORDER, RARITY_SWATCH } from '@/lib/rarity';
import { TRADE_STATUS_OPTIONS } from '@/lib/badges';
import { buildDayBuckets, countByDay, isWithinDays, sumByDay } from '@/lib/dashboardStats';
import { CheckIcon, HelpCircleIcon, PlusIcon, TagIcon, UsersIcon } from '@/components/icons';
import type { TradeListing } from '@main/types/tradeListing';
import type { PhieuTopup } from '@main/types/wallet';
import type { FeedbackEntry } from '@main/types/feedback';

interface StatTileProps {
  label: string;
  value: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tint: string;
}

function StatTile({ label, value, icon: Icon, tint }: StatTileProps) {
  return (
    <div className="group rounded-card border border-border bg-surface p-5 shadow-elevated transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated-lg">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105 ${tint}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'buổi sáng';
  if (hour < 18) return 'buổi chiều';
  return 'buổi tối';
}

function getTodayLabel(): string {
  const label = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function DashboardPage() {
  const { state } = useAuth();
  const email = state.status === 'authorized' ? state.user.email : null;

  const [characters, setCharacters] = useState<AdminCharacter[]>([]);
  const [tradeListings, setTradeListings] = useState<TradeListing[]>([]);
  const [topups, setTopups] = useState<PhieuTopup[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCharacters(), fetchAllTradeListings(), fetchAllTopups(), fetchAllFeedback()])
      .then(([characterData, tradeData, topupData, feedbackData]) => {
        setCharacters(characterData);
        setTradeListings(tradeData);
        setTopups(topupData);
        setFeedback(feedbackData);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  // Hidden characters are soft-deleted from the public site — keep dashboard counts matching what it shows.
  const visibleCharacters = useMemo(() => characters.filter((c) => c.isVisible), [characters]);

  const pendingTradeListings = useMemo(() => tradeListings.filter((l) => l.status === 'pending').length, [tradeListings]);
  const pendingTopups = useMemo(() => topups.filter((t) => t.status === 'pending').length, [topups]);
  const newFeedbackCount = useMemo(() => feedback.filter((f) => isWithinDays(f.createdAt, 7)).length, [feedback]);

  const rarityBreakdown = useMemo(() => {
    const counts = new Map<string, number>(RARITY_ORDER.map((rarity) => [rarity, 0]));
    for (const character of visibleCharacters) {
      counts.set(character.rarity, (counts.get(character.rarity) ?? 0) + 1);
    }
    const max = Math.max(1, ...counts.values());
    return RARITY_ORDER.map((rarity) => ({
      rarity,
      count: counts.get(rarity) ?? 0,
      pct: ((counts.get(rarity) ?? 0) / max) * 100,
    }));
  }, [visibleCharacters]);

  const activityChartData = useMemo(() => {
    const buckets = buildDayBuckets(7);
    const tradeCounts = countByDay(tradeListings, (l) => l.createdAt, 7);
    const topupCounts = countByDay(topups, (t) => t.createdAt, 7);
    const feedbackCounts = countByDay(feedback, (f) => f.createdAt, 7);
    return buckets.map((bucket, index) => ({
      label: bucket.label,
      'Trade Listings': tradeCounts[index],
      'Top-ups': topupCounts[index],
      Feedback: feedbackCounts[index],
    }));
  }, [tradeListings, topups, feedback]);

  const tradeStatusData = useMemo(() => {
    const colorByStatus = Object.fromEntries(TRADE_STATUS_OPTIONS.map((o) => [o.value, o.color]));
    return TRADE_STATUS_OPTIONS.map((option) => ({
      name: option.value,
      value: tradeListings.filter((l) => l.status === option.value).length,
      color: colorByStatus[option.value],
    })).filter((entry) => entry.value > 0);
  }, [tradeListings]);

  const revenueChartData = useMemo(() => {
    const approvedTopups = topups.filter((t) => t.status === 'approved');
    const buckets = buildDayBuckets(30);
    const sums = sumByDay(approvedTopups, (t) => t.createdAt, (t) => t.amountVnd, 30);
    return buckets.map((bucket, index) => ({ label: bucket.label, amount: sums[index] }));
  }, [topups]);

  if (loading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Chào {getGreeting()}, {email ?? 'Quản trị viên'} 👋
          </h2>
          <p className="mt-1 text-sm text-muted">
            <span className={pendingTradeListings + pendingTopups > 0 ? 'font-semibold text-danger' : ''}>
              {pendingTradeListings} trade listing chờ duyệt
            </span>
            {' · '}
            {pendingTopups} top-up chờ duyệt · {newFeedbackCount} feedback mới
          </p>
        </div>
        <span className="rounded-full border border-border bg-elevated px-3.5 py-1.5 text-xs font-semibold text-muted">
          {getTodayLabel()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Tổng Characters" value={visibleCharacters.length} icon={UsersIcon} tint="bg-accent" />
        <StatTile label="Feedback mới (7 ngày)" value={newFeedbackCount} icon={HelpCircleIcon} tint="bg-accent-info" />
        <StatTile
          label="Top-ups chờ duyệt"
          value={pendingTopups}
          icon={CheckIcon}
          tint={pendingTopups > 0 ? 'bg-warning' : 'bg-success'}
        />
        <StatTile
          label="Trade Listings chờ duyệt"
          value={pendingTradeListings}
          icon={TagIcon}
          tint={pendingTradeListings > 0 ? 'bg-danger' : 'bg-success'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-border bg-surface p-5 shadow-elevated lg:col-span-2">
          <h2 className="text-sm font-bold text-foreground">Hoạt động 7 ngày qua</h2>
          <p className="text-xs text-muted">Trade listing, top-up, feedback mới theo ngày</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-subtle)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: 'var(--color-border)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Trade Listings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Top-ups" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Feedback" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 shadow-elevated">
          <h2 className="text-sm font-bold text-foreground">Trạng thái Trade Listings</h2>
          <p className="text-xs text-muted">Tỉ lệ theo trạng thái hiện tại</p>
          {tradeStatusData.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted">Chưa có dữ liệu</p>
          ) : (
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tradeStatusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {tradeStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: 'var(--color-border)', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-border bg-surface p-5 shadow-elevated lg:col-span-2">
          <h2 className="text-sm font-bold text-foreground">Nạp phiếu 30 ngày qua</h2>
          <p className="text-xs text-muted">Tổng tiền nạp đã được cộng (đã duyệt/tự động khớp) mỗi ngày</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--color-subtle)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-subtle)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: 'var(--color-border)', fontSize: 12 }}
                  formatter={(value) => formatVnd(Number(value))}
                />
                <Line type="monotone" dataKey="amount" name="Tiền nạp" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 shadow-elevated">
          <h2 className="text-sm font-bold text-foreground">Characters theo rarity</h2>
          <div className="mt-4 flex flex-col gap-3">
            {rarityBreakdown.map(({ rarity, count, pct }) => (
              <div key={rarity} className="flex items-center gap-2.5">
                <span className="flex w-12 shrink-0 items-center gap-1.5 text-xs font-semibold text-foreground">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/5"
                    style={{ backgroundColor: RARITY_SWATCH[rarity] }}
                  />
                  {rarity}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                    style={{ width: `${count === 0 ? 0 : Math.max(pct, 4)}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-semibold text-muted">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {characters.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-sm font-semibold text-foreground">No characters yet</p>
          <p className="mt-1 text-sm text-muted">Add your first character to get started.</p>
          <Link
            to="/characters/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-elevated-lg active:translate-y-0 active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Character
          </Link>
        </div>
      )}
    </div>
  );
}
