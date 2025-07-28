import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, Alert } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';

export function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError('Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" gutterBottom color="success.main">
            Check your inbox!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We've sent a magic link to <strong>{email}</strong>
          </Typography>
          <Button 
            variant="text" 
            onClick={() => setSent(false)}
            sx={{ mt: 2 }}
          >
            Try different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Enter your email to receive a magic link
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !email}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}