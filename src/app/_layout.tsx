import { Colors } from "@/constants/theme";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

import { HeaderBackButton } from "@/components/ui/header-back-button";
import { AuthProvider, useAuth } from "@/lib/auth-context";

const AppLightTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: Colors.light.accent,
		background: Colors.light.background,
		card: Colors.light.backgroundElement,
		text: Colors.light.text,
		border: Colors.light.backgroundSelected,
	},
};

const AppDarkTheme = {
	...DarkTheme,
	colors: {
		...DarkTheme.colors,
		primary: Colors.dark.accent,
		background: Colors.dark.background,
		card: Colors.dark.backgroundElement,
		text: Colors.dark.text,
		border: Colors.dark.backgroundSelected,
	},
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	return (
		<ThemeProvider
			value={colorScheme === "dark" ? AppDarkTheme : AppLightTheme}
		>
			<AuthProvider>
				<RootNavigator />
			</AuthProvider>
		</ThemeProvider>
	);
}

function RootNavigator() {
	const { session, loading } = useAuth();

	if (loading) return null;

	return (
		<Stack>
			<Stack.Protected guard={!!session}>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen
					name="event/[id]"
					options={{
						title: "Concert",
						headerLeft: () => <HeaderBackButton fallbackHref="/" />,
					}}
				/>
				<Stack.Screen
					name="event/new"
					options={{
						title: "New concert",
						presentation: "modal",
						headerLeft: () => <HeaderBackButton fallbackHref="/" />,
					}}
				/>
				<Stack.Screen
					name="artist/[id]"
					options={{
						title: "Artist",
						headerLeft: () => <HeaderBackButton fallbackHref="/library" />,
					}}
				/>
				<Stack.Screen
					name="venue/[id]"
					options={{
						title: "Venue",
						headerLeft: () => <HeaderBackButton fallbackHref="/library" />,
					}}
				/>
			</Stack.Protected>
			<Stack.Protected guard={!session}>
				<Stack.Screen name="login" options={{ headerShown: false }} />
			</Stack.Protected>
		</Stack>
	);
}
