import React from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Button,
  Typography,
} from "@mui/material";
import FilterSection from "../FilterSection";



interface Option {
  label: string;
  value: string | number;
}

interface FilterConfig {
  type: "checkbox" | "radio" | "slider";
  name: string;
  title: string;
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onClear: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onChange,
  onClear,
}) => {
  return (
    <Box sx={{ width: 280, p: 2, border: "1px solid #eee", borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Filter By</Typography>
        <Button size="small" onClick={onClear}>
          Clear
        </Button>
      </Box>

      {filters.map((filter) => (
        <FilterSection key={filter.name} title={filter.title}>
          {filter.type === "checkbox" &&
            filter.options?.map((opt) => (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    checked={values[filter.name]?.includes(opt.value) || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const prev = values[filter.name] || [];
                      onChange(
                        filter.name,
                        checked
                          ? [...prev, opt.value]
                          : prev.filter((v: any) => v !== opt.value)
                      );
                    }}
                  />
                }
                label={opt.label}
              />
            ))}

          {filter.type === "radio" && (
            <RadioGroup
              value={values[filter.name] || ""}
              onChange={(e) => onChange(filter.name, e.target.value)}
            >
              {filter.options?.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio />}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
          )}

          {filter.type === "slider" && (
            <Slider
              value={values[filter.name] || [filter.min, filter.max]}
              onChange={(_, newValue) => onChange(filter.name, newValue)}
              valueLabelDisplay="auto"
              min={filter.min}
              max={filter.max}
              step={filter.step}
            />
          )}
        </FilterSection>
      ))}
    </Box>
  );
};

export default FilterPanel;
