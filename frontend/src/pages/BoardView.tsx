import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBoard } from '../store/boardSlice';
import { createTask, moveTask, fetchTask } from '../store/taskSlice';
import { Task, TaskPriority } from '../types';
import KanbanLane from '../components/KanbanLane';
import TaskDetailDialog from '../components/TaskDetailDialog';

export default function BoardView() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBoard, isLoading } = useAppSelector((state) => state.board);
  const { error } = useAppSelector((state) => state.task);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(
    TaskPriority.MEDIUM
  );

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
    }
  }, [boardId, dispatch]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Move task to different lane
    if (destination.droppableId !== source.droppableId) {
      await dispatch(
        moveTask({ id: draggableId, laneId: destination.droppableId })
      );
      // Refresh board to get updated state
      if (boardId) {
        dispatch(fetchBoard(boardId));
      }
    }
  };

  const handleTaskClick = async (task: Task) => {
    await dispatch(fetchTask(task.id));
    setSelectedTask(task);
  };

  const handleCloseTaskDialog = () => {
    setSelectedTask(null);
    // Refresh board to get updated tasks
    if (boardId) {
      dispatch(fetchBoard(boardId));
    }
  };

  const handleAddTask = (laneId: string) => {
    setSelectedLaneId(laneId);
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority(TaskPriority.MEDIUM);
    setSelectedLaneId('');
  };

  const handleCreateTask = async () => {
    if (newTaskTitle.trim() && boardId && selectedLaneId) {
      await dispatch(
        createTask({
          boardId,
          laneId: selectedLaneId,
          title: newTaskTitle,
          description: newTaskDescription,
          priority: newTaskPriority,
        })
      );
      handleCloseCreateDialog();
      // Refresh board
      dispatch(fetchBoard(boardId));
    }
  };

  if (isLoading && !currentBoard) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentBoard) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Board not found
        </Typography>
      </Box>
    );
  }

  const lanes = currentBoard.lanes || [];

  return (
    <Box>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate('/workspaces')}
          sx={{ cursor: 'pointer' }}
        >
          Workspaces
        </Link>
        <Link
          underline="hover"
          color="inherit"
          onClick={() =>
            navigate(`/workspaces/${currentBoard.workspaceId}/boards`)
          }
          sx={{ cursor: 'pointer' }}
        >
          Boards
        </Link>
        <Typography color="text.primary">{currentBoard.name}</Typography>
      </Breadcrumbs>

      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {currentBoard.name}
        </Typography>
        {currentBoard.description && (
          <Typography variant="body1" color="text.secondary">
            {currentBoard.description}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            minHeight: '70vh',
          }}
        >
          {lanes
            .sort((a, b) => a.position - b.position)
            .map((lane) => {
              const laneTasks = lane.tasks || [];
              return (
                <KanbanLane
                  key={lane.id}
                  lane={lane}
                  tasks={laneTasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                />
              );
            })}
        </Box>
      </DragDropContext>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog
          open={!!selectedTask}
          task={selectedTask}
          onClose={handleCloseTaskDialog}
        />
      )}

      {/* Create Task Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTaskPriority}
              label="Priority"
              onChange={(e) =>
                setNewTaskPriority(e.target.value as TaskPriority)
              }
            >
              <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
              <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
              <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
              <MenuItem value={TaskPriority.CRITICAL}>Critical</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateTask}
            variant="contained"
            disabled={!newTaskTitle.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
