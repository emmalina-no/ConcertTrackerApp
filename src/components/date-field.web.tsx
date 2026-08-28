import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";

export function DateField({
	value,
	onChange,
	clearable,
	minDate,
	maxDate,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	clearable?: boolean;
	minDate?: Date;
	maxDate?: Date;
}) {
	const theme = useTheme();
	const scheme = useColorScheme();

	return (
		<ThemedView style={styles.row}>
			<input
				type="date"
				value={value}
				lang="no-NB"
				min={minDate ? minDate.toISOString().split("T")[0] : undefined}
				max={maxDate ? maxDate.toISOString().split("T")[0] : undefined}
				onChange={(e) => onChange(e.target.value)}
				style={{
					colorScheme: scheme === "dark" ? "dark" : "light",
					color: theme.text,
					backgroundColor: theme.backgroundElement,
					border: `1px solid ${theme.backgroundSelected}`,
					borderRadius: Spacing.two,
					padding: `${Spacing.two}px ${Spacing.three}px`,
					fontSize: 16,
					fontFamily: "var(--font-display)",
					flex: 1,
				}}
			/>
			{clearable && value.length > 0 && (
				<Pressable onPress={() => onChange("")}>
					<ThemedText type="link">Clear</ThemedText>
				</Pressable>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
	},
});
