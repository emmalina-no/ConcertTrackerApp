import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { Card } from "@/components/ui/card";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedTextInput } from "@/components/ui/themed-text-input";
import { ThemedView } from "@/components/ui/themed-view";
import { Spacing } from "@/constants/theme";
import type { Artist } from "@/lib/types";

export function ArtistPicker({
  value,
  onChange,
  artists,
}: {
  value: string;
  onChange: (name: string) => void;
  artists: Artist[];
}) {
  const [mode, setMode] = useState<"selected" | "search">(
    value ? "selected" : "search",
  );
  const [query, setQuery] = useState("");

  function selectArtist(artist: Artist) {
    onChange(artist.name);
    setMode("selected");
  }

  function createNew() {
    onChange(query.trim());
    setMode("selected");
  }

  function changeArtist() {
    setQuery("");
    setMode("search");
  }

  if (mode === "selected") {
    return (
      <Card borderColor="backgroundSelected" style={styles.selectedCard}>
        <ThemedText type="default" style={styles.selectedName}>
          {value}
        </ThemedText>
        <Pressable onPress={changeArtist}>
          <ThemedText type="linkPrimary">Change</ThemedText>
        </Pressable>
      </Card>
    );
  }

  const matches =
    query.trim().length > 0
      ? artists
          .filter((a) =>
            a.name.toLowerCase().includes(query.trim().toLowerCase()),
          )
          .slice(0, 6)
      : [];

  return (
    <ThemedView style={styles.searchContainer}>
      <ThemedTextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search artists..."
      />
      {matches.length > 0 && (
        <ThemedView type="backgroundElement" style={styles.suggestions}>
          {matches.map((artist) => (
            <Pressable
              key={artist.id}
              onPress={() => selectArtist(artist)}
              style={styles.suggestionRow}
            >
              <ThemedText type="default">{artist.name}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      )}
      {query.trim().length > 0 && (
        <Pressable onPress={createNew}>
          <ThemedText type="linkPrimary">
            + Create new artist &quot;{query.trim()}&quot;
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  selectedCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.two,
  },
  selectedName: {
    flex: 1,
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
  },
});
