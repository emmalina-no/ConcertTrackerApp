import { Platform, StyleSheet, Text, type TextProps } from "react-native";

import { Fonts, ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "stat"
    | "small"
    | "smallBold"
    | "subtitle"
    | "heading"
    | "link"
    | "linkPrimary"
    | "code"
    | "destructive";
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = "default",
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? "text"] },
        type === "default" && styles.default,
        type === "title" && styles.title,
        type === "stat" && styles.stat,
        type === "small" && styles.small,
        type === "smallBold" && styles.smallBold,
        type === "subtitle" && styles.subtitle,
        type === "heading" && styles.heading,
        type === "link" && styles.link,
        type === "linkPrimary" && [styles.linkPrimary, { color: theme.accent }],
        type === "code" && styles.code,
        type === "destructive" && { color: theme.textDestructive },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 52,
  },
  stat: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: Fonts.rounded,
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 700,
  },
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 700,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    fontWeight: 700,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
