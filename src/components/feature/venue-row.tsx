import { Link } from "expo-router";
import { Pressable } from "react-native";

import { Card } from "@/components/ui/card";
import { ThemedText } from "@/components/ui/themed-text";
import { useTheme } from "@/hooks/use-theme";
import type { Venue } from "@/lib/types";

export function VenueRow({ venue }: { venue: Venue }) {
  const theme = useTheme();
  return (
    <Link href={{ pathname: "/venue/[id]", params: { id: venue.id } }} asChild>
      <Pressable>
        <Card>
          <ThemedText type="default" style={{ color: theme.accentAlt }}>
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
        </Card>
      </Pressable>
    </Link>
  );
}
