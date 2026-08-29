import { Link } from "expo-router";
import { Pressable } from "react-native";

import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { ThemedText } from "@/components/ui/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { formatDateRange } from "@/lib/dates";
import type { ConcertEvent } from "@/lib/types";

export function EventListItem({
  event,
  rating,
}: {
  event: ConcertEvent;
  rating?: number | null;
}) {
  const theme = useTheme();
  const artistNames = event.event_artists.map((ea) => ea.artist.name).join(", ");

  return (
    <Link href={{ pathname: "/event/[id]", params: { id: event.id } }} asChild>
      <Pressable>
        <Card borderColor="accentAlt">
          <ThemedText type="smallBold">
            {formatDateRange(event.start_date, event.end_date)}
          </ThemedText>
          <ThemedText type="heading" style={{ color: theme.accent }}>
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
        </Card>
      </Pressable>
    </Link>
  );
}
