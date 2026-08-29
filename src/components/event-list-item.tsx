import { Link } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { StarRating } from "@/components/star-rating";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ConcertEvent } from "@/lib/types";

function formatDate(date: string) {
	const [y, m, d] = date.split("-");
	return `${d}/${m}/${y}`;
}

function formatDateRange(startDate: string, endDate: string) {
	if (startDate === endDate) return formatDate(startDate);
	return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export function EventListItem({
	event,
	rating,
}: {
	event: ConcertEvent;
	rating?: number | null;
}) {
	const theme = useTheme();
	const artistNames = event.event_artists
		.map((ea) => ea.artist.name)
		.join(", ");

	return (
		<Link href={{ pathname: "/event/[id]", params: { id: event.id } }} asChild>
			<Pressable>
				<ThemedView
					type="backgroundElement"
					style={[styles.card, { borderColor: theme.accentAlt }]}
				>
					<ThemedText type="smallBold">
						{formatDateRange(event.start_date, event.end_date)}
					</ThemedText>
					<ThemedText
						type="subtitle"
						style={[styles.name, { color: theme.accent }]}
					>
						{event.name}
					</ThemedText>
					<ThemedText type="default" themeColor="textSecondary">
						{event.venue.name}, {event.venue.city}, {event.venue.country}
					</ThemedText>
					{artistNames.length > 0 && (
						<ThemedText
							type="small"
							style={{ color: theme.accentWarm }}
							numberOfLines={2}
						>
							{artistNames}
						</ThemedText>
					)}
					{rating != null && <StarRating value={rating} size={14} />}
				</ThemedView>
			</Pressable>
		</Link>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: Spacing.three,
		borderWidth: 2,
		padding: Spacing.three,
		gap: Spacing.half,
	},
	name: {
		fontSize: 20,
		lineHeight: 26,
	},
});
