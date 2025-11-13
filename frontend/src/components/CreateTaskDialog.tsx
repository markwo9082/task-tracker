import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { TaskPriority } from '../types';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
  }) => void;
}

export default function CreateTaskDialog({ open, onClose, onSubmit }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSubmit({
      title,
      description: description || undefined,
      priority,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority(TaskPriority.MEDIUM);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPriority(TaskPriority.MEDIUM);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Task Title"
          type="text"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          sx={{ mt: 2 }}
        />

        <TextField
          margin="dense"
          label="Description (optional)"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mt: 2 }}
        />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title.trim()}>
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}
