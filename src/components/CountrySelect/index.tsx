
import {
    TextField,
    Autocomplete,
  } from "@mui/material";
import { countryList } from "../../data/CountryList";
  


export const CountrySelect = ({
    label,
    value,
    onChange,
    ...props
  }: {
    label: string;
    value: string | null;
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