import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import type { Venue } from "@/lib/types";

export type VenueValue = { name: string; city: string; country: string };

export function VenuePicker({
	value,
	onChange,
	venues,
}: {
	value: VenueValue;
	onChange: (value: VenueValue) => void;
	venues: Venue[];
}) {
	const [mode, setMode] = useState<"selected" | "search" | "create">(
		value.name ? "selected" : "search",
	);
	const [query, setQuery] = useState("");

	function selectVenue(venue: Venue) {
		onChange({ name: venue.name, city: venue.city, country: venue.country });
		setMode("selected");
	}

	function startCreate() {
		onChange({ name: query, city: "", country: "" });
		setMode("create");
	}

	function changeVenue() {
		setQuery("");
		setMode("search");
	}

	if (mode === "selected") {
		return (
			<ThemedView type="backgroundElement" style={styles.selectedCard}>
				<ThemedView type="backgroundElement" style={styles.selectedInfo}>
					<ThemedText type="default">{value.name}</ThemedText>
					<ThemedText type="small" themeColor="textSecondary">
						{value.city}, {value.country}
					</ThemedText>
				</ThemedView>
				<Pressable onPress={changeVenue}>
					<ThemedText type="linkPrimary">Change</ThemedText>
				</Pressable>
			</ThemedView>
		);
	}

	if (mode === "create") {
		return (
			<ThemedView style={styles.createContainer}>
				<ThemedTextInput
					value={value.name}
					onChangeText={(name) => onChange({ ...value, name })}
					placeholder="Venue name"
				/>
				<ThemedTextInput
					value={value.city}
					onChangeText={(city) => onChange({ ...value, city })}
					placeholder="City"
				/>
				<ThemedTextInput
					value={value.country}
					onChangeText={(country) => onChange({ ...value, country })}
					placeholder="Country"
				/>
				<Pressable onPress={changeVenue}>
					<ThemedText type="link">Back to search</ThemedText>
				</Pressable>
			</ThemedView>
		);
	}

	const matches =
		query.trim().length > 0
			? venues
					.filter((v) =>
						v.name.toLowerCase().includes(query.trim().toLowerCase()),
					)
					.slice(0, 6)
			: [];

	return (
		<ThemedView style={styles.searchContainer}>
			<ThemedTextInput
				value={query}
				onChangeText={setQuery}
				placeholder="Search venues..."
			/>
			{matches.length > 0 && (
				<ThemedView type="backgroundElement" style={styles.suggestions}>
					{matches.map((venue) => (
						<Pressable
							key={venue.id}
							onPress={() => selectVenue(venue)}
							style={styles.suggestionRow}
						>
							<ThemedText type="default">{venue.name}</ThemedText>
							<ThemedText type="small" themeColor="textSecondary">
								{venue.city}, {venue.country}
							</ThemedText>
						</Pressable>
					))}
				</ThemedView>
			)}
			{query.trim().length > 0 && (
				<Pressable onPress={startCreate}>
					<ThemedText type="linkPrimary">
						+ Create new venue &quot;{query.trim()}&quot;
					</ThemedText>
				</Pressable>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	selectedCard: {
		borderRadius: Spacing.two,
		padding: Spacing.three,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: Spacing.two,
	},
	selectedInfo: {
		gap: Spacing.half,
	},
	createContainer: {
		gap: Spacing.two,
	},
	searchContainer: {
		gap: Spacing.two,
	},
	suggestions: {
		borderRadius: Spacing.two,
		overflow: "hidden",
	},
	suggestionRow: {
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
		gap: Spacing.half,
	},
});
