import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { ThemedText } from "@/components/ui/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Artist } from "@/lib/types";

export function ArtistRow({ artist }: { artist: Artist }) {
  const theme = useTheme();
  return (
    <Link href={{ pathname: "/artist/[id]", params: { id: artist.id } }} asChild>
      <Pressable>
        <Card>
          <ThemedText type="default" style={{ color: theme.accentWarm }}>
            {artist.name}
          </ThemedText>
          {artist.timesSeen != null && (
            <ThemedText type="small" themeColor="textSecondary">
              Times seen: {artist.timesSeen}
            </ThemedText>
          )}
          {artist.averageRating != null && (
            <View style={styles.ratingRow}>
              <StarRating value={Math.round(artist.averageRating)} size={14} />
              <ThemedText type="small" themeColor="textSecondary">
                {artist.averageRating.toFixed(1)} ({artist.ratedCount ?? 0})
              </ThemedText>
            </View>
          )}
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.half,
  },
});
