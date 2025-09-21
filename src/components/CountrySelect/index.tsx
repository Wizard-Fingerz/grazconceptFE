
import {
  TextField,
  Autocomplete,
} from "@mui/material";
import { countryList } from "../../data/CountryList";

// The CountrySelect now uses the CODE code (e.g. "BOS") as the value
export const CountrySelect = ({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string | null; // value is the CODE code (e.g. "BOS")
  onChange: (value: string | null) => void;
  [key: string]: any;
}) => (
  <Autocomplete
    options={countryList}
    getOptionLabel={(option) => option.label}
    value={countryList.find((c) => c.code === value) || null}
    onChange={(_, newValue) => onChange(newValue ? newValue.code : null)}
    renderInput={(params) => (
      <TextField {...params} label={label} margin="normal" fullWidth />
    )}
    isOptionEqualToValue={(option, value) => option.code === value.code}
    {...props}
  />
);