
import {
  TextField,
  Autocomplete,
} from "@mui/material";
import { countryList } from "../../data/CountryList";

// The CountrySelect now uses the country label (e.g. "Bosnia and Herzegovina") as the value
export const CountrySelect = ({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string | null; // value is the country label (e.g. "Bosnia and Herzegovina")
  onChange: (value: string | null) => void;
  [key: string]: any;
}) => (
  <Autocomplete
    options={countryList}
    getOptionLabel={(option) => option.label}
    value={countryList.find((c) => c.label === value) || null}
    onChange={(_, newValue) => onChange(newValue ? newValue.label : null)}
    renderInput={(params) => (
      <TextField {...params} label={label} margin="normal" fullWidth />
    )}
    isOptionEqualToValue={(option, value) => option.label === value.label}
    {...props}
  />
);