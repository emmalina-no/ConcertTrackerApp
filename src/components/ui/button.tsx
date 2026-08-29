import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	type StyleProp,
	type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type ButtonVariant = "primary" | "secondary" | "destructive";
export type ButtonSize = "md" | "sm";

/** Which theme color the label + icon use for each variant. */
const CONTENT_COLOR: Record<ButtonVariant, ThemeColor> = {
	primary: "onAccent",
	secondary: "accent",
	destructive: "textDestructive",
};

const SIZES = {
	md: {
		paddingVertical: Spacing.two + 2,
		paddingHorizontal: Spacing.three,
		gap: Spacing.two,
		minHeight: 44,
		iconSize: 18,
		textType: "default" as const,
	},
	sm: {
		paddingVertical: Spacing.one,
		paddingHorizontal: Spacing.two + 4,
		gap: Spacing.one,
		minHeight: 32,
		iconSize: 16,
		textType: "small" as const,
	},
};

export function Button({
	label,
	icon,
	iconPosition = "left",
	onPress,
	variant = "primary",
	size = "md",
	disabled = false,
	loading = false,
	noBorder = false,
	style,
	accessibilityLabel,
	accessibilityHint,
}: {
	/** Text to show. Optional — omit for an icon-only button. */
	label?: string;
	/** Ionicons glyph name. Optional — omit for a text-only button. */
	icon?: IconName;
	/** Which side of the label the icon sits on. Ignored when there's no label. */
	iconPosition?: "left" | "right";
	onPress: () => void;
	variant?: ButtonVariant;
	size?: ButtonSize;
	/** Greys the button out and blocks presses, whatever the variant. */
	disabled?: boolean;
	/** Swaps the content for a spinner and blocks presses (implies disabled). */
	loading?: boolean;
	/** Drops the border, keeping the variant's background and content colors. */
	noBorder?: boolean;
	/** Extra container styling — layout/positioning only (margins, alignSelf, width). */
	style?: StyleProp<ViewStyle>;
	/** Required for icon-only buttons; defaults to `label` otherwise. */
	accessibilityLabel?: string;
	accessibilityHint?: string;
}) {
	const theme = useTheme();
	const sizeStyle = SIZES[size];
	const isDisabled = disabled || loading;
	const contentColorKey = CONTENT_COLOR[variant];
	const contentColor = theme[contentColorKey];

	const variantStyle: ViewStyle =
		variant === "primary"
			? { backgroundColor: theme.accent, borderColor: theme.accent }
			: {
					backgroundColor: "transparent",
					borderColor:
						variant === "destructive" ? theme.textDestructive : theme.accent,
				};

	const iconEl = icon ? (
		<Ionicons name={icon} size={sizeStyle.iconSize} color={contentColor} />
	) : null;

	return (
		<Pressable
			onPress={onPress}
			disabled={isDisabled}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityHint={accessibilityHint}
			accessibilityState={{ disabled: isDisabled, busy: loading }}
			style={({ pressed }) => [
				styles.base,
				{
					paddingVertical: sizeStyle.paddingVertical,
					paddingHorizontal: sizeStyle.paddingHorizontal,
					gap: sizeStyle.gap,
					minHeight: sizeStyle.minHeight,
				},
				variantStyle,
				noBorder && styles.noBorder,
				pressed && !isDisabled && styles.pressed,
				isDisabled && styles.disabled,
				style,
			]}
		>
			{loading ? (
				<ActivityIndicator color={contentColor} />
			) : (
				<>
					{iconPosition === "left" && iconEl}
					{label ? (
						<ThemedText
							type={sizeStyle.textType}
							themeColor={contentColorKey}
							style={styles.label}
							numberOfLines={1}
						>
							{label}
						</ThemedText>
					) : null}
					{iconPosition === "right" && iconEl}
				</>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	base: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderRadius: Spacing.two,
	},
	noBorder: {
		borderWidth: 0,
	},
	pressed: {
		opacity: 0.85,
	},
	disabled: {
		opacity: 0.5,
	},
	label: {
		fontWeight: "600",
	},
});
