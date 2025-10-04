import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  MenuItem,
} from '@mui/material';

// Add gender and nationality options for demo
const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const NATIONALITY_OPTIONS = [
  { value: '', label: 'Select Nationality' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'ghana', label: 'Ghana' },
  { value: 'kenya', label: 'Kenya' },
  { value: 'south_africa', label: 'South Africa' },
  { value: 'other', label: 'Other' },
];

type CustomerType =
  | 'institution_partner'
  | 'high_school_partner'
  | 'business_owner'
  | 'regular_customer';

export const CustomerProfileSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [customerType, setCustomerType] = useState<CustomerType | ''>('');
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: '',
    numberOfStudents: '',
    businessName: '',
    businessType: '',
    // Regular customer fields
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    currentAddress: '',
    countryOfResidence: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Step 1: Choose customer type
  const handleCustomerTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value as CustomerType | 'skip';
    if (value === 'skip') {
      value = 'regular_customer';
    }
    setCustomerType(value as CustomerType);
    setError(null);
  };

  // Step 2: Handle input changes for all fields
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  // Step navigation
  const handleNext = () => {
    if (!customerType) {
      setError('Please select a customer type.');
      return;
    }
    setStep(2);
    setError(null);
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  // Validation for regular customer profile
  function validateRegularCustomerProfile(data: typeof formData) {
    const errors: Record<string, string> = {};
    if (!data.firstName) errors.firstName = "First name is required";
    if (!data.lastName) errors.lastName = "Last name is required";
    if (!data.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Invalid email";
    if (!data.phone) errors.phone = "Phone number is required";
    if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!data.gender) errors.gender = "Gender is required";
    if (!data.nationality) errors.nationality = "Nationality is required";
    if (!data.passportNumber) errors.passportNumber = "Passport number is required";
    if (!data.passportExpiry) errors.passportExpiry = "Passport expiry date is required";
    if (!data.currentAddress) errors.currentAddress = "Current address is required";
    if (!data.countryOfResidence) errors.countryOfResidence = "Country of residence is required";
    return errors;
  }

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (customerType === 'regular_customer') {
        const errors = validateRegularCustomerProfile(formData);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
          setError('Please fill all required fields correctly.');
          setLoading(false);
          return;
        }
        // const payload = {
        //   ...formData,
        // };
        // TODO: send payload to API
        // await api.post('/profile/customer-setup/', payload);
      }
      // Other customer types (not changed for this rewrite)
      setSuccess(true);
      setTimeout(() => {
        // TODO: navigate to dashboard or next step
      }, 1500);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 4,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 600, width: '100%' }} elevation={3}>
        <Stack spacing={3}>
          <Typography variant="h5" textAlign="center">
            Customer Profile Setup
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">
              Profile saved successfully!
            </Alert>
          )}

          {step === 1 && (
            <>
              <FormLabel component="legend">What type of customer are you?</FormLabel>
              <RadioGroup
                value={customerType}
                onChange={handleCustomerTypeChange}
                name="customerType"
              >
                <FormControlLabel
                  value="institution_partner"
                  control={<Radio />}
                  label="Institution Partner"
                />
                <FormControlLabel
                  value="high_school_partner"
                  control={<Radio />}
                  label="High School Partner"
                />
                <FormControlLabel
                  value="business_owner"
                  control={<Radio />}
                  label="Business Owner"
                />
                <FormControlLabel
                  value="regular_customer"
                  control={<Radio />}
                  label="Individual Customer"
                />
                <FormControlLabel
                  value="skip"
                  control={<Radio />}
                  label="Skip (Continue as Individual Customer)"
                />
              </RadioGroup>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={loading}
                fullWidth
              >
                Next
              </Button>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Institution Partner */}
                {(customerType === 'institution_partner' ||
                  customerType === 'high_school_partner') && (
                  <>
                    <TextField
                      label={
                        customerType === 'institution_partner'
                          ? 'Institution Name'
                          : 'High School Name'
                      }
                      name="institutionName"
                      value={formData.institutionName}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Number of Students"
                      name="numberOfStudents"
                      type="number"
                      value={formData.numberOfStudents}
                      onChange={handleChange}
                      fullWidth
                      required
                      inputProps={{ min: 1 }}
                    />
                  </>
                )}

                {/* Business Owner */}
                {customerType === 'business_owner' && (
                  <>
                    <TextField
                      label="Business Name"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Business Type"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </>
                )}

                {/* Individual Customer (Regular Customer) */}
                {customerType === 'regular_customer' && (
                  <>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!fieldErrors.firstName}
                      helperText={fieldErrors.firstName}
                    />
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!fieldErrors.lastName}
                      helperText={fieldErrors.lastName}
                    />
                    <TextField
                      label="Middle Name"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      fullWidth
                      error={!!fieldErrors.middleName}
                      helperText={fieldErrors.middleName}
                    />
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!fieldErrors.email}
                      helperText={fieldErrors.email}
                    />
                    <TextField
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!fieldErrors.phone}
                      helperText={fieldErrors.phone}
                    />
                    <TextField
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldErrors.dateOfBirth}
                      helperText={fieldErrors.dateOfBirth}
                    />
                    <TextField
                      select
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!fieldErrors.gender}
                      helperText={fieldErrors.gender}
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!fieldErrors.nationality}
                      helperText={fieldErrors.nationality}
                    >
                      {NATIONALITY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Passport Number"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!fieldErrors.passportNumber}
                      helperText={fieldErrors.passportNumber}
                    />
                    <TextField
                      label="Passport Expiry Date"
                      name="passportExpiry"
                      type="date"
                      value={formData.passportExpiry}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldErrors.passportExpiry}
                      helperText={fieldErrors.passportExpiry}
                    />
                    <TextField
                      label="Current Address"
                      name="currentAddress"
                      value={formData.currentAddress}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!fieldErrors.currentAddress}
                      helperText={fieldErrors.currentAddress}
                    />
                    <TextField
                      label="Country of Residence"
                      name="countryOfResidence"
                      value={formData.countryOfResidence}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!fieldErrors.countryOfResidence}
                      helperText={fieldErrors.countryOfResidence}
                    />
                  </>
                )}

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleBack}
                    disabled={loading}
                    fullWidth
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    fullWidth
                  >
                    Save Profile
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};
