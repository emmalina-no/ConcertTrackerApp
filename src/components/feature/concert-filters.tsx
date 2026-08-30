import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Chip } from "@/components/ui/chip";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ConcertEvent } from "@/lib/types";

/**
 * Each field holds the selected values for that category. Within a category the
 * values are OR-ed; across categories they are AND-ed. An empty array means the
 * category is not constraining the results. So `{ years: [2022, 2023], months:
 * [5, 6] }` matches concerts in (2022 or 2023) and (May or June).
 */
export type ConcertFilters = {
  years: number[];
  months: number[];
  countries: string[];
  cities: string[];
};

export const EMPTY_FILTERS: ConcertFilters = {
  years: [],
  months: [],
  countries: [],
  cities: [],
};

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat("en", { month: "short" }).format(
    new Date(2000, i, 1),
  ),
);

function toggleValue<T extends number | string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function collectFilterOptions(events: ConcertEvent[]) {
  const years = new Set<number>();
  const months = new Set<number>();
  const countries = new Set<string>();
  const cities = new Set<string>();
  for (const event of events) {
    const date = new Date(event.start_date);
    years.add(date.getFullYear());
    months.add(date.getMonth() + 1);
    countries.add(event.venue.country);
    cities.add(event.venue.city);
  }
  return {
    years: Array.from(years).sort((a, b) => b - a),
    months: Array.from(months).sort((a, b) => a - b),
    countries: Array.from(countries).sort(),
    cities: Array.from(cities).sort(),
  };
}

function useFilterOptions(events: ConcertEvent[]) {
  return useMemo(() => collectFilterOptions(events), [events]);
}

/**
 * Drops any filter value that no longer appears in the given events (e.g. a
 * saved city filter for a concert that was since edited or deleted), so a stale
 * filter can't silently hide the whole list with no visible chip to clear it.
 */
export function pruneConcertFilters(
  filters: ConcertFilters,
  events: ConcertEvent[],
): ConcertFilters {
  const { years, months, countries, cities } = collectFilterOptions(events);
  return {
    years: filters.years.filter((v) => years.includes(v)),
    months: filters.months.filter((v) => months.includes(v)),
    countries: filters.countries.filter((v) => countries.includes(v)),
    cities: filters.cities.filter((v) => cities.includes(v)),
  };
}

export function countActiveFilters(filters: ConcertFilters): number {
  return (
    filters.years.length +
    filters.months.length +
    filters.countries.length +
    filters.cities.length
  );
}

function ChipRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.chipRow}>
      <ThemedText type="smallBold" style={styles.chipRowLabel}>
        {label}
      </ThemedText>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );
}

export function ConcertFiltersPanel({
  events,
  filters,
  onChange,
}: {
  events: ConcertEvent[];
  filters: ConcertFilters;
  onChange: (filters: ConcertFilters) => void;
}) {
  const options = useFilterOptions(events);
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  if (options.years.length === 0) return null;

  const activeCount = countActiveFilters(filters);

  return (
    <ThemedView style={styles.panel}>
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        style={[
          styles.summaryRow,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.accentWarm,
          },
        ]}
      >
        <View style={styles.summaryLabel}>
          <ThemedText type="smallBold">Filters</ThemedText>
          {activeCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.accentWarm }]}>
              <ThemedText type="small" style={{ color: theme.onAccent }}>
                {activeCount}
              </ThemedText>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={theme.accentWarm}
        />
      </Pressable>

      {expanded && (
        <ThemedView style={styles.chipRows}>
          <ChipRow label="Year">
            {options.years.map((y) => (
              <Chip
                key={y}
                label={String(y)}
                selected={filters.years.includes(y)}
                onPress={() =>
                  onChange({ ...filters, years: toggleValue(filters.years, y) })
                }
              />
            ))}
          </ChipRow>
          <ChipRow label="Month">
            {options.months.map((m) => (
              <Chip
                key={m}
                label={MONTH_NAMES[m - 1]}
                selected={filters.months.includes(m)}
                onPress={() =>
                  onChange({
                    ...filters,
                    months: toggleValue(filters.months, m),
                  })
                }
              />
            ))}
          </ChipRow>
          <ChipRow label="Country">
            {options.countries.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={filters.countries.includes(c)}
                onPress={() =>
                  onChange({
                    ...filters,
                    countries: toggleValue(filters.countries, c),
                  })
                }
              />
            ))}
          </ChipRow>
          <ChipRow label="City">
            {options.cities.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={filters.cities.includes(c)}
                onPress={() =>
                  onChange({
                    ...filters,
                    cities: toggleValue(filters.cities, c),
                  })
                }
              />
            ))}
          </ChipRow>

          {activeCount > 0 && (
            <Pressable
              onPress={() => onChange(EMPTY_FILTERS)}
              style={styles.clearAll}
              hitSlop={Spacing.two}
            >
              <ThemedText type="smallBold" style={{ color: theme.accentWarm }}>
                Clear filters
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
}

export function matchesConcertFilters(
  event: ConcertEvent,
  filters: ConcertFilters,
): boolean {
  const date = new Date(event.start_date);
  if (filters.years.length > 0 && !filters.years.includes(date.getFullYear()))
    return false;
  if (
    filters.months.length > 0 &&
    !filters.months.includes(date.getMonth() + 1)
  )
    return false;
  if (
    filters.countries.length > 0 &&
    !filters.countries.includes(event.venue.country)
  )
    return false;
  if (filters.cities.length > 0 && !filters.cities.includes(event.venue.city))
    return false;
  return true;
}

const styles = StyleSheet.create({
  panel: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Spacing.two,
    borderWidth: 2,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  summaryLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: Spacing.one,
    alignItems: "center",
    justifyContent: "center",
  },
  chipRows: {
    gap: Spacing.two,
  },
  chipRow: {
    gap: Spacing.one,
  },
  chipRowLabel: {
    marginBottom: Spacing.half,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  clearAll: {
    alignSelf: "flex-end",
    paddingVertical: Spacing.one,
  },
});
