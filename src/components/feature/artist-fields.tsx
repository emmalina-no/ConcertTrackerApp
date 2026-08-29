import { StyleSheet } from "react-native";

import { ArtistPicker } from "@/components/feature/artist-picker";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { FormField } from "@/components/ui/form-field";
import { StarRating } from "@/components/ui/star-rating";
import { ThemedView } from "@/components/ui/themed-view";
import { BorderWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Artist, EventFormValues } from "@/lib/types";

type ArtistValue = EventFormValues["artists"][number];

export function ArtistFields({
  artist,
  artists,
  multiDay,
  minDate,
  maxDate,
  onChange,
  onRemove,
}: {
  artist: ArtistValue;
  artists: Artist[];
  multiDay: boolean;
  minDate?: Date;
  maxDate?: Date;
  onChange: (patch: Partial<ArtistValue>) => void;
  onRemove: () => void;
}) {
  const theme = useTheme();

  return (
    <ThemedView style={[styles.row, { borderColor: theme.backgroundSelected }]}>
      <ArtistPicker
        artists={artists}
        value={artist.name}
        onChange={(name) => onChange({ name })}
      />
      {multiDay && (
        <DateField
          value={artist.playedDate}
          onChange={(playedDate) => onChange({ playedDate })}
          placeholder="Played date"
          minDate={minDate}
          maxDate={maxDate}
        />
      )}
      <FormField label="Rating">
        <StarRating
          value={artist.rating}
          onChange={(rating) => onChange({ rating })}
        />
      </FormField>
      <Button
        icon="trash-outline"
        variant="destructive"
        size="sm"
        onPress={onRemove}
        accessibilityLabel="Remove artist"
        noBorder
        style={styles.removeButton}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: BorderWidth.hairline,
    padding: Spacing.half,
    gap: Spacing.one,
  },
  removeButton: {
    alignSelf: "flex-end",
  },
});
