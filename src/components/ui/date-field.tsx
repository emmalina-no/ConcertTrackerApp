import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { isoToDisplay, parseISO, toISO } from "@/lib/dates";

export function DateField({
	value,
	onChange,
	placeholder = "Select date",
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
	const [showPicker, setShowPicker] = useState(false);

	function handleChange(_event: unknown, selectedDate: Date) {
		setShowPicker(false);
		onChange(toISO(selectedDate));
	}

	return (
		<ThemedView style={styles.row}>
			<Pressable
				onPress={() => setShowPicker(true)}
				style={[
					styles.button,
					{
						backgroundColor: theme.backgroundElement,
						borderColor: theme.backgroundSelected,
					},
				]}
			>
				<Text
					style={[
						styles.displayText,
						{ color: value ? theme.text : theme.textSecondary },
					]}
				>
					{value ? isoToDisplay(value) : placeholder}
				</Text>
			</Pressable>
			{clearable && value.length > 0 && (
				<Pressable onPress={() => onChange("")}>
					<ThemedText type="link">Clear</ThemedText>
				</Pressable>
			)}
			{showPicker && (
				<DateTimePicker
					value={parseISO(value)}
					mode="date"
					display="default"
					onValueChange={handleChange}
					onDismiss={() => setShowPicker(false)}
					minimumDate={minDate}
					maximumDate={maxDate}
				/>
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
	button: {
		flex: 1,
		borderWidth: 1,
		borderRadius: Spacing.two,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
	},
	displayText: {
		fontSize: 16,
		fontWeight: "400",
	},
});
