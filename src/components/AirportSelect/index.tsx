
import React from "react";
import {
  TextField,
  Autocomplete,
  Stack,
} from "@mui/material";
import airports from "@nwpr/airport-codes";

type AirportOption = {
  iata: string;
  name: string;
  city: string;
  country: string;
  iso3?: string;
};

export interface AirportSelectProps {
  label: string; // <-- include label prop (required)
  value: string | null; // airport IATA code or null
  onChange: (airportCode: string | null) => void;
  airportProps?: any;
}

/**
 * AirportSelect is a dropdown/autocomplete listing all airports from the dataset.
 * Shows: city (IATA) — Airport name, Country
 * Value: airport IATA code
 */
export const AirportSelect: React.FC<AirportSelectProps> = ({
  label,
  value,
  onChange,
  airportProps = {},
}) => {
  // Filter out airports without IATA code or with missing required fields
  const airportOptions: AirportOption[] = React.useMemo(() => {
    return (airports as any[]).filter(a =>
      a.iata && a.iata.length === 3 && a.city && a.name && a.country
    );
  }, []);

  // Find the selected airport object based on the value (IATA code)
  const selectedAirport = airportOptions.find(a => a.iata === value) || null;

  return (
    <Stack>
      <Autocomplete
        options={airportOptions}
        getOptionLabel={(option: AirportOption) =>
          `${option.city} (${option.iata}) — ${option.name}, ${option.country}`
        }
        value={selectedAirport}
        onChange={(_, newValue: AirportOption | null) =>
          onChange(newValue ? newValue.iata : null)
        }
        renderInput={(params) => (
          <TextField {...params} label={label} margin="normal" fullWidth />
        )}
        isOptionEqualToValue={(option: AirportOption, value: AirportOption) =>
          option.iata === value.iata
        }
        {...airportProps}
      />
    </Stack>
  );
};

