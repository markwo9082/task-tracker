import { Box, Typography, Paper, IconButton, Badge } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Droppable } from 'react-beautiful-dnd';
import { Lane, Task } from '../types';
import TaskCard from './TaskCard';

interface KanbanLaneProps {
  lane: Lane;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (laneId: string) => void;
}

export default function KanbanLane({
  lane,
  tasks,
  onTaskClick,
  onAddTask,
}: KanbanLaneProps) {
  const isAtWipLimit = lane.wipLimit && tasks.length >= lane.wipLimit;

  return (
    <Paper
      sx={{
        width: 300,
        minWidth: 300,
        maxWidth: 300,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: isAtWipLimit ? 'warning.light' : 'background.paper',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" component="h2">
            {lane.name}
          </Typography>
          <Badge badgeContent={tasks.length} color="primary" />
          {lane.wipLimit && (
            <Typography variant="caption" color="text.secondary">
              (WIP: {lane.wipLimit})
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={() => onAddTask(lane.id)} color="primary">
          <AddIcon />
        </IconButton>
      </Box>

      <Droppable droppableId={lane.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'background.default',
              minHeight: 200,
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={100}
              >
                <Typography variant="body2" color="text.secondary">
                  No tasks
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
}
