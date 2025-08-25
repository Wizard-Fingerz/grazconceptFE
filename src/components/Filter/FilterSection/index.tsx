import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormGroup,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => {
  return (
    <Accordion defaultExpanded elevation={0} square>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight="bold">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>{children}</FormGroup>
      </AccordionDetails>
    </Accordion>
  );
};

export default FilterSection;
