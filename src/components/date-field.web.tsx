import { useRef } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

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
			<ThemedView
				style={[
					styles.inputWrapper,
					{
						backgroundColor: theme.backgroundElement,
						borderColor: theme.backgroundSelected,
					},
				]}
			>
				{/*
				 * The native <input type="date"> is rendered fully invisible (opacity 0) and
				 * stretched over the wrapper purely for interaction — click, focus, keyboard,
				 * and the calendar popup. All visible text comes from the overlay below, so the
				 * browser's own edit fields and their locale placeholder (e.g. "dd.mm.åååå")
				 * are never painted at all rather than just hidden with a transparent color.
				 */}
				<input
					ref={inputRef}
					type="date"
					value={value}
					min={minDate ? minDate.toISOString().split("T")[0] : undefined}
					max={maxDate ? maxDate.toISOString().split("T")[0] : undefined}
					onChange={(e) => onChange(e.target.value)}
					onClick={openPicker}
					onFocus={openPicker}
					aria-label={placeholder}
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						margin: 0,
						padding: 0,
						border: 0,
						opacity: 0,
						cursor: "pointer",
						colorScheme: scheme === "dark" ? "dark" : "light",
					}}
				/>
				<Text
					style={[
						styles.displayText,
						{ color: value ? theme.text : theme.textSecondary },
					]}
					pointerEvents="none"
				>
					{value ? formatDisplay(value) : placeholder}
				</Text>
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
		borderWidth: 1,
		borderRadius: Spacing.two,
		paddingVertical: Spacing.two,
		paddingHorizontal: Spacing.three,
		minHeight: 42,
	},
	displayText: {
		fontSize: 16,
		fontWeight: "400",
	},
});
