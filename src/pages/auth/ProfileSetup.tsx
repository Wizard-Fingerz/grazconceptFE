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
} from '@mui/material';

type CustomerType =
  | 'institution_partner'
  | 'high_school_partner'
  | 'business_owner'
  | 'regular_customer';

// const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
//   institution_partner: 'Institution Partner',
//   high_school_partner: 'High School Partner',
//   business_owner: 'Business Owner',
//   regular_customer: 'Individual Customer',
// };

export const CustomerProfileSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [customerType, setCustomerType] = useState<CustomerType | ''>('');
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: '',
    numberOfStudents: '',
    businessName: '',
    businessType: '',
    customerName: '',
    customerEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Step 1: Choose customer type
  const handleCustomerTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value as CustomerType | 'skip';
    // If user selects "skip", treat as "regular_customer"
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Build payload but do not assign to a variable to avoid TS6133
      if (customerType === 'institution_partner') {
        // const payload = {
        //   institution_name: formData.institutionName,
        //   institution_type: 'Institution',
        //   number_of_students: formData.numberOfStudents,
        // };
        // TODO: send payload to API
        // await api.post('/profile/customer-setup/', payload);
      } else if (customerType === 'high_school_partner') {
        // const payload = {
        //   institution_name: formData.institutionName,
        //   institution_type: 'High School',
        //   number_of_students: formData.numberOfStudents,
        // };
        // TODO: send payload to API
        // await api.post('/profile/customer-setup/', payload);
      } else if (customerType === 'business_owner') {
        // const payload = {
        //   business_name: formData.businessName,
        //   business_type: formData.businessType,
        // };
        // TODO: send payload to API
        // await api.post('/profile/customer-setup/', payload);
      } else if (customerType === 'regular_customer') {
        // const payload = {
        //   customer_name: formData.customerName,
        //   customer_email: formData.customerEmail,
        // };
        // TODO: send payload to API
        // await api.post('/profile/customer-setup/', payload);
      }

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
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }} elevation={3}>
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

                {/* Individual Customer */}
                {customerType === 'regular_customer' && (
                  <>
                    <TextField
                      label="Your Name"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Email"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleChange}
                      fullWidth
                      required
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
