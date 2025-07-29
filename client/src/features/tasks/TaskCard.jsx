import useAuth from "../auth/useAuth";
import api from "../../lib/api";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Avatar,
  Link,
  Badge
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  AssignmentInd as AssignmentIndIcon,
  Person as PersonIcon,
  Event as EventIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Done as DoneIcon
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TaskCard({ task, onClaim, onUpdate, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // User identification
  const requesterId = task?.requester?._id || task?.createdBy?._id || task?.createdBy;
  const isCreator = user?._id === requesterId;
  const isClaimer = user?._id === task?.helper?._id;
  const isCompleted = task?.status === "completed";
  const isClaimed = task?.status === "claimed";
  
  // Claim logic - available to all non-creators for open tasks
  const canClaim = !isCreator && task?.status === "open" && !isClaimer;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    navigate(`/tasks/edit/${task._id}`, {
      state: { taskData: task, from: window.location.pathname },
    });
  };



  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsProcessing(true);
    try {
      await api.delete(`/tasks/${task._id}`);
      if (onDelete) onDelete(task._id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete task");
    } finally {
      setIsProcessing(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleClaim = async () => {
    setIsProcessing(true);
    try {
      const response = await api.put(`/tasks/${task._id}/claim`);
      if (onClaim) onClaim(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to claim task");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      const response = await api.put(`/tasks/${task._id}/complete`);
      if (onUpdate) onUpdate(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to complete task");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusChip = () => {
    switch (task?.status) {
      case "completed":
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Completed"
            color="success"
            size="small"
          />
        );
      case "claimed":
        return (
          <Chip
            icon={<AssignmentIndIcon />}
            label={isClaimer ? "Claimed by you" : `Claimed by ${task.helper?.name || "helper"}`}
            color="info"
            size="small"
          />
        );
      default:
        return (
          <Chip
            icon={<PendingIcon />}
            label="Open"
            color="warning"
            size="small"
          />
        );
    }
  };

  if (!task) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography color="error">Task data not available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            {error && (
              <Typography color="error" variant="caption" sx={{ display: "block", mb: 1 }}>
                {error}
              </Typography>
            )}

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">
                {task.title || "Untitled Task"}
                {isCreator && (
                  <Badge
                    color="primary"
                    badgeContent="Your Task"
                    invisible={!isCreator}
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              {getStatusChip()}
            </Stack>

            {task.category && (
              <Chip label={task.category} size="small" sx={{ mb: 1 }} />
            )}

            <Typography variant="body2" color="text.secondary" mb={2}>
              {task.description || "No description provided"}
            </Typography>

            {/* Creator Information */}
            <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                {isCreator ? "You created this task" : "Task Creator"}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {task.requester?.name?.charAt(0) || task.createdBy?.name?.charAt(0) || "U"}
                </Avatar>
                <Box>
                  <Typography>
                    {task.requester?.name || task.createdBy?.name || "Unknown user"}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={0.5}>
                    {task.requester?.email && (
                      <Tooltip title="Email creator">
                        <Link href={`mailto:${task.requester.email}`} color="inherit"  underline="none">
                          <EmailIcon fontSize="small" />  {task.requester?.email || task.createdBy?.email}
                        </Link>
                      </Tooltip>
                    )}
                    {task.requester?.phone && (
                      <Tooltip title="Call creator">
                        <Link href={`tel:${task.requester.phone}`} color="inherit" underline="none">
                          <PhoneIcon fontSize="small" />
                        </Link>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Claimer Information (shown when task is claimed) */}
            {isClaimed && task.helper && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {isClaimer ? "You claimed this task" : "Claimed by"}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {task.helper?.name?.charAt(0) || "H"}
                  </Avatar>
                  <Box>
                    <Typography>{task.helper.name}</Typography>
                    <Stack direction="row" spacing={1} mt={0.5}>
                      {task.helper?.email && (
                        <Tooltip title="Email claimer">
                          <Link href={`mailto:${task.helper.email}`} color="inherit"   underline="none" >
                            <EmailIcon fontSize="small" />  {task.helper?.email || task.helper.email}
                          </Link>
                        </Tooltip>
                      )}
                      {task.helper?.phone && (
                        <Tooltip title="Call claimer">
                          <Link href={`tel:${task.helper.phone}`} color="inherit">
                            <PhoneIcon fontSize="small" />
                          </Link>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            )}

            {task.deadline && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <EventIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Deadline: {new Date(task.deadline).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Box>

          {isCreator && (
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Stack>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleEdit} disabled={isProcessing || isCompleted}>
            <EditIcon sx={{ mr: 1 }} />
            {isCompleted ? "Completed tasks can't be edited" : "Edit"}
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} disabled={isProcessing}>
            <DeleteIcon sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Action Buttons Section */}
        <Box sx={{ mt: 2 }}>
          {canClaim ? (
            <Button
              variant="contained"
              size="small"
              onClick={handleClaim}
              fullWidth
              disabled={isProcessing}
              startIcon={<AssignmentIndIcon />}
            >
              {isProcessing ? "Processing..." : "Claim Task"}
            </Button>
          ) : isClaimer && !isCompleted ? (
            <Button
              variant="contained"
              size="small"
              onClick={handleComplete}
              fullWidth
              color="success"
              disabled={isProcessing}
              startIcon={<DoneIcon />}
            >
              {isProcessing ? "Processing..." : "Mark as Complete"}
            </Button>
          ) : isCompleted ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
              This task has been completed
            </Typography>
          ) : null}
        </Box>
      </CardContent>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={isProcessing}
          >
            {isProcessing ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}