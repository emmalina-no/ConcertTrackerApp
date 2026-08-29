import { TextField } from "@/components/ui/text-field";
import type { VenueValue } from "@/lib/types";

export function VenueFields({
  value,
  onChange,
}: {
  value: VenueValue;
  onChange: (value: VenueValue) => void;
}) {
  return (
    <>
      <TextField
        label="Venue name"
        value={value.name}
        onChangeText={(name) => onChange({ ...value, name })}
        placeholder="The Fillmore"
      />
      <TextField
        label="City"
        value={value.city}
        onChangeText={(city) => onChange({ ...value, city })}
        placeholder="San Francisco"
      />
      <TextField
        label="Country"
        value={value.country}
        onChangeText={(country) => onChange({ ...value, country })}
        placeholder="USA"
      />
    </>
  );
}
