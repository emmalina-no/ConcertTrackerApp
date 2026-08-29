import type { TextInputProps } from "react-native";

import { FormField } from "@/components/ui/form-field";
import { ThemedTextInput } from "@/components/ui/themed-text-input";

export function TextField({
  label,
  hint,
  error,
  value,
  onChangeText,
  ...rest
}: TextInputProps & {
  label: string;
  hint?: string;
  error?: string | null;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <FormField label={label} hint={hint} error={error}>
      <ThemedTextInput value={value} onChangeText={onChangeText} {...rest} />
    </FormField>
  );
}
