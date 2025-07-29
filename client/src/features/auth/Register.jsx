import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './useAuth';
import { 
  TextField, 
  Button, 
  Container, 
  Typography,
} from '@mui/material';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
     console.log('Registering in with:', { email, password }); // ✅ Add this
    try {
      await register(formData);
      navigate('/tasks');
    } catch (err) {
       console.error('Registering error:', err.response?.data || err.message); // ✅ Add this
      console.error('Registration failed:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Register</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          minLength="6"
        />
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth
          sx={{ mt: 2 }}
        >
          Register
        </Button>
      </form>
    </Container>
  );
}
