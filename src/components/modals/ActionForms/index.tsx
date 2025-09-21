

import {
  Button,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { CountrySelect } from '../../../components/CountrySelect';

// --- Modal form content for each action, using CountrySelect where appropriate ---
export const actionForms = (
  formState: Record<string, any>,
  setFormState: React.Dispatch<React.SetStateAction<Record<string, any>>>
): Record<string, React.ReactNode> => ({
  "Book Flight": (
    <>
      {/* Flight Type Tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {["Round Trip", "One Way", "Multi-city"].map((type) => (
          <Button
            key={type}
            variant={formState.flightType === type ? "contained" : "outlined"}
            color={formState.flightType === type ? "primary" : "inherit"}
            onClick={() => {
              // If switching to Multi-city and it's not already set, initialize segments
              if (type === "Multi-city" && !Array.isArray(formState.multiCitySegments)) {
                setFormState((s) => ({
                  ...s,
                  flightType: type,
                  multiCitySegments: [
                    { from: "", to: "", departureDate: "" },
                    { from: "", to: "", departureDate: "" },
                  ],
                }));
              } else if (type !== "Multi-city") {
                setFormState((s) => {
                  // Remove multiCitySegments when switching away from Multi-city
                  const { multiCitySegments, ...rest } = s;
                  return { ...rest, flightType: type };
                });
              } else {
                setFormState((s) => ({ ...s, flightType: type }));
              }
            }}
            sx={{ flex: 1, textTransform: "none" }}
          >
            {type}
          </Button>
        ))}
      </Box>

      {/* Round Trip & One Way */}
      {(formState.flightType === "Round Trip" || !formState.flightType || formState.flightType === undefined) && (
        <>
          <CountrySelect
            label="From"
            value={formState.from || null}
            onChange={(val) => setFormState((s) => ({ ...s, from: val }))}
          />
          <CountrySelect
            label="To"
            value={formState.to || null}
            onChange={(val) => setFormState((s) => ({ ...s, to: val }))}
          />
          <TextField
            label="Departure Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formState.departureDate || ''}
            onChange={(e) => setFormState((s) => ({ ...s, departureDate: e.target.value }))}
          />
          <TextField
            label="Return Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formState.returnDate || ''}
            onChange={(e) => setFormState((s) => ({ ...s, returnDate: e.target.value }))}
            disabled={formState.flightType === "One Way"}
          />
        </>
      )}

      {/* One Way */}
      {formState.flightType === "One Way" && (
        <>
          <CountrySelect
            label="From"
            value={formState.from || null}
            onChange={(val) => setFormState((s) => ({ ...s, from: val }))}
          />
          <CountrySelect
            label="To"
            value={formState.to || null}
            onChange={(val) => setFormState((s) => ({ ...s, to: val }))}
          />
          <TextField
            label="Departure Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formState.departureDate || ''}
            onChange={(e) => setFormState((s) => ({ ...s, departureDate: e.target.value }))}
          />
          <TextField
            label="Return Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formState.returnDate || ''}
            onChange={(e) => setFormState((s) => ({ ...s, returnDate: e.target.value }))}
            disabled
          />
        </>
      )}

      {/* Multi-city */}
      {formState.flightType === "Multi-city" && (
        <>
          {(Array.isArray(formState.multiCitySegments) ? formState.multiCitySegments : []).map((segment: any, idx: number) => (
            <Box key={idx} sx={{ mb: 2, border: '1px solid #eee', borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Segment {idx + 1}
              </Typography>
              <CountrySelect
                label="From"
                value={segment.from || null}
                onChange={(val) =>
                  setFormState((s) => {
                    const segments = Array.isArray(s.multiCitySegments) ? [...s.multiCitySegments] : [];
                    segments[idx] = { ...segments[idx], from: val };
                    return { ...s, multiCitySegments: segments };
                  })
                }
              />
              <CountrySelect
                label="To"
                value={segment.to || null}
                onChange={(val) =>
                  setFormState((s) => {
                    const segments = Array.isArray(s.multiCitySegments) ? [...s.multiCitySegments] : [];
                    segments[idx] = { ...segments[idx], to: val };
                    return { ...s, multiCitySegments: segments };
                  })
                }
              />
              <TextField
                label="Departure Date"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={segment.departureDate || ''}
                onChange={(e) =>
                  setFormState((s) => {
                    const segments = Array.isArray(s.multiCitySegments) ? [...s.multiCitySegments] : [];
                    segments[idx] = { ...segments[idx], departureDate: e.target.value };
                    return { ...s, multiCitySegments: segments };
                  })
                }
              />
              {Array.isArray(formState.multiCitySegments) && formState.multiCitySegments.length > 2 && (
                <Button
                  size="small"
                  color="error"
                  sx={{ mt: 1 }}
                  onClick={() =>
                    setFormState((s) => ({
                      ...s,
                      multiCitySegments: (Array.isArray(s.multiCitySegments) ? s.multiCitySegments : []).filter((_: any, i: number) => i !== idx),
                    }))
                  }
                >
                  Remove Segment
                </Button>
              )}
            </Box>
          ))}
          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={() =>
              setFormState((s) => ({
                ...s,
                multiCitySegments: [
                  ...(Array.isArray(s.multiCitySegments)
                    ? s.multiCitySegments
                    : [
                        { from: "", to: "", departureDate: "" },
                        { from: "", to: "", departureDate: "" },
                      ]),
                  { from: "", to: "", departureDate: "" },
                ],
              }))
            }
          >
            Add Another Segment
          </Button>
        </>
      )}

      {/* Travelers Section */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Travelers
        </Typography>
        {[
          { key: "adults", label: "Adults", sub: "18-64", min: 1 },
          { key: "students", label: "Students", sub: "over 18", min: 0 },
          { key: "seniors", label: "Seniors", sub: "over 65", min: 0 },
          { key: "youths", label: "Youths", sub: "12-17", min: 0 },
          { key: "children", label: "Children", sub: "2-11", min: 0 },
          { key: "toddlers", label: "Toddlers in own seat", sub: "under 2", min: 0 },
          { key: "infants", label: "Infants on lap", sub: "under 2", min: 0 },
        ].map(({ key, label, sub, min }) => (
          <Box
            key={key}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
              pl: 1,
              pr: 1,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sub}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                sx={{ minWidth: 32, px: 0 }}
                onClick={() =>
                  setFormState((s) => ({
                    ...s,
                    [key]: Math.max((s[key] || 0) - 1, min),
                  }))
                }
                disabled={(formState[key] || 0) <= min}
                aria-label={`Decrease ${label}`}
              >
                -
              </Button>
              <Typography variant="body1" sx={{ width: 24, textAlign: "center" }}>
                {formState[key] !== undefined ? formState[key] : min}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ minWidth: 32, px: 0 }}
                onClick={() =>
                  setFormState((s) => ({
                    ...s,
                    [key]: (s[key] || min) + 1,
                  }))
                }
                aria-label={`Increase ${label}`}
              >
                +
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 1 }}>
        {["Economy", "Business", "First", "Premium"].map((option) => (
          <Button
            key={option}
            variant={formState.cabinClass === option ? "contained" : "outlined"}
            color={formState.cabinClass === option ? "primary" : "inherit"}
            onClick={() =>
              setFormState((s) => ({ ...s, cabinClass: option }))
            }
            sx={{ flex: 1, textTransform: "none" }}
          >
            {option}
          </Button>
        ))}
      </Box>
    </>
  ),
  "Reserve Hotel": (
    <>
      <CountrySelect
        label="Destination"
        value={formState.destination || ""}
        onChange={(val) =>
          setFormState((s) => ({
            ...s,
            destination: typeof val === "string" ? val : (val && typeof val === "object" && "label" in val ? (val as { label: string }).label : ""),
          }))
        }
      />
      <TextField
        label="Check-in Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formState.check_in || ""}
        onChange={(e) =>
          setFormState((s) => ({
            ...s,
            check_in: e.target.value,
          }))
        }
      />
      <TextField
        label="Check-out Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formState.check_out || ""}
        onChange={(e) =>
          setFormState((s) => ({
            ...s,
            check_out: e.target.value,
          }))
        }
      />

      {/* Guests and Rooms */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 1 }}>
        {/* Adults */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle2">Adults</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  adults: Math.max((s.adults ?? 2) - 1, 1),
                }))
              }
              disabled={(formState.adults ?? 2) <= 1}
              aria-label="Decrease Adults"
            >
              -
            </Button>
            <Typography variant="body1" sx={{ width: 48, textAlign: "center" }}>
              {formState.adults !== undefined ? formState.adults : 2}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  adults: (s.adults ?? 2) + 1,
                }))
              }
              aria-label="Increase Adults"
            >
              +
            </Button>
          </Box>
        </Box>
        {/* Children */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle2">Children</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  children: Math.max((s.children ?? 0) - 1, 0),
                }))
              }
              disabled={(formState.children ?? 0) <= 0}
              aria-label="Decrease Children"
            >
              -
            </Button>
            <Typography variant="body1" sx={{ width: 48, textAlign: "center" }}>
              {formState.children !== undefined ? formState.children : 0}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  children: (s.children ?? 0) + 1,
                }))
              }
              aria-label="Increase Children"
            >
              +
            </Button>
          </Box>
        </Box>
        {/* Rooms */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle2">Rooms</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  rooms: Math.max((s.rooms ?? 1) - 1, 1),
                }))
              }
              disabled={(formState.rooms ?? 1) <= 1}
              aria-label="Decrease Rooms"
            >
              -
            </Button>
            <Typography variant="body1" sx={{ width: 48, textAlign: "center" }}>
              {formState.rooms !== undefined ? formState.rooms : 1}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  rooms: (s.rooms ?? 1) + 1,
                }))
              }
              aria-label="Increase Rooms"
            >
              +
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Pets/Assistance Animals Info */}
      <Box sx={{ mt: 2, mb: 1, p: 2, bgcolor: "#f9fafb", borderRadius: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!formState.traveling_with_pets}
              onChange={(e) =>
                setFormState((s) => ({
                  ...s,
                  traveling_with_pets: e.target.checked,
                }))
              }
              name="traveling_with_pets"
              color="primary"
            />
          }
          label={
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Traveling with pets?
            </Typography>
          }
        />
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Assistance animals aren’t considered pets.&nbsp;
          <a
            href="https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1976d2", textDecoration: "underline" }}
          >
            Read more about traveling with assistance animals
          </a>
        </Typography>
      </Box>
    </>
  ),
  "Car Rentals": (
    <>
      <CountrySelect
        label="Pick-up Location"
        value={formState.pickupLocation || null}
        onChange={(val) => setFormState((s) => ({ ...s, pickupLocation: val }))}
      />
      <TextField
        label="Pick-up Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formState.pickupDate || ''}
        onChange={(e) => setFormState((s) => ({ ...s, pickupDate: e.target.value }))}
      />
      <TextField
        label="Drop-off Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formState.dropoffDate || ''}
        onChange={(e) => setFormState((s) => ({ ...s, dropoffDate: e.target.value }))}
      />
      <CountrySelect
        label="Drop-off Location (optional)"
        value={formState.dropoffLocation || null}
        onChange={(val) => setFormState((s) => ({ ...s, dropoffLocation: val }))}
      />
      <TextField
        label="Driver Age"
        type="number"
        fullWidth
        margin="normal"
        value={formState.driverAge || ''}
        onChange={(e) => setFormState((s) => ({ ...s, driverAge: e.target.value }))}
      />
    </>
  ),
  "Attractions": (
    <>
      <CountrySelect
        label="Destination"
        value={formState.destination || null}
        onChange={(val) => setFormState((s) => ({ ...s, destination: val }))}
      />
      <TextField
        label="Attraction Type (e.g. Museum, Park, Tour)"
        fullWidth
        margin="normal"
        value={formState.attractionType || ''}
        onChange={(e) => setFormState((s) => ({ ...s, attractionType: e.target.value }))}
      />
      <TextField
        label="Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formState.attractionDate || ''}
        onChange={(e) => setFormState((s) => ({ ...s, attractionDate: e.target.value }))}
      />
      <TextField
        label="Number of Tickets"
        type="number"
        fullWidth
        margin="normal"
        value={formState.numTickets || ''}
        onChange={(e) => setFormState((s) => ({ ...s, numTickets: e.target.value }))}
      />
    </>
  ),
  "Airport Taxis": (
    <>
      <CountrySelect
        label="Pick-up Location"
        value={formState.pickupLocation || null}
        onChange={(val) => setFormState((s) => ({ ...s, pickupLocation: val }))}
      />
      <CountrySelect
        label="Drop-off Location"
        value={formState.dropoffLocation || null}
        onChange={(val) => setFormState((s) => ({ ...s, dropoffLocation: val }))}
      />
      <TextField
        label="Pick-up Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formState.pickupDate || ''}
        onChange={(e) => setFormState((s) => ({ ...s, pickupDate: e.target.value }))}
      />
      <TextField
        label="Pick-up Time"
        type="time"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formState.pickupTime || ''}
        onChange={(e) => setFormState((s) => ({ ...s, pickupTime: e.target.value }))}
      />
      <TextField
        label="Number of Passengers"
        type="number"
        fullWidth
        margin="normal"
        value={formState.numPassengers || ''}
        onChange={(e) => setFormState((s) => ({ ...s, numPassengers: e.target.value }))}
      />
    </>
  ),
  "Apply for Visa": (
    <>
      <CountrySelect
        label="Country"
        value={formState.country || null}
        onChange={(val) => setFormState((s) => ({ ...s, country: val }))}
      />
      <TextField
        label="Purpose"
        fullWidth
        margin="normal"
        value={formState.purpose || ''}
        onChange={(e) => setFormState((s) => ({ ...s, purpose: e.target.value }))}
      />
    </>
  ),
  "Chat with Agent": (
    <>
      <TextField
        label="Your Message"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={formState.message || ''}
        onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
      />
    </>
  ),
  "Create Savings Plan": (
    <>
      <TextField
        label="Plan Name"
        fullWidth
        margin="normal"
        value={formState.planName || ''}
        onChange={(e) => setFormState((s) => ({ ...s, planName: e.target.value }))}
      />
      <TextField
        label="Amount"
        type="number"
        fullWidth
        margin="normal"
        value={formState.amount || ''}
        onChange={(e) => setFormState((s) => ({ ...s, amount: e.target.value }))}
      />
    </>
  ),
  "Apply for Study Loan": (
    <>
      <TextField
        label="Institution"
        fullWidth
        margin="normal"
        value={formState.institution || ''}
        onChange={(e) => setFormState((s) => ({ ...s, institution: e.target.value }))}
      />
      <TextField
        label="Amount Needed"
        type="number"
        fullWidth
        margin="normal"
        value={formState.amountNeeded || ''}
        onChange={(e) => setFormState((s) => ({ ...s, amountNeeded: e.target.value }))}
      />
    </>
  ),
  "Study Abroad Loan": (
    <>
      <CountrySelect
        label="Country"
        value={formState.country || null}
        onChange={(val) => setFormState((s) => ({ ...s, country: val }))}
      />
      <TextField
        label="Loan Amount"
        type="number"
        fullWidth
        margin="normal"
        value={formState.loanAmount || ''}
        onChange={(e) => setFormState((s) => ({ ...s, loanAmount: e.target.value }))}
      />
    </>
  ),
  "Pilgrimage Package": (
    <>
      <CountrySelect
        label="Destination"
        value={formState.destination || null}
        onChange={(val) => setFormState((s) => ({ ...s, destination: val }))}
      />
      <TextField
        label="Number of People"
        type="number"
        fullWidth
        margin="normal"
        value={formState.numPeople || ''}
        onChange={(e) => setFormState((s) => ({ ...s, numPeople: e.target.value }))}
      />
    </>
  ),
  "Business Loan for Travel Project": (
    <>
      <TextField
        label="Business Name"
        fullWidth
        margin="normal"
        value={formState.businessName || ''}
        onChange={(e) => setFormState((s) => ({ ...s, businessName: e.target.value }))}
      />
      <TextField
        label="Loan Amount"
        type="number"
        fullWidth
        margin="normal"
        value={formState.loanAmount || ''}
        onChange={(e) => setFormState((s) => ({ ...s, loanAmount: e.target.value }))}
      />
    </>
  ),
});