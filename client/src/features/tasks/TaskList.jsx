import { useEffect, useState } from "react";
import api from "../../lib/api";
import TaskCard from "./TaskCard";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { useLocation } from "react-router-dom";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const location = useLocation();

  useEffect(() => {
    loadTasks();
  }, [location.key]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    console.log("Updated task:", updatedTask);
    setTasks((prev) =>
      prev.map((t) =>
        t._id === updatedTask._id
          ? {
              ...updatedTask,
              // Ensure helper data exists
              helper: updatedTask.helper || t.helper,
            }
          : t
      )
    );
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((task) => task._id !== taskId));
  };
  let filteredTasks = [];

  if (tabValue === 0) {
    filteredTasks = tasks.filter((task) => task.status === "open");
  } else if (tabValue === 1) {
    filteredTasks = tasks.filter((task) => task.status === "claimed");
  } else {
    filteredTasks = tasks.filter((task) => task.status === "completed");
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Available Tasks
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Open Tasks" />
        <Tab label="Claimed Tasks" />
        <Tab label="Complete Tasks" />
      </Tabs>

      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClaim={handleTaskUpdated}
            onUpdate={handleTaskUpdated}
            onDelete={handleTaskDeleted}
          />
        ))
      ) : (
        <Typography variant="body1" color="text.secondary">
          {tabValue === 0
            ? "No open tasks available"
            : tabValue === 1
            ? "No claimed tasks available"
            : "No completed at the moment in the system"}
        </Typography>
      )}
    </Box>
  );
}
