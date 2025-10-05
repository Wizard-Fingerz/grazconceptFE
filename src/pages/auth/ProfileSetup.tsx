import React, { useState, useEffect, type ChangeEvent } from 'react';
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
  Avatar,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { CountrySelect } from '../../components/CountrySelect';
import api from '../../services/api';
import { getPartnerType, fetchGenders } from '../../services/definitionService';

type CustomerType =
  | 'institution_partner'
  | 'high_school_partner'
  | 'business_owner'
  | 'regular_customer';

type PartnerTypeOption = {
  value: string;
  label: string;
};

type GenderOption = {
  id: number;
  value: string;
  label: string;
};

export const CustomerProfileSetup: React.FC = () => {
  const { user } = useAuth();

  // Prefill formData with user details if available
  // For gender, store the pk (id) if available, else empty string
  const getInitialFormData = () => ({
    institutionName: '',
    institutionType: '',
    numberOfStudents: '',
    businessName: '',
    businessType: '',
    // Regular customer fields
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    middleName: user?.middle_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    dateOfBirth: user?.date_of_birth || '',
    gender: user?.gender && typeof user.gender === 'number' ? String(user.gender) : '', // store pk as string if present
    nationality: user?.nationality || '',
    currentAddress: user?.current_address || user?.address || '',
    countryOfResidence: user?.country_of_residence || '',
  });

  const [step, setStep] = useState(1);
  const [customerType, setCustomerType] = useState<CustomerType | ''>('');
  const [formData, setFormData] = useState(getInitialFormData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Customer type options from API
  const [partnerTypeOptions, setPartnerTypeOptions] = useState<PartnerTypeOption[]>([]);
  const [partnerTypeLoading, setPartnerTypeLoading] = useState(false);
  const [partnerTypeError, setPartnerTypeError] = useState<string | null>(null);

  // Gender options from API
  const [genderOptions, setGenderOptions] = useState<GenderOption[]>([
    {
      value: '', label: 'Select Gender',
      id: 0
    }
  ]);
  const [genderLoading, setGenderLoading] = useState(false);
  const [genderError, setGenderError] = useState<string | null>(null);

  // Fetch customer type list from API
  useEffect(() => {
    let isMounted = true;
    setPartnerTypeLoading(true);
    setPartnerTypeError(null);
    getPartnerType()
      .then((apiData: any) => {
        if (isMounted) {
          const mappedOptions = (apiData?.results || []).map((item: any) => {
            let value = '';
            switch (item.term) {
              case 'Institution Partner':
                value = 'institution_partner';
                break;
              case 'High School Partner':
                value = 'high_school_partner';
                break;
              case 'Business Owner':
                value = 'business_owner';
                break;
              case 'Individual Customer':
                value = 'regular_customer';
                break;
              default:
                value = item.term.toLowerCase().replace(/\s+/g, '_');
            }
            return {
              value,
              label: item.term,
            };
          });

          setPartnerTypeOptions([
            ...mappedOptions,
            { value: 'skip', label: 'Skip (Continue as Individual Customer)' },
          ]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPartnerTypeError('Failed to load customer types.');
        }
      })
      .finally(() => {
        if (isMounted) setPartnerTypeLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch gender options from API
  useEffect(() => {
    let isMounted = true;
    setGenderLoading(true);
    setGenderError(null);
    fetchGenders()
      .then((apiData: any) => {
        if (isMounted) {
          const mappedOptions: GenderOption[] = [
            { value: '', label: 'Select Gender', id: 0 },
            ...(apiData?.results || []).map((item: any) => ({
              value: String(item.id), // value is string of pk
              label: item.term ?? item.value ?? '',
              id: item.id,
            })),
          ];
          setGenderOptions(mappedOptions);

          // If user.gender is a string label (e.g., "Male"), set formData.gender to the corresponding id
          if (
            user?.gender &&
            typeof user.gender === 'string' &&
            user.gender !== '' &&
            mappedOptions.length > 1
          ) {
            const found = mappedOptions.find(
              (opt) =>
                typeof opt.label === 'string' &&
                typeof user?.gender === 'string' &&
                opt.label.toLowerCase() === user.gender.toLowerCase()
            );
            if (found) {
              setFormData((prev) => ({
                ...prev,
                gender: String(found.id),
              }));
            }
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setGenderError('Failed to load gender options.');
        }
      })
      .finally(() => {
        if (isMounted) setGenderLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, []);

  // Update formData if user changes (e.g. after login)
  useEffect(() => {
    setFormData(getInitialFormData());
    setProfileImage(null);
    setProfileImagePreview(null);
    // Optionally, set customerType if user has a type
    // setCustomerType(user?.customerType || '');
    // eslint-disable-next-line
  }, [user]);

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
    // For gender, always store the pk (id) as a string
    if (name === 'gender') {
      setFormData((prev) => ({ ...prev, [name]: String(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name as keyof typeof prev]: String(value) }));
    }
  };

  // Handle CountrySelect changes
  const handleCountryChange = (name: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile image change
  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImagePreview(null);
    }
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
    if (!data.currentAddress) errors.currentAddress = "Current address is required";
    if (!data.countryOfResidence) errors.countryOfResidence = "Country of residence is required";
    return errors;
  }

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Build the payload for submission, mapping to expected backend fields
  const buildPayload = () => {
    // Map frontend formData fields to backend expected fields
    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      middleName: 'middle_name',
      lastName: 'last_name',
      phone: 'phone_number',
      dateOfBirth: 'date_of_birth',
      gender: 'gender',
      currentAddress: 'current_address',
      countryOfResidence: 'country_of_residence',
      nationality: 'nationality',
      email: 'email',
      // Add more mappings as needed
    };

    // Build the payload object with correct keys
    const payload: Record<string, any> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (fieldMap[key]) {
        // Special handling for gender: send pk (number) instead of label or string
        if (key === "gender") {
          // The value in formData.gender is the pk as a string (or empty string)
          // Convert to number if not empty, else send empty string
          const genderPk = value !== '' ? Number(value) : '';
          payload[fieldMap[key]] = genderPk;
        } else {
          payload[fieldMap[key]] = value ?? '';
        }
        payload[key] = value ?? '';
      }
    });

    // Map customerType to partner_type if needed
    if (customerType === 'institution_partner' || customerType === 'high_school_partner') {
      payload['partner_type'] = partnerTypeOptions.find(opt => opt.value === customerType)?.value || '';
    }

    // If profile image is present, use FormData for multipart/form-data
    if (profileImage) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        form.append(key, value ?? '');
      });
      form.append('profile_picture', profileImage);
      return form;
    } else {
      // No image, send as JSON
      return {
        ...payload,
      };
    }
  };

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
        // Build the payload
        const payload = buildPayload();

        // Send payload to API
        await api.patch('/clients/update-profile/', payload, {
          headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
        });
      }
      // Other customer types (not changed for this rewrite)
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/profile';
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
              {partnerTypeError && (
                <Alert severity="error">{partnerTypeError}</Alert>
              )}
              {partnerTypeLoading ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Loading customer types...</Typography>
                </Stack>
              ) : (
                <RadioGroup
                  value={customerType}
                  onChange={handleCustomerTypeChange}
                  name="customerType"
                >
                  {partnerTypeOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={loading || partnerTypeLoading}
                fullWidth
              >
                Next
              </Button>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Profile Image Upload (all customer types) */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={profileImagePreview || undefined}
                    sx={{ width: 56, height: 56 }}
                  >
                    {formData.firstName?.[0] || user?.first_name?.[0] || ''}
                  </Avatar>
                  <label htmlFor="profile-image-upload">
                    <input
                      accept="image/*"
                      id="profile-image-upload"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleProfileImageChange}
                    />
                    <Button variant="outlined" component="span">
                      {profileImage ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                  </label>
                  {profileImage && (
                    <Typography variant="body2" color="text.secondary">
                      {profileImage.name}
                    </Typography>
                  )}
                </Stack>

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
                      disabled={genderLoading}
                    >
                      {genderLoading ? (
                        <MenuItem value="">
                          <em>Loading...</em>
                        </MenuItem>
                      ) : genderError ? (
                        <MenuItem value="">
                          <em>{genderError}</em>
                        </MenuItem>
                      ) : (
                        genderOptions.map((option) => (
                          <MenuItem key={option.id} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                    {/* Replace Nationality field with CountrySelect */}
                    <CountrySelect
                      label="Nationality"
                      name="nationality"
                      value={formData.nationality || ""}
                      onChange={(value: string | null) => handleCountryChange('nationality', value ?? "")}
                      fullWidth
                      required
                      error={!!fieldErrors.nationality}
                      helperText={fieldErrors.nationality}
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
                    {/* Replace Country of Residence field with CountrySelect */}
                    <CountrySelect
                      label="Country of Residence"
                      name="countryOfResidence"
                      value={formData.countryOfResidence || ""}
                      onChange={(value: string | null) => handleCountryChange('countryOfResidence', value ?? "")}
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
