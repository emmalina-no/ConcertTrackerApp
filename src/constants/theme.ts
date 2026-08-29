/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
	light: {
		text: "#3b3644",
		background: "#fff9eb",
		backgroundElement: "#F7EEDD",
		backgroundSelected: "#EEDFC0",
		textSecondary: "#7A6E58",
		accent: "#cb6ad3",
		accentAlt: "#0E8C8C",
		accentWarm: "#E8590C",
		onAccent: "#FFFFFF",
		textDestructive: "#a30000",
	},
	dark: {
		text: "#F5EFFF",
		background: "#1d132d",
		backgroundElement: "#382753",
		backgroundSelected: "#4A3568",
		textSecondary: "#C2AEDD",
		accent: "#C77DFF",
		accentAlt: "#2DD4BF",
		accentWarm: "#FDBA5C",
		onAccent: "#241a35",
		textDestructive: "#cf0000",
	},
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
	ios: {
		/** iOS `UIFontDescriptorSystemDesignDefault` */
		sans: "system-ui",
		/** iOS `UIFontDescriptorSystemDesignSerif` */
		serif: "ui-serif",
		/** iOS `UIFontDescriptorSystemDesignRounded` */
		rounded: "ui-rounded",
		/** iOS `UIFontDescriptorSystemDesignMonospaced` */
		mono: "ui-monospace",
	},
	default: {
		sans: "normal",
		serif: "serif",
		rounded: "normal",
		mono: "monospace",
	},
	web: {
		sans: "var(--font-display)",
		serif: "var(--font-serif)",
		rounded: "var(--font-rounded)",
		mono: "var(--font-mono)",
	},
});

export const Spacing = {
	half: 2,
	one: 4,
	two: 8,
	three: 16,
	four: 24,
	five: 32,
	six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
