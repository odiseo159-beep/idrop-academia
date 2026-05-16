"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  buildMonthMatrix,
  CALENDAR_CATEGORIES,
  CATEGORY_STYLE,
  eventCoversDate,
  eventDurationDays,
  eventsForDay,
  eventsForMonth,
  isoForDate,
  parseEventDate,
  pickLocalized,
  sameDay,
  startOfDay,
  type CalendarCategory,
  type CalendarEvent,
} from "@/lib/calendar";
import type { Locale } from "@/lib/types";

type Props = {
  events: CalendarEvent[];
  lastUpdated: string;
  locale: Locale;
};

// ============================================================
// Top-level component
// ============================================================
export function V2Calendar({ events, lastUpdated, locale }: Props) {
  const t = useTranslations("v2.calendar");

  // SSR-safe "today": initial render has no live highlight; useEffect sets it
  // after hydration so the server-rendered HTML and the first client render
  // match exactly (no hydration mismatch).
  const [today, setToday] = useState<Date | null>(null);
  const [viewYear, setViewYear] = useState<number>(() => 2026);
  const [viewMonth, setViewMonth] = useState<number>(() => 4); // May (0-indexed)
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<CalendarCategory>>(
    () => new Set()
  );

  useEffect(() => {
    const now = startOfDay(new Date());
    setToday(now);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedIso(isoForDate(now));
  }, []);

  // Formatters depend only on locale, not on state changes
  const monthLong = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long" }),
    [locale]
  );
  const weekdayShort = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale]
  );
  const longDate = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [locale]
  );
  const shortDay = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }),
    [locale]
  );
  const lastUpdatedFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(parseEventDate(lastUpdated)),
    [locale, lastUpdated]
  );

  // Derived state — matrix and events per cell
  const matrix = useMemo(
    () => buildMonthMatrix(viewYear, viewMonth, today ?? new Date(viewYear, viewMonth, 1)),
    [viewYear, viewMonth, today]
  );
  const monthEvents = useMemo(
    () => eventsForMonth(events, viewYear, viewMonth, activeCategories),
    [events, viewYear, viewMonth, activeCategories]
  );

  // Index events by day ISO for the grid. Multi-day events appear only on
  // their start date in the grid (with a "→ Nd" indicator); the day detail
  // panel still shows ongoing multi-day events for any covered day.
  const eventsByStartIso = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of monthEvents) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [monthEvents]);

  const selectedDate = selectedIso ? parseEventDate(selectedIso) : null;
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsForDay(events, selectedDate, activeCategories);
  }, [events, selectedDate, activeCategories]);

  // ============================================================
  // Handlers
  // ============================================================
  function toggleCategory(cat: CalendarCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }
  function clearCategories() {
    setActiveCategories(new Set());
  }
  function shiftMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    while (m < 0) { m += 12; y -= 1; }
    while (m > 11) { m -= 12; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }
  function goToToday() {
    if (!today) return;
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedIso(isoForDate(today));
  }
  function selectDay(date: Date) {
    setSelectedIso(isoForDate(date));
  }

  const filterCount = monthEvents.length;
  const filtersActive = activeCategories.size > 0;
  const monthLabel = monthLong.format(new Date(viewYear, viewMonth, 1));
  const monthHeader = `${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)} ${viewYear}`;

  // Weekday header row (Mon-first). Build from a known Monday so locale
  // affects only the *labels*, not the order.
  const weekdayHeaders = useMemo(() => {
    // 2026-05-04 is a Monday — use as a stable reference date
    const refMon = new Date(2026, 4, 4);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(refMon.getFullYear(), refMon.getMonth(), refMon.getDate() + i);
      return weekdayShort.format(d).replace(/\.$/, "");
    });
  }, [weekdayShort]);

  return (
    <main
      style={{
        background: "var(--color-ink-0)",
        minHeight: "calc(100vh - 80px)",
        padding: "56px 32px 96px",
      }}
    >
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        {/* ─────── Hero ─────── */}
        <header style={{ marginBottom: 40 }}>
          <div
            className="v2-mono v2-mc"
            style={{ color: "var(--color-bnb)", marginBottom: 14 }}
          >
            {t("kicker")}
          </div>
          <h1
            className="v2-serif"
            style={{
              fontSize: "clamp(40px, 5.6vw, 72px)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              fontWeight: 400,
              color: "var(--color-t-0)",
              margin: 0,
              maxWidth: 980,
            }}
          >
            {t.rich("title", {
              italic: (chunks) => (
                <em style={{ fontStyle: "italic", color: "var(--color-bnb)" }}>
                  {chunks}
                </em>
              ),
            })}
          </h1>
          <p
            className="v2-sans"
            style={{
              marginTop: 22,
              color: "var(--color-t-1)",
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 720,
            }}
          >
            {t("blurb")}
          </p>
          <div
            className="v2-mono v2-mc"
            style={{ marginTop: 18, color: "var(--color-t-3)" }}
          >
            {t("lastUpdated", { date: lastUpdatedFmt })}
          </div>
        </header>

        <div className="v2-hairline" style={{ height: 1, margin: "24px 0" }} />

        {/* ─────── Toolbar: month nav + filters ─────── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label={t("prevMonth")}
              className="v2-mono v2-mc v2-cta-ghost"
              style={navArrowStyle}
            >
              ←
            </button>
            <div
              className="v2-serif"
              style={{
                fontSize: 28,
                fontStyle: "italic",
                color: "var(--color-t-0)",
                letterSpacing: "-0.018em",
                minWidth: 220,
              }}
            >
              {monthHeader}
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label={t("nextMonth")}
              className="v2-mono v2-mc v2-cta-ghost"
              style={navArrowStyle}
            >
              →
            </button>
            <button
              type="button"
              onClick={goToToday}
              disabled={!today}
              className="v2-mono v2-mc v2-cta-ghost"
              style={{ ...todayBtnStyle, opacity: today ? 1 : 0.35 }}
            >
              {t("stickyToday")}
            </button>
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <FilterChip
              label={t("filterAll")}
              active={!filtersActive}
              onClick={clearCategories}
            />
            {CALENDAR_CATEGORIES.map((cat) => (
              <FilterChip
                key={cat}
                label={t(`categories.${cat}` as const)}
                category={cat}
                active={activeCategories.has(cat)}
                onClick={() => toggleCategory(cat)}
              />
            ))}
          </div>
        </div>

        {/* Filter status line */}
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)", marginBottom: 18 }}
        >
          {filtersActive
            ? t("filterHint", { count: filterCount })
            : t("filterHintAll", { count: filterCount, month: monthLabel })}
        </div>

        {/* ─────── Grid (desktop) ─────── */}
        <section
          className="v2-cal-desktop"
          aria-label={monthHeader}
          style={{ border: "1px solid var(--color-line-2)" }}
        >
          {/* Weekday row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: "1px solid var(--color-line-2)",
              background: "var(--color-ink-1)",
            }}
          >
            {weekdayHeaders.map((wd, i) => (
              <div
                key={i}
                className="v2-mono v2-mc"
                style={{
                  padding: "12px 14px",
                  color: "var(--color-t-2)",
                  borderRight:
                    i < 6 ? "1px solid var(--color-line-1)" : "none",
                }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* 6 × 7 day grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gridAutoRows: "minmax(110px, 1fr)",
            }}
          >
            {matrix.map((cell, i) => {
              const dayEvents = eventsByStartIso.get(isoForDate(cell.date)) ?? [];
              const isSelected = selectedDate
                ? sameDay(cell.date, selectedDate)
                : false;
              const showTopBorder = i >= 7;
              return (
                <DayCell
                  key={i}
                  cell={cell}
                  events={dayEvents}
                  locale={locale}
                  isSelected={isSelected}
                  showTopBorder={showTopBorder}
                  rightBorder={i % 7 !== 6}
                  onSelect={() => selectDay(cell.date)}
                  todayLabel={t("todayShort")}
                  moreLabel={(n) => t("moreEvents", { count: n })}
                />
              );
            })}
          </div>
        </section>

        {/* ─────── Day detail panel (desktop) ─────── */}
        <section className="v2-cal-desktop" style={{ marginTop: 36 }}>
          <DayDetail
            selectedDate={selectedDate}
            today={today}
            events={selectedEvents}
            longDate={longDate}
            shortDay={shortDay}
            locale={locale}
            t={{
              dateLabel: t("dateLabel"),
              categoryLabel: t("categoryLabel"),
              rangeLabel: t("rangeLabel"),
              sourceLabel: t("sourceLabel"),
              openLink: t("openLink"),
              noEventsDay: t("noEventsDay"),
              selectDay: t("selectDay"),
              todayShort: t("todayShort"),
              daysMulti: (n) => t("daysMulti", { count: n }),
              endsToday: t("endsToday"),
              startsIn: (n) => t("startsIn", { n }),
              happeningNow: t("happeningNow"),
              untilLabel: t("untilLabel"),
              category: (c) => t(`categories.${c}` as const),
            }}
          />
        </section>

        {/* ─────── Mobile list (replaces grid on narrow viewports) ─────── */}
        <section className="v2-cal-mobile">
          <div
            className="v2-mono v2-mc"
            style={{
              color: "var(--color-t-3)",
              marginBottom: 18,
            }}
          >
            {t("mobileListHeading")}
          </div>
          {monthEvents.length === 0 ? (
            <div
              className="v2-sans"
              style={{
                padding: "24px",
                border: "1px solid var(--color-line-2)",
                color: "var(--color-t-2)",
              }}
            >
              {t("noEventsMonth")}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {monthEvents.map((ev, idx) => (
                <MobileEventRow
                  key={ev.id}
                  event={ev}
                  locale={locale}
                  today={today}
                  shortDay={shortDay}
                  firstRow={idx === 0}
                  t={{
                    categoryLabel: t("categoryLabel"),
                    rangeLabel: t("rangeLabel"),
                    sourceLabel: t("sourceLabel"),
                    openLink: t("openLink"),
                    daysMulti: (n) => t("daysMulti", { count: n }),
                    endsToday: t("endsToday"),
                    startsIn: (n) => t("startsIn", { n }),
                    happeningNow: t("happeningNow"),
                    untilLabel: t("untilLabel"),
                    category: (c) => t(`categories.${c}` as const),
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* ─────── Legend ─────── */}
        <section style={{ marginTop: 56 }}>
          <div className="v2-hairline" style={{ height: 1, marginBottom: 18 }} />
          <div
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)", marginBottom: 14 }}
          >
            {t("legendTitle")}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              fontSize: 12.5,
            }}
          >
            {CALENDAR_CATEGORIES.map((cat) => {
              const style = CATEGORY_STYLE[cat];
              return (
                <div
                  key={cat}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                  className="v2-mono"
                >
                  <span
                    aria-hidden
                    style={{
                      width: 10,
                      height: 10,
                      background: style.color,
                      display: "inline-block",
                      transform: "rotate(45deg)",
                    }}
                  />
                  <span style={{ color: "var(--color-t-1)" }}>
                    {t(`categories.${cat}` as const)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

// ============================================================
// Sub-components
// ============================================================

function FilterChip({
  label,
  category,
  active,
  onClick,
}: {
  label: string;
  category?: CalendarCategory;
  active: boolean;
  onClick: () => void;
}) {
  const style = category ? CATEGORY_STYLE[category] : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="v2-mono v2-mc"
      aria-pressed={active}
      style={{
        padding: "8px 14px",
        background: active && style ? style.bgSoft : "transparent",
        color: active
          ? style
            ? style.color
            : "var(--color-t-0)"
          : "var(--color-t-2)",
        border: `1px solid ${
          active
            ? style
              ? style.border
              : "var(--color-bnb-line)"
            : "var(--color-line-3)"
        }`,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "border-color 0.2s ease, color 0.2s ease, background 0.2s ease",
      }}
    >
      {category && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            background: style!.color,
            display: "inline-block",
            transform: "rotate(45deg)",
          }}
        />
      )}
      {label}
    </button>
  );
}

function DayCell({
  cell,
  events,
  locale,
  isSelected,
  showTopBorder,
  rightBorder,
  onSelect,
  todayLabel,
  moreLabel,
}: {
  cell: { date: Date; inMonth: boolean; isToday: boolean };
  events: CalendarEvent[];
  locale: Locale;
  isSelected: boolean;
  showTopBorder: boolean;
  rightBorder: boolean;
  onSelect: () => void;
  todayLabel: string;
  moreLabel: (n: number) => string;
}) {
  const hasEvents = events.length > 0;
  const visibleEvents = events.slice(0, 2);
  const overflow = events.length - visibleEvents.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="v2-calendar-cell"
      aria-label={`${cell.date.toLocaleDateString(locale)}${
        hasEvents ? ` · ${events.length}` : ""
      }`}
      style={{
        position: "relative",
        background: isSelected
          ? "var(--color-ink-2)"
          : cell.inMonth
          ? "var(--color-ink-0)"
          : "var(--color-ink-1)",
        borderTop: showTopBorder ? "1px solid var(--color-line-1)" : "none",
        borderRight: rightBorder ? "1px solid var(--color-line-1)" : "none",
        padding: "10px 10px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 4,
        cursor: hasEvents || cell.inMonth ? "pointer" : "default",
        textAlign: "left",
        fontFamily: "inherit",
        outline: isSelected ? "1px solid var(--color-bnb-line)" : "none",
        outlineOffset: "-2px",
        transition: "background 0.15s ease",
      }}
    >
      {/* Day number row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          className="v2-mono v2-tnum"
          style={{
            fontSize: 13,
            fontWeight: cell.isToday ? 600 : 400,
            color: cell.isToday
              ? "var(--color-bnb)"
              : cell.inMonth
              ? "var(--color-t-1)"
              : "var(--color-t-4)",
          }}
        >
          {cell.date.getDate()}
        </span>
        {cell.isToday && (
          <span
            className="v2-mono v2-mc"
            style={{
              color: "var(--color-bnb)",
              fontSize: 9,
              letterSpacing: "0.18em",
            }}
          >
            {todayLabel}
          </span>
        )}
      </div>

      {/* Event chips */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          marginTop: 2,
        }}
      >
        {visibleEvents.map((ev) => {
          const style = CATEGORY_STYLE[ev.category];
          const title = pickLocalized(ev.title, locale);
          const days = eventDurationDays(ev);
          return (
            <div
              key={ev.id}
              title={title}
              className="v2-mono"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 6px",
                background: style.bgChip,
                borderLeft: `2px solid ${style.color}`,
                fontSize: 10.5,
                color: "var(--color-t-1)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {title}
              </span>
              {days > 1 && (
                <span style={{ color: "var(--color-t-3)", flexShrink: 0 }}>
                  →{days}d
                </span>
              )}
            </div>
          );
        })}
        {overflow > 0 && (
          <div
            className="v2-mono v2-mc"
            style={{
              fontSize: 9.5,
              color: "var(--color-t-2)",
              padding: "2px 6px",
            }}
          >
            {moreLabel(overflow)}
          </div>
        )}
      </div>
    </button>
  );
}

function DayDetail({
  selectedDate,
  today,
  events,
  longDate,
  shortDay,
  locale,
  t,
}: {
  selectedDate: Date | null;
  today: Date | null;
  events: CalendarEvent[];
  longDate: Intl.DateTimeFormat;
  shortDay: Intl.DateTimeFormat;
  locale: Locale;
  t: {
    dateLabel: string;
    categoryLabel: string;
    rangeLabel: string;
    sourceLabel: string;
    openLink: string;
    noEventsDay: string;
    selectDay: string;
    todayShort: string;
    daysMulti: (n: number) => string;
    endsToday: string;
    startsIn: (n: number) => string;
    happeningNow: string;
    untilLabel: string;
    category: (c: CalendarCategory) => string;
  };
}) {
  if (!selectedDate) {
    return (
      <div
        className="v2-sans"
        style={{
          padding: "32px 24px",
          border: "1px dashed var(--color-line-2)",
          color: "var(--color-t-2)",
          textAlign: "center",
        }}
      >
        {t.selectDay}
      </div>
    );
  }

  const isToday = today ? sameDay(selectedDate, today) : false;
  const dateLabel = longDate.format(selectedDate);
  const cap = `${dateLabel.charAt(0).toUpperCase()}${dateLabel.slice(1)}`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 0 }}>
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)" }}
        >
          {t.dateLabel}
        </div>
        <h2
          className="v2-serif"
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: "var(--color-t-0)",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {cap}
        </h2>
        {isToday && (
          <span
            className="v2-mono v2-mc"
            style={{
              padding: "4px 10px",
              background: "var(--color-bnb-dim)",
              border: "1px solid var(--color-bnb-line)",
              color: "var(--color-bnb)",
            }}
          >
            {t.todayShort}
          </span>
        )}
      </header>

      {events.length === 0 && (
        <div
          className="v2-sans"
          style={{
            padding: "24px",
            border: "1px solid var(--color-line-2)",
            color: "var(--color-t-2)",
          }}
        >
          {t.noEventsDay}
        </div>
      )}

      {events.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {events.map((ev, idx) => (
            <EventCard
              key={ev.id}
              event={ev}
              locale={locale}
              today={today}
              shortDay={shortDay}
              firstRow={idx === 0}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  locale,
  today,
  shortDay,
  firstRow,
  t,
}: {
  event: CalendarEvent;
  locale: Locale;
  today: Date | null;
  shortDay: Intl.DateTimeFormat;
  firstRow: boolean;
  t: {
    categoryLabel: string;
    rangeLabel: string;
    sourceLabel: string;
    openLink: string;
    daysMulti: (n: number) => string;
    endsToday: string;
    startsIn: (n: number) => string;
    happeningNow: string;
    untilLabel: string;
    category: (c: CalendarCategory) => string;
  };
}) {
  const style = CATEGORY_STYLE[event.category];
  const title = pickLocalized(event.title, locale);
  const summary = pickLocalized(event.summary, locale);
  const start = parseEventDate(event.date);
  const end = event.endDate ? parseEventDate(event.endDate) : null;
  const days = eventDurationDays(event);
  const isMulti = days > 1;

  // Relative chip based purely on event-vs-today (selected day doesn't
  // factor in — relevance is "what's happening or near"). Future events
  // only show a chip if within the next 7 days to avoid chip noise.
  let relChip: string | null = null;
  if (today) {
    if (eventCoversDate(event, today)) {
      if (end && sameDay(end, today)) relChip = t.endsToday;
      else relChip = t.happeningNow;
    } else if (sameDay(start, today)) {
      relChip = t.happeningNow;
    } else {
      const diff = Math.round((start.getTime() - today.getTime()) / 86_400_000);
      if (diff > 0 && diff <= 7) relChip = t.startsIn(diff);
    }
  }

  return (
    <article
      style={{
        borderTop: firstRow ? "1px solid var(--color-line-2)" : "none",
        borderBottom: "1px solid var(--color-line-2)",
        padding: "22px 0",
        display: "grid",
        gridTemplateColumns: "minmax(120px, 160px) 1fr",
        gap: 28,
      }}
    >
      {/* Left meta column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
          {t.categoryLabel}
        </div>
        <div
          className="v2-mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11.5,
            color: style.color,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              background: style.color,
              display: "inline-block",
              transform: "rotate(45deg)",
            }}
          />
          {t.category(event.category)}
        </div>

        {isMulti && end && (
          <>
            <div
              className="v2-mono v2-mc"
              style={{ color: "var(--color-t-3)", marginTop: 6 }}
            >
              {t.rangeLabel}
            </div>
            <div
              className="v2-mono v2-tnum"
              style={{ fontSize: 12, color: "var(--color-t-1)" }}
            >
              {shortDay.format(start)} → {shortDay.format(end)}
            </div>
            <div
              className="v2-mono"
              style={{ fontSize: 11, color: "var(--color-t-3)" }}
            >
              {t.daysMulti(days)}
            </div>
          </>
        )}

        {event.source && (
          <>
            <div
              className="v2-mono v2-mc"
              style={{ color: "var(--color-t-3)", marginTop: 6 }}
            >
              {t.sourceLabel}
            </div>
            <div
              className="v2-mono"
              style={{ fontSize: 11.5, color: "var(--color-t-2)" }}
            >
              {event.source}
            </div>
          </>
        )}
      </div>

      {/* Right content column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {relChip && (
          <span
            className="v2-mono v2-mc"
            style={{
              alignSelf: "flex-start",
              padding: "3px 8px",
              border: `1px solid ${style.border}`,
              background: style.bgSoft,
              color: style.color,
            }}
          >
            {relChip}
          </span>
        )}
        <h3
          className="v2-serif"
          style={{
            fontSize: 24,
            lineHeight: 1.18,
            letterSpacing: "-0.015em",
            color: "var(--color-t-0)",
            margin: 0,
            fontWeight: 500,
          }}
        >
          {title}
        </h3>
        <p
          className="v2-sans"
          style={{
            color: "var(--color-t-1)",
            fontSize: 14.5,
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 760,
          }}
        >
          {summary}
        </p>
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="v2-mono v2-mc v2-cta-ghost"
            style={{
              alignSelf: "flex-start",
              marginTop: 4,
              padding: "7px 12px",
              border: "1px solid var(--color-line-3)",
              color: "var(--color-t-1)",
              textDecoration: "none",
            }}
          >
            {t.openLink}
          </a>
        )}
      </div>
    </article>
  );
}

function MobileEventRow({
  event,
  locale,
  today,
  shortDay,
  firstRow,
  t,
}: {
  event: CalendarEvent;
  locale: Locale;
  today: Date | null;
  shortDay: Intl.DateTimeFormat;
  firstRow: boolean;
  t: {
    categoryLabel: string;
    rangeLabel: string;
    sourceLabel: string;
    openLink: string;
    daysMulti: (n: number) => string;
    endsToday: string;
    startsIn: (n: number) => string;
    happeningNow: string;
    untilLabel: string;
    category: (c: CalendarCategory) => string;
  };
}) {
  const style = CATEGORY_STYLE[event.category];
  const title = pickLocalized(event.title, locale);
  const summary = pickLocalized(event.summary, locale);
  const start = parseEventDate(event.date);
  const end = event.endDate ? parseEventDate(event.endDate) : null;
  const days = eventDurationDays(event);
  const isMulti = days > 1;

  let relChip: string | null = null;
  if (today) {
    if (eventCoversDate(event, today)) {
      if (end && sameDay(end, today)) relChip = t.endsToday;
      else relChip = t.happeningNow;
    } else if (sameDay(start, today)) {
      relChip = t.happeningNow;
    } else {
      const diff = Math.round((start.getTime() - today.getTime()) / 86_400_000);
      if (diff > 0 && diff <= 7) relChip = t.startsIn(diff);
    }
  }

  const dateLine = isMulti && end
    ? `${shortDay.format(start)} → ${shortDay.format(end)}`
    : shortDay.format(start);

  return (
    <article
      style={{
        borderTop: firstRow ? "1px solid var(--color-line-2)" : "none",
        borderBottom: "1px solid var(--color-line-2)",
        padding: "20px 0",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          className="v2-mono v2-tnum"
          style={{
            fontSize: 12,
            color: "var(--color-t-1)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {dateLine}
          {isMulti && (
            <span
              style={{
                marginLeft: 8,
                color: "var(--color-t-3)",
                letterSpacing: "0.08em",
              }}
            >
              · {t.daysMulti(days)}
            </span>
          )}
        </div>
        <span
          className="v2-mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 10.5,
            color: style.color,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              background: style.color,
              transform: "rotate(45deg)",
            }}
          />
          {t.category(event.category)}
        </span>
      </div>

      {relChip && (
        <span
          className="v2-mono v2-mc"
          style={{
            alignSelf: "flex-start",
            padding: "3px 8px",
            border: `1px solid ${style.border}`,
            background: style.bgSoft,
            color: style.color,
          }}
        >
          {relChip}
        </span>
      )}

      <h3
        className="v2-serif"
        style={{
          fontSize: 22,
          lineHeight: 1.18,
          letterSpacing: "-0.015em",
          color: "var(--color-t-0)",
          margin: 0,
          fontWeight: 500,
        }}
      >
        {title}
      </h3>

      <p
        className="v2-sans"
        style={{
          color: "var(--color-t-1)",
          fontSize: 14.5,
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {summary}
      </p>

      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: 4,
        }}
      >
        {event.source && (
          <span
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)" }}
          >
            {t.sourceLabel} · {event.source}
          </span>
        )}
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="v2-mono v2-mc v2-cta-ghost"
            style={{
              padding: "6px 10px",
              border: "1px solid var(--color-line-3)",
              color: "var(--color-t-1)",
              textDecoration: "none",
            }}
          >
            {t.openLink}
          </a>
        )}
      </div>
    </article>
  );
}

// ============================================================
// Inline style constants
// ============================================================
const navArrowStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "1px solid var(--color-line-3)",
  color: "var(--color-t-1)",
  cursor: "pointer",
  fontSize: 16,
  letterSpacing: 0,
};

const todayBtnStyle: React.CSSProperties = {
  marginLeft: 6,
  padding: "9px 14px",
  background: "transparent",
  border: "1px solid var(--color-bnb-line)",
  color: "var(--color-bnb)",
  cursor: "pointer",
};
