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
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Task, TaskPriority } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  updateTask,
  deleteTask,
  createComment,
  deleteComment,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from '../store/taskSlice';
import { format } from 'date-fns';

interface TaskDetailDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

export default function TaskDetailDialog({
  open,
  task,
  onClose,
}: TaskDetailDialogProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    await dispatch(
      updateTask({
        id: task.id,
        data: { title, description, priority },
      })
    );
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask(task.id));
      onClose();
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      await dispatch(createComment({ taskId: task.id, content: newComment }));
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await dispatch(deleteComment({ taskId: task.id, commentId }));
  };

  const handleAddSubtask = async () => {
    if (newSubtask.trim()) {
      const position = task.subtasks?.length || 0;
      await dispatch(
        createSubtask({ taskId: task.id, title: newSubtask, position })
      );
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    await dispatch(
      updateSubtask({
        taskId: task.id,
        subtaskId,
        data: { isCompleted: !isCompleted },
      })
    );
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await dispatch(deleteSubtask({ taskId: task.id, subtaskId }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Task Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            label="Priority"
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
            <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
            <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
            <MenuItem value={TaskPriority.CRITICAL}>Critical</MenuItem>
          </Select>
        </FormControl>

        {/* Subtasks Section */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Subtasks
          </Typography>
          <List>
            {task.subtasks?.map((subtask) => (
              <ListItem key={subtask.id} dense>
                <Checkbox
                  checked={subtask.isCompleted}
                  onChange={() =>
                    handleToggleSubtask(subtask.id, subtask.isCompleted)
                  }
                />
                <ListItemText
                  primary={subtask.title}
                  sx={{
                    textDecoration: subtask.isCompleted
                      ? 'line-through'
                      : 'none',
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Box display="flex" gap={1} mt={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Add a subtask..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddSubtask();
                }
              }}
            />
            <IconButton color="primary" onClick={handleAddSubtask}>
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Labels Section */}
        {task.labels && task.labels.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Labels
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {task.labels.map((label) => (
                <Chip
                  key={label.labelId}
                  label={label.label?.name}
                  sx={{
                    backgroundColor: label.label?.color,
                    color: 'white',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Assignees Section */}
        {task.assignees && task.assignees.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Assignees
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {task.assignees.map((assignee) => (
                <Chip
                  key={assignee.userId}
                  label={assignee.user?.name}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Comments Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          <List>
            {task.comments?.map((comment) => (
              <Paper key={comment.id} sx={{ p: 2, mb: 1 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {comment.user?.name || 'Unknown User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                    <Typography variant="body2" mt={1}>
                      {comment.content}
                    </Typography>
                  </Box>
                  {comment.userId === user?.id && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Paper>
            ))}
          </List>
          <Box display="flex" gap={1} mt={2}>
            <TextField
              size="small"
              fullWidth
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              multiline
              maxRows={4}
            />
            <IconButton color="primary" onClick={handleAddComment}>
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} color="error" startIcon={<DeleteIcon />}>
          Delete Task
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
