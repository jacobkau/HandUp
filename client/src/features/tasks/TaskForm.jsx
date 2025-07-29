import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import api from '../../lib/api';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  Snackbar,
  Alert,
  Box,
  Stack
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function TaskForm({ 
  initialValues = null, 
  onSubmit, 
  onCancel,
  isEdit = false 
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'errands',
    location: {
      type: 'Point',
      coordinates: [0, 0],
      address: ''
    },
    deadline: null
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        category: initialValues.category || 'errands',
        location: initialValues.location || {
          type: 'Point',
          coordinates: user?.location?.coordinates || [0, 0],
          address: user?.location?.address || ''
        },
        deadline: initialValues.deadline || null
      });
    }
  }, [initialValues, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    if (!user) {
      setError('You must be logged in to perform this action');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        deadline: formData.deadline
      };

      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // Only create new task if no onSubmit provided (shouldn't happen in edit mode)
        payload.requester = user._id;
        await api.post('/tasks', payload);
      }
      
      setSuccess(true);
      if (!isEdit) {
        setTimeout(() => navigate('/tasks'), 1500);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 
        (isEdit ? 'Failed to update task' : 'Failed to create task'));
    } finally {
      setIsSubmitting(false);
    }
  };


  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            coordinates: [pos.coords.longitude, pos.coords.latitude],
            address: `Detected Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          }
        });
        setIsDetectingLocation(false);
      },
      (err) => {
        setError(`Location detection failed: ${err.message}`);
        setIsDetectingLocation(false);
      }
    );
  };

  const handleAddressChange = (e) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        address: e.target.value
      }
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? 'Edit Task' : 'Create New Task'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            inputProps={{ maxLength: 100 }}
            helperText={`${formData.title.length}/100 characters`}
          />
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <MenuItem value="errands">Errands</MenuItem>
                <MenuItem value="repairs">Repairs</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="donations">Donations</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Deadline (optional)"
                value={formData.deadline}
                onChange={(newValue) => {
                  setFormData({...formData, deadline: newValue});
                }}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </Stack>

          <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ mr: 1 }} /> Location
            </Typography>
            
            <TextField
              label="Address"
              fullWidth
              margin="normal"
              value={formData.location.address || ''}
              onChange={handleAddressChange}
            />
            
            <Typography variant="body2" sx={{ mt: 1 }}>
              Coordinates: {formData.location.coordinates.join(', ')}
            </Typography>
            
            <Button 
              onClick={detectLocation}
              variant="outlined"
              sx={{ mt: 2 }}
              startIcon={<LocationOnIcon />}
              disabled={isDetectingLocation}
            >
              {isDetectingLocation ? 'Detecting Location...' : 'Detect My Location'}
            </Button>
          </Box>

          <Stack direction="row" spacing={2}>
            {onCancel && (
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                fullWidth
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEdit ? 'Updating Task...' : 'Creating Task...') 
                : (isEdit ? 'Update Task' : 'Create Task')}
            </Button>
          </Stack>
        </Stack>
      </form>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">
          {isEdit ? 'Task updated successfully!' : 'Task created successfully!'}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}