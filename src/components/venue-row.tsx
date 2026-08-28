import { Link } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Venue } from "@/lib/types";

export function VenueRow({ venue }: { venue: Venue }) {
	const theme = useTheme();
	return (
		<Link href={{ pathname: "/venue/[id]", params: { id: venue.id } }} asChild>
			<Pressable>
				<ThemedView
					type="backgroundElement"
					style={[styles.row, { borderColor: theme.accentAlt }]}
				>
					<ThemedText type="default" style={{ color: theme.accentWarm }}>
						{venue.name}
					</ThemedText>
					<ThemedText type="small" themeColor="textSecondary">
						{venue.city}, {venue.country}
					</ThemedText>
					{venue.timesBeen != null && (
						<ThemedText type="small" themeColor="textSecondary">
							Times been: {venue.timesBeen}
						</ThemedText>
					)}
				</ThemedView>
			</Pressable>
		</Link>
	);
}

const styles = StyleSheet.create({
	row: {
		borderRadius: Spacing.two,
		borderWidth: 2,
		padding: Spacing.three,
		gap: Spacing.half,
	},
});
