import { useState } from "react";
import { StyleSheet } from "react-native";

import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { TextField } from "@/components/ui/text-field";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { Spacing } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { filled } from "@/lib/validation";

export default function LoginScreen() {
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

  const canSubmit = !loading && filled(email, password);

  return (
    <Screen center edges={["top", "bottom"]}>
      <ThemedView style={styles.form}>
        <ThemedText type="title" style={styles.title}>
          Concert Tracker
        </ThemedText>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        {error && <ThemedText type="destructive">{error}</ThemedText>}
        {message && <ThemedText type="small">{message}</ThemedText>}
        <Button
          label="Sign in"
          onPress={() => handleAuth("signIn")}
          disabled={!canSubmit}
          loading={loading}
        />
      </ThemedView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.three,
  },
});
