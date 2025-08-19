import React, { useState } from 'react';
import { Box, Button, FormControlLabel, Paper, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';

export const ContactClientPage: React.FC = () => {
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    // TODO: integrate actual email/WhatsApp send
    // eslint-disable-next-line no-console
    console.log({ channel, to, subject, message });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Contact Client</Typography>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <RadioGroup row value={channel} onChange={(e) => setChannel(e.target.value as 'email' | 'whatsapp')}>
            <FormControlLabel value="email" control={<Radio />} label="Email" />
            <FormControlLabel value="whatsapp" control={<Radio />} label="WhatsApp" />
          </RadioGroup>

          <TextField fullWidth label={channel === 'email' ? 'Recipient Email' : 'WhatsApp Number'} value={to} onChange={(e) => setTo(e.target.value)} />

          {channel === 'email' && (
            <TextField fullWidth label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          )}

          <TextField fullWidth label="Message" value={message} onChange={(e) => setMessage(e.target.value)} multiline minRows={5} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="contained" onClick={handleSend}>Send</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ContactClientPage;


