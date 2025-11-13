import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/authSlice';
import { fetchBoardById } from '../store/boardSlice';
import { fetchTasks, moveTask, optimisticMoveTask, createTask } from '../store/taskSlice';
import LaneColumn from '../components/LaneColumn';
import CreateTaskDialog from '../components/CreateTaskDialog';
import TaskDetailModal from '../components/TaskDetailModal';
import { Task, TaskPriority } from '../types';

export default function KanbanBoard() {
  const navigate = useNavigate();
  const { workspaceId, boardId } = useParams<{ workspaceId: string; boardId: string }>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentWorkspace } = useAppSelector((state) => state.workspace);
  const { currentBoard, isLoading: boardLoading } = useAppSelector((state) => state.board);
  const { tasks, isLoading: tasksLoading } = useAppSelector((state) => state.task);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardById(boardId));
      dispatch(fetchTasks({ boardId }));
    }
  }, [boardId, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleBack = () => {
    navigate(`/workspaces/${workspaceId}/boards`);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTask(null);
  };

  const handleAddTask = (laneId: string) => {
    setSelectedLaneId(laneId);
    setCreateTaskDialogOpen(true);
  };

  const handleCreateTask = async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
  }) => {
    if (!boardId || !selectedLaneId) return;

    await dispatch(
      createTask({
        boardId,
        laneId: selectedLaneId,
        ...data,
      })
    );

    setCreateTaskDialogOpen(false);
    setSelectedLaneId(null);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const taskId = draggableId;
    const newLaneId = destination.droppableId;
    const newPosition = destination.index;

    // Optimistic update
    dispatch(
      optimisticMoveTask({
        taskId,
        laneId: newLaneId,
        position: newPosition,
      })
    );

    // API call
    try {
      await dispatch(
        moveTask({
          id: taskId,
          data: {
            laneId: newLaneId,
            position: newPosition,
          },
        })
      ).unwrap();
    } catch (error) {
      // Revert on error by refetching
      if (boardId) {
        dispatch(fetchTasks({ boardId }));
      }
    }
  };

  if ((boardLoading || tasksLoading) && !currentBoard) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentBoard) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Board not found</Typography>
      </Box>
    );
  }

  const lanes = currentBoard.lanes || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={handleBack} edge="start" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {currentBoard.name}
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Breadcrumbs */}
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Breadcrumbs>
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
            onClick={handleBack}
            sx={{ cursor: 'pointer' }}
          >
            {currentWorkspace?.name || 'Boards'}
          </Link>
          <Typography color="text.primary">{currentBoard.name}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Kanban Board */}
      <Box
        sx={{
          flexGrow: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          bgcolor: 'grey.100',
          p: 3,
        }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              minHeight: '100%',
              pb: 2,
            }}
          >
            {lanes.map((lane) => (
              <LaneColumn
                key={lane.id}
                lane={lane}
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
              />
            ))}

            {lanes.length === 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No lanes in this board. Create lanes to get started.
                </Typography>
              </Box>
            )}
          </Box>
        </DragDropContext>
      </Box>

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTask?.id || null}
        open={!!selectedTask}
        onClose={handleCloseTaskDetail}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createTaskDialogOpen}
        onClose={() => {
          setCreateTaskDialogOpen(false);
          setSelectedLaneId(null);
        }}
        onSubmit={handleCreateTask}
      />
    </Box>
  );
}
