import { Box, Typography, Paper, IconButton, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Lane, Task } from '../types';
import TaskCard from './TaskCard';

interface LaneColumnProps {
  lane: Lane;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (laneId: string) => void;
}

export default function LaneColumn({ lane, tasks, onTaskClick, onAddTask }: LaneColumnProps) {
  const tasksInLane = tasks.filter((task) => task.laneId === lane.id);
  const isAtWipLimit = lane.wipLimit && tasksInLane.length >= lane.wipLimit;

  return (
    <Paper
      elevation={1}
      sx={{
        width: 320,
        minWidth: 320,
        maxWidth: 320,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.50',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Lane Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {lane.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={tasksInLane.length}
              size="small"
              color={isAtWipLimit ? 'error' : 'default'}
            />
            {lane.wipLimit && (
              <Typography variant="caption" color="text.secondary">
                / {lane.wipLimit}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Add Task Button */}
        <IconButton
          size="small"
          onClick={() => onAddTask(lane.id)}
          disabled={!!isAtWipLimit}
          sx={{
            width: '100%',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            borderStyle: 'dashed',
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tasks List with Drag & Drop */}
      <Droppable droppableId={lane.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              p: 2,
              flexGrow: 1,
              overflowY: 'auto',
              minHeight: 200,
              bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
              transition: 'background-color 0.2s ease',
            }}
          >
            {tasksInLane.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.8 : 1,
                    }}
                  >
                    <TaskCard task={task} onClick={onTaskClick} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {tasksInLane.length === 0 && (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  color: 'text.secondary',
                }}
              >
                <Typography variant="body2">No tasks</Typography>
              </Box>
            )}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
}
