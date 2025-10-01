import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getAllWorkVisas } from "../../../../services/workVisaService";
import FilterPanel from "../../../../components/Filter/FilterPanel";

// Helper: Format salary with currency
function formatSalary(salary: string, currency: string) {
  if (!salary) return "N/A";
  // Simple currency formatting, can be improved
  return `${currency} ${Number(salary).toLocaleString()}`;
}

// Helper: Format date
function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// New Card for Work Visa Jobs
const WorkVisaJobCard: React.FC<{ visa: any }> = ({ visa }) => (
  <Card
    sx={{
      width: { xs: 320, sm: 350, md: 380 },
      minHeight: 320,
      borderRadius: 3,
      boxShadow: 3,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      p: 2,
    }}
  >
    <CardContent sx={{ flex: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <Chip
          label={visa.organization?.name || "Unknown Org"}
          size="small"
          color="primary"
          sx={{ fontWeight: 500, fontSize: 13 }}
        />
        <Chip
          label={visa.city ? `${visa.city}, ${visa.country}` : visa.country}
          size="small"
          color="secondary"
          sx={{ fontWeight: 500, fontSize: 13 }}
        />
      </Stack>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {visa.job_title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {visa.job_description}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
        <Typography variant="body2" fontWeight={500}>
          Salary:
        </Typography>
        <Typography variant="body2">
          {formatSalary(visa.salary, visa.currency)}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
        <Typography variant="body2" fontWeight={500}>
          Duration:
        </Typography>
        <Typography variant="body2">
          {formatDate(visa.start_date)} - {formatDate(visa.end_date)}
        </Typography>
      </Stack>
      {visa.requirements && visa.requirements.length > 0 && (
        <Box mt={1}>
          <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
            Requirements:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {visa.requirements.map((req: any) => (
              <li key={req.id} style={{ fontSize: 13 }}>
                {req.description}
              </li>
            ))}
          </ul>
        </Box>
      )}
    </CardContent>
    <CardActions sx={{ justifyContent: "flex-end" }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        onClick={() => {
          // You can navigate to an application form or details page here
          // e.g., navigate(`/customer/travel/work-visa/apply/${visa.id}`)
          alert(`Apply for ${visa.job_title} work visa`);
        }}
      >
        Apply Now
      </Button>
    </CardActions>
  </Card>
);

const CountriesJob: React.FC = () => {
  const [workVisas, setWorkVisas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});

  // For filter options, extract unique values from workVisas
  const filterConfig = useMemo(() => {
    // Get unique countries, cities, organizations, job titles, currencies, salary range
    const countries = Array.from(
      new Set(workVisas.map((v) => v.country).filter(Boolean))
    );
    const cities = Array.from(
      new Set(workVisas.map((v) => v.city).filter(Boolean))
    );
    const organizations = Array.from(
      new Set(
        workVisas
          .map((v) => v.organization?.name)
          .filter((name) => !!name)
      )
    );
    const jobTitles = Array.from(
      new Set(workVisas.map((v) => v.job_title).filter(Boolean))
    );
    const currencies = Array.from(
      new Set(workVisas.map((v) => v.currency).filter(Boolean))
    );
    // Salary min/max
    const salaries = workVisas
      .map((v) => Number(v.salary))
      .filter((n) => !isNaN(n));
    const minSalary = salaries.length ? Math.min(...salaries) : 0;
    const maxSalary = salaries.length ? Math.max(...salaries) : 10000;

    return [
      {
        type: "checkbox",
        name: "country",
        title: "Country",
        options: countries.map((c) => ({ label: c, value: c })),
      },
      {
        type: "checkbox",
        name: "city",
        title: "City",
        options: cities.map((c) => ({ label: c, value: c })),
      },
      {
        type: "checkbox",
        name: "organization",
        title: "Organization",
        options: organizations.map((o) => ({ label: o, value: o })),
      },
      {
        type: "checkbox",
        name: "job_title",
        title: "Job Title",
        options: jobTitles.map((j) => ({ label: j, value: j })),
      },
      {
        type: "checkbox",
        name: "currency",
        title: "Currency",
        options: currencies.map((cur) => ({ label: cur, value: cur })),
      },
      {
        type: "slider",
        name: "salary",
        title: "Salary Range",
        min: minSalary,
        max: maxSalary,
        step: 100,
      },
    ];
  }, [workVisas]);

  useEffect(() => {
    const fetchWorkVisas = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllWorkVisas();
        setWorkVisas(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError("Failed to load available work visas.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkVisas();
  }, []);

  // Filtering logic
  const filteredVisas = useMemo(() => {
    if (!workVisas.length) return [];
    return workVisas.filter((visa) => {
      // Country filter
      if (
        filters.country &&
        Array.isArray(filters.country) &&
        filters.country.length > 0 &&
        !filters.country.includes(visa.country)
      ) {
        return false;
      }
      // City filter
      if (
        filters.city &&
        Array.isArray(filters.city) &&
        filters.city.length > 0 &&
        !filters.city.includes(visa.city)
      ) {
        return false;
      }
      // Organization filter
      if (
        filters.organization &&
        Array.isArray(filters.organization) &&
        filters.organization.length > 0 &&
        !filters.organization.includes(visa.organization?.name)
      ) {
        return false;
      }
      // Job Title filter
      if (
        filters.job_title &&
        Array.isArray(filters.job_title) &&
        filters.job_title.length > 0 &&
        !filters.job_title.includes(visa.job_title)
      ) {
        return false;
      }
      // Currency filter
      if (
        filters.currency &&
        Array.isArray(filters.currency) &&
        filters.currency.length > 0 &&
        !filters.currency.includes(visa.currency)
      ) {
        return false;
      }
      // Salary slider filter
      if (
        filters.salary &&
        Array.isArray(filters.salary) &&
        filters.salary.length === 2
      ) {
        const [min, max] = filters.salary;
        const salaryNum = Number(visa.salary);
        if (isNaN(salaryNum) || salaryNum < min || salaryNum > max) {
          return false;
        }
      }
      return true;
    });
  }, [workVisas, filters]);

  const handleChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({});
  };

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <CustomerPageHeader>
        <Typography variant="h4" className="font-bold mb-2">
          Available Work Visas
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Explore countries and job opportunities you can apply for with a work visa.
        </Typography>
      </CustomerPageHeader>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "flex-start" },
          justifyContent: "space-between",
          mb: 8,
          gap: { xs: 0, md: 4 },
        }}
      >
        {/* Work Visa Cards */}
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              mt: 2,
            }}
          >
            {loading ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  mt: 6,
                }}
              >
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : filteredVisas.length === 0 ? (
              <Typography>No available work visas found.</Typography>
            ) : (
              filteredVisas.map((visa: any, idx: number) => (
                <WorkVisaJobCard key={visa.id || idx} visa={visa} />
              ))
            )}
          </Box>
        </Box>

        {/* Filter Panel */}
        <Box
          sx={{
            width: { xs: "100%", md: 320 },
            flexShrink: 0,
            mb: { xs: 3, md: 0 },
            alignSelf: { xs: "auto", md: "flex-start" },
          }}
        >
          <FilterPanel
            filters={filterConfig as any}
            values={filters}
            onChange={handleChange}
            onClear={handleClear}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CountriesJob;
