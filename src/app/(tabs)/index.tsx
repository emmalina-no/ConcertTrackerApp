import { Link } from "expo-router";
import { useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	ConcertFiltersPanel,
	EMPTY_FILTERS,
	matchesConcertFilters,
	type ConcertFilters,
} from "@/components/concert-filters";
import { EventListItem } from "@/components/event-list-item";
import { SearchBar } from "@/components/search-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useEventList } from "@/hooks/use-event-list";
import { useTheme } from "@/hooks/use-theme";

type View = "upcoming" | "past";

export default function ConcertsScreen() {
	const theme = useTheme();
	const [view, setView] = useState<View>("upcoming");
	const { events, loading, error } = useEventList(view);
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState<ConcertFilters>(EMPTY_FILTERS);

	function selectView(next: View) {
		setView(next);
		setSearch("");
		setFilters(EMPTY_FILTERS);
	}

	const filteredEvents = useMemo(() => {
		const q = search.trim().toLowerCase();
		return events.filter((event) => {
			if (!matchesConcertFilters(event, filters)) return false;
			if (q.length === 0) return true;
			const artistNames = event.event_artists.map((ea) =>
				ea.artist.name.toLowerCase(),
			);
			return (
				event.name.toLowerCase().includes(q) ||
				event.venue.name.toLowerCase().includes(q) ||
				artistNames.some((n) => n.includes(q))
			);
		});
	}, [events, filters, search]);

	const emptyText =
		events.length === 0
			? view === "upcoming"
				? "No upcoming concerts yet."
				: "No past concerts logged yet."
			: "No concerts match your search or filters.";

	return (
		<ThemedView style={styles.container}>
			<SafeAreaView style={styles.safeArea} edges={["bottom"]}>
				<ThemedView style={styles.toggleRow}>
					<Pressable
						onPress={() => selectView("past")}
						style={[
							styles.toggleButton,
							{
								backgroundColor: theme.backgroundElement,
								borderColor: theme.backgroundSelected,
							},
							view === "past" && {
								backgroundColor: theme.accent,
								borderColor: theme.accent,
							},
						]}
					>
						<ThemedText
							type="smallBold"
							style={
								view === "past"
									? { color: theme.onAccent }
									: { color: theme.textSecondary }
							}
						>
							Seen
						</ThemedText>
					</Pressable>
					<Pressable
						onPress={() => selectView("upcoming")}
						style={[
							styles.toggleButton,
							{
								backgroundColor: theme.backgroundElement,
								borderColor: theme.backgroundSelected,
							},
							view === "upcoming" && {
								backgroundColor: theme.accent,
								borderColor: theme.accent,
							},
						]}
					>
						<ThemedText
							type="smallBold"
							style={
								view === "upcoming"
									? { color: theme.onAccent }
									: { color: theme.textSecondary }
							}
						>
							Upcoming
						</ThemedText>
					</Pressable>
				</ThemedView>

				<ThemedView style={styles.searchRow}>
					<SearchBar
						value={search}
						onChangeText={setSearch}
						placeholder="Search concerts, artists, venues"
					/>
				</ThemedView>

				<ConcertFiltersPanel
					events={events}
					filters={filters}
					onChange={setFilters}
				/>

				{loading ? (
					<ActivityIndicator style={styles.loading} />
				) : error ? (
					<ThemedText type="default" style={styles.centerText}>
						{error}
					</ThemedText>
				) : (
					<FlatList
						data={filteredEvents}
						keyExtractor={(item) => item.id}
						contentContainerStyle={styles.listContent}
						renderItem={({ item }) => <EventListItem event={item} />}
						ListEmptyComponent={
							<ThemedText
								type="default"
								themeColor="textSecondary"
								style={styles.centerText}
							>
								{emptyText}
							</ThemedText>
						}
					/>
				)}

				<Link href="/event/new" asChild>
					<Pressable
						style={StyleSheet.flatten([
							styles.fab,
							{
								backgroundColor: theme.accentAlt,
								borderColor: theme.accentWarm,
							},
						])}
					>
						<ThemedText
							style={StyleSheet.flatten([
								styles.fabText,
								{ color: theme.onAccent },
							])}
						>
							+
						</ThemedText>
					</Pressable>
				</Link>
			</SafeAreaView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
		width: "100%",
		maxWidth: MaxContentWidth,
		alignSelf: "center",
	},
	loading: {
		marginTop: Spacing.five,
	},
	toggleRow: {
		flexDirection: "row",
		gap: Spacing.two,
		padding: Spacing.three,
	},
	toggleButton: {
		flex: 1,
		borderRadius: Spacing.two,
		borderWidth: 2,
		paddingVertical: Spacing.two,
		alignItems: "center",
	},
	searchRow: {
		paddingHorizontal: Spacing.three,
		paddingBottom: Spacing.two,
	},
	centerText: {
		textAlign: "center",
		marginTop: Spacing.five,
		paddingHorizontal: Spacing.four,
	},
	listContent: {
		padding: Spacing.three,
		paddingTop: 0,
		gap: Spacing.two,
	},
	fab: {
		position: "absolute",
		right: Spacing.three,
		bottom: Spacing.three,
		width: 56,
		height: 56,
		borderRadius: 28,
		borderWidth: 2,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		elevation: 4,
	},
	fabText: {
		fontSize: 28,
		lineHeight: 32,
	},
});
