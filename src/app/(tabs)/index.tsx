import { Link } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventListItem } from "@/components/event-list-item";
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

	const emptyText =
		view === "upcoming"
			? "No upcoming concerts yet."
			: "No past concerts logged yet.";

	return (
		<ThemedView style={styles.container}>
			<SafeAreaView style={styles.safeArea} edges={["bottom"]}>
				<ThemedView style={styles.toggleRow}>
					<Pressable
						onPress={() => setView("past")}
						style={[
							styles.toggleButton,
							{ backgroundColor: theme.backgroundElement },
							view === "past" && styles.toggleButtonActive,
						]}
					>
						<ThemedText
							type="smallBold"
							style={view === "past" && styles.toggleTextActive}
						>
							Seen
						</ThemedText>
					</Pressable>
					<Pressable
						onPress={() => setView("upcoming")}
						style={[
							styles.toggleButton,
							{ backgroundColor: theme.backgroundElement },
							view === "upcoming" && styles.toggleButtonActive,
						]}
					>
						<ThemedText
							type="smallBold"
							style={view === "upcoming" && styles.toggleTextActive}
						>
							Upcoming
						</ThemedText>
					</Pressable>
				</ThemedView>

				{loading ? (
					<ActivityIndicator style={styles.loading} />
				) : error ? (
					<ThemedText type="default" style={styles.centerText}>
						{error}
					</ThemedText>
				) : (
					<FlatList
						data={events}
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
					<Pressable style={styles.fab}>
						<ThemedText style={styles.fabText}>+</ThemedText>
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
		paddingVertical: Spacing.two,
		alignItems: "center",
	},
	toggleButtonActive: {
		backgroundColor: "#3c87f7",
	},
	toggleTextActive: {
		color: "#fff",
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
		backgroundColor: "#3c87f7",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		elevation: 4,
	},
	fabText: {
		color: "#fff",
		fontSize: 28,
		lineHeight: 32,
	},
});
