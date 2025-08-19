import React, { useState, useEffect } from 'react';
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
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';

type CustomerType = 'school' | 'student' | 'tourist';

export const CustomerProfileSetup: React.FC = () => {
  const [customerType, setCustomerType] = useState<CustomerType>('school');
  const [formData, setFormData] = useState({
    schoolName: '',
    numberOfStudents: '',
    studentName: '',
    studentGrade: '',
    touristOrigin: '',
    touristPurpose: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle customer type change
  const handleCustomerTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerType(event.target.value as CustomerType);
    // Reset form data on type change if needed
    setFormData({
      schoolName: '',
      numberOfStudents: '',
      studentName: '',
      studentGrade: '',
      touristOrigin: '',
      touristPurpose: '',
    });
  };

  // Handle input changes for all fields
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Build payload depending on customer type
      let payload = {};
      if (customerType === 'school') {
        payload = {
          school_name: formData.schoolName,
          number_of_students: formData.numberOfStudents,
        };
      } else if (customerType === 'student') {
        payload = {
          student_name: formData.studentName,
          student_grade: formData.studentGrade,
        };
      } else if (customerType === 'tourist') {
        payload = {
          tourist_origin: formData.touristOrigin,
          tourist_purpose: formData.touristPurpose,
        };
      }

      // TODO: send payload to API
      // await api.post('/profile/customer-setup/', payload);

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
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography variant="h5" textAlign="center">
              Customer Profile Setup
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">Profile saved successfully!</Alert>}

            <FormLabel component="legend">Select Customer Type</FormLabel>
            <RadioGroup row value={customerType} onChange={handleCustomerTypeChange}>
              <FormControlLabel value="school" control={<Radio />} label="School" />
              <FormControlLabel value="student" control={<Radio />} label="Student" />
              <FormControlLabel value="tourist" control={<Radio />} label="Tourist" />
            </RadioGroup>

            {/* Conditionally render fields based on customer type */}
            {customerType === 'school' && (
              <>
                <TextField
                  label="School Name"
                  name="schoolName"
                  value={formData.schoolName}
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

            {customerType === 'student' && (
              <>
                <TextField
                  label="Student Name"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <FormControl fullWidth required>
                  <InputLabel>Grade</InputLabel>
                  <Select
                    name="studentGrade"
                    value={formData.studentGrade}
                    label="Grade"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, studentGrade: e.target.value }))
                    }
                  >
                    {[...Array(12).keys()].map((grade) => (
                      <MenuItem key={grade + 1} value={`Grade ${grade + 1}`}>
                        Grade {grade + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {customerType === 'tourist' && (
              <>
                <TextField
                  label="Country of Origin"
                  name="touristOrigin"
                  value={formData.touristOrigin}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Purpose of Visit"
                  name="touristPurpose"
                  value={formData.touristPurpose}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </>
            )}

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
        </form>
      </Paper>
    </Box>
  );
};
