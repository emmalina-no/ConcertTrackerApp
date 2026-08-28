import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
	const theme = useTheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: theme.backgroundElement,
					borderTopColor: theme.backgroundSelected,
					// borderTopWidth: 0,
				},
				tabBarActiveTintColor: theme.accentWarm,
				tabBarInactiveTintColor: theme.textSecondary,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Concerts",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="musical-notes" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="stats"
				options={{
					title: "Stats",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="bar-chart" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="library"
				options={{
					title: "Library",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="library" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
