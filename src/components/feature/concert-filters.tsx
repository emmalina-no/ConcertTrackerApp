import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Chip } from "@/components/ui/chip";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ConcertEvent } from "@/lib/types";

export type ConcertFilters = {
	year: number | null;
	month: number | null;
	country: string | null;
	city: string | null;
};

export const EMPTY_FILTERS: ConcertFilters = {
	year: null,
	month: null,
	country: null,
	city: null,
};

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
	new Intl.DateTimeFormat("en", { month: "short" }).format(
		new Date(2000, i, 1),
	),
);

function useFilterOptions(events: ConcertEvent[]) {
	return useMemo(() => {
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
	}, [events]);
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

	function toggle<K extends keyof ConcertFilters>(
		key: K,
		value: ConcertFilters[K],
	) {
		onChange({ ...filters, [key]: filters[key] === value ? null : value });
	}

	if (options.years.length === 0) return null;

	const activeCount = Object.values(filters).filter((v) => v !== null).length;

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
								selected={filters.year === y}
								onPress={() => toggle("year", y)}
							/>
						))}
					</ChipRow>
					<ChipRow label="Month">
						{options.months.map((m) => (
							<Chip
								key={m}
								label={MONTH_NAMES[m - 1]}
								selected={filters.month === m}
								onPress={() => toggle("month", m)}
							/>
						))}
					</ChipRow>
					<ChipRow label="Country">
						{options.countries.map((c) => (
							<Chip
								key={c}
								label={c}
								selected={filters.country === c}
								onPress={() => toggle("country", c)}
							/>
						))}
					</ChipRow>
					<ChipRow label="City">
						{options.cities.map((c) => (
							<Chip
								key={c}
								label={c}
								selected={filters.city === c}
								onPress={() => toggle("city", c)}
							/>
						))}
					</ChipRow>
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
	if (filters.year !== null && date.getFullYear() !== filters.year)
		return false;
	if (filters.month !== null && date.getMonth() + 1 !== filters.month)
		return false;
	if (filters.country !== null && event.venue.country !== filters.country)
		return false;
	if (filters.city !== null && event.venue.city !== filters.city) return false;
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
});
