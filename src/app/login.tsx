import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
	const theme = useTheme();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	async function handleAuth(mode: "signIn" | "signUp") {
		setError(null);
		setMessage(null);
		setLoading(true);
		const credentials = { email: email.trim(), password };
		const { data, error: authError } =
			mode === "signIn"
				? await supabase.auth.signInWithPassword(credentials)
				: await supabase.auth.signUp(credentials);
		setLoading(false);
		if (authError) {
			setError(authError.message);
			return;
		}
		if (mode === "signUp" && !data.session) {
			setMessage(
				"Account created. Check your email to confirm it before signing in.",
			);
		}
	}

	const disabled =
		loading || email.trim().length === 0 || password.length === 0;

	return (
		<ThemedView style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<ThemedText type="title" style={styles.title}>
					Concert Tracker
				</ThemedText>

				<ThemedTextInput
					value={email}
					onChangeText={setEmail}
					placeholder="you@example.com"
					autoCapitalize="none"
					keyboardType="email-address"
				/>
				<ThemedTextInput
					value={password}
					onChangeText={setPassword}
					placeholder="Password"
					secureTextEntry
				/>
				{error && (
					<ThemedText type="small" themeColor="textSecondary">
						{error}
					</ThemedText>
				)}
				{message && <ThemedText type="small">{message}</ThemedText>}
				<Pressable
					onPress={() => handleAuth("signIn")}
					disabled={disabled}
					style={[
						styles.button,
						{ backgroundColor: theme.accent, borderColor: theme.text },
						disabled && styles.buttonDisabled,
					]}
				>
					{loading ? (
						<ActivityIndicator color={theme.onAccent} />
					) : (
						<ThemedText style={[styles.buttonText, { color: theme.onAccent }]}>Sign in</ThemedText>
					)}
				</Pressable>
				{/*         <Pressable
          onPress={() => handleAuth('signUp')}
          disabled={disabled}
          style={[styles.secondaryButton, disabled && styles.buttonDisabled]}>
          <ThemedText type="link">First time here? Create account</ThemedText>
        </Pressable> */}
			</SafeAreaView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	safeArea: {
		width: "100%",
		maxWidth: MaxContentWidth,
		paddingHorizontal: Spacing.four,
		gap: Spacing.three,
	},
	title: {
		textAlign: "center",
		marginBottom: Spacing.three,
	},
	button: {
		borderRadius: Spacing.two,
		borderWidth: 2,
		paddingVertical: Spacing.two + 2,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		fontWeight: "600",
	},
	secondaryButton: {
		alignItems: "center",
		paddingVertical: Spacing.two,
	},
});
