import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

export function HeaderBackButton({ fallbackHref }: { fallbackHref: Href }) {
	const theme = useTheme();

	function handlePress() {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace(fallbackHref);
		}
	}

	return (
		<Pressable onPress={handlePress} hitSlop={8} style={styles.button}>
			<Ionicons name="chevron-back" size={28} color={theme.accent} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 4,
		paddingLeft: 12,
		paddingRight: 8,
	},
});
