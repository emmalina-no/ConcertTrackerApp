import { useRef } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";

function formatDisplay(value: string): string {
	if (!value) return "";
	const [year, month, day] = value.split("-");
	return `${day}/${month}/${year}`;
}

export function DateField({
	value,
	onChange,
	placeholder = "dd/mm/yyyy",
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
	const inputRef = useRef<HTMLInputElement>(null);

	function openPicker() {
		try {
			inputRef.current?.showPicker?.();
		} catch {
			// showPicker isn't supported in every browser (e.g. Safari) — clicking still focuses the input.
		}
	}

	return (
		<ThemedView style={styles.row}>
			<ThemedView style={styles.inputWrapper}>
				<input
					ref={inputRef}
					type="date"
					value={value}
					min={minDate ? minDate.toISOString().split("T")[0] : undefined}
					max={maxDate ? maxDate.toISOString().split("T")[0] : undefined}
					onChange={(e) => onChange(e.target.value)}
					onClick={openPicker}
					onFocus={openPicker}
					style={{
						colorScheme: scheme === "dark" ? "dark" : "light",
						color: "transparent",
						backgroundColor: theme.backgroundElement,
						border: `1px solid ${theme.backgroundSelected}`,
						borderRadius: Spacing.two,
						padding: `${Spacing.two}px ${Spacing.three}px`,
						fontSize: 16,
						fontFamily: "var(--font-display)",
						width: "100%",
						boxSizing: "border-box",
					}}
				/>
				<ThemedText
					themeColor={value ? "text" : "textSecondary"}
					style={styles.displayText}
					pointerEvents="none"
				>
					{value ? formatDisplay(value) : placeholder}
				</ThemedText>
			</ThemedView>
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
	inputWrapper: {
		flex: 1,
		position: "relative",
		justifyContent: "center",
	},
	displayText: {
		position: "absolute",
		left: Spacing.three,
		fontSize: 16,
	},
});
