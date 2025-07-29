import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import TaskForm from './TaskForm';
import useAuth from '../auth/useAuth';
import { Typography, CircularProgress, Box, Button } from '@mui/material';

export default function EditTaskPage({ onUpdate }) {  // Added onUpdate prop
  const { taskId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(location.state?.taskData || null);
  const [loading, setLoading] = useState(!location.state?.taskData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!task) {
      const fetchTask = async () => {
        try {
          const response = await api.get(`/tasks/${taskId}`);
          setTask(response.data.data);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to load task');
        } finally {
          setLoading(false);
        }
      };
      fetchTask();
    }
  }, [taskId, task]);

  const handleSubmit = async (formData) => {
    try {
      const response = await api.put(`/tasks/${task._id}`, formData);
      if (onUpdate) onUpdate(response.data.data);
      
      navigate(location.state?.from || '/tasks', { 
        state: { message: 'Task updated successfully' } 
      });
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update task');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box p={4}>
        <Typography>Task not found</Typography>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  if (user?._id !== task.requester?._id) {
    return (
      <Box p={4}>
        <Typography color="error">You don't have permission to edit this task</Typography>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Edit Task</Typography>
      <TaskForm 
        initialValues={{
          title: task.title,
          description: task.description,
          category: task.category,
          location: task.location || {
            type: 'Point',
            coordinates: [0, 0],
            address: ''
          },
          deadline: task.deadline ? new Date(task.deadline) : null
        }}
        onSubmit={handleSubmit} 
        onCancel={() => navigate(-1)}
        isEdit={true}
      />
    </Box>
  );
}