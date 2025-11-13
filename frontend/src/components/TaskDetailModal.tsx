import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Task, TaskPriority } from '../types';
import { useAppDispatch } from '../hooks/redux';
import { fetchTaskById } from '../store/taskSlice';

interface TaskDetailModalProps {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
}

const priorityColors: Record<TaskPriority, string> = {
  CRITICAL: '#d32f2f',
  HIGH: '#f57c00',
  MEDIUM: '#fbc02d',
  LOW: '#388e3c',
};

export default function TaskDetailModal({ taskId, open, onClose }: TaskDetailModalProps) {
  const dispatch = useAppDispatch();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (taskId && open) {
      setIsLoading(true);
      dispatch(fetchTaskById(taskId))
        .unwrap()
        .then((fetchedTask) => {
          setTask(fetchedTask);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [taskId, open, dispatch]);

  const handleClose = () => {
    setTask(null);
    setNewComment('');
    onClose();
  };

  if (!open) return null;

  if (isLoading || !task) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      {/* Header */}
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Task Details</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Priority */}
        {task.priority && (
          <Box display="flex" alignItems="center" mb={2}>
            <FlagIcon sx={{ color: priorityColors[task.priority], mr: 1 }} />
            <Chip
              label={task.priority}
              size="small"
              sx={{
                bgcolor: priorityColors[task.priority],
                color: '#fff',
              }}
            />
          </Box>
        )}

        {/* Title */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          {task.title}
        </Typography>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            {task.labels.map((taskLabel) => (
              <Chip
                key={taskLabel.labelId}
                label={taskLabel.label?.name}
                size="small"
                sx={{
                  bgcolor: taskLabel.label?.color || '#ccc',
                  color: '#fff',
                }}
              />
            ))}
          </Box>
        )}

        {/* Metadata */}
        <Box display="flex" gap={3} mb={3}>
          {task.dueDate && (
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}

          {task.assignees && task.assignees.length > 0 && (
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon fontSize="small" color="action" />
              <Box display="flex" gap={0.5}>
                {task.assignees.map((assignee) => (
                  <Avatar
                    key={assignee.userId}
                    alt={assignee.user?.name}
                    src={assignee.user?.avatarUrl}
                    sx={{ width: 24, height: 24 }}
                  >
                    {assignee.user?.name.charAt(0).toUpperCase()}
                  </Avatar>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Description */}
        <Box mb={3}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {task.description || 'No description provided'}
          </Typography>
        </Box>

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Subtasks ({task.subtasks.filter((st) => st.isCompleted).length}/{task.subtasks.length})
            </Typography>
            <List dense>
              {task.subtasks.map((subtask) => (
                <ListItem key={subtask.id} disablePadding>
                  <FormControlLabel
                    control={<Checkbox checked={subtask.isCompleted} disabled />}
                    label={subtask.title}
                    sx={{
                      textDecoration: subtask.isCompleted ? 'line-through' : 'none',
                      color: subtask.isCompleted ? 'text.secondary' : 'text.primary',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Comments */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Comments ({task.comments?.length || 0})
          </Typography>

          {task.comments && task.comments.length > 0 ? (
            <List>
              {task.comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                  <Avatar
                    alt={comment.user?.name}
                    src={comment.user?.avatarUrl}
                    sx={{ mr: 2, width: 32, height: 32 }}
                  >
                    {comment.user?.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">{comment.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No comments yet
            </Typography>
          )}

          {/* Add Comment */}
          <Box mt={2}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 1 }}
              disabled={!newComment.trim()}
            >
              Add Comment
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
