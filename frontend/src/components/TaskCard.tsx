import { Card, CardContent, Typography, Chip, Box, Avatar, AvatarGroup } from '@mui/material';
import { Draggable } from 'react-beautiful-dnd';
import { Task, TaskPriority } from '../types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

const priorityColors: Record<TaskPriority, 'error' | 'warning' | 'info' | 'default'> = {
  CRITICAL: 'error',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'default',
};

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          sx={{
            mb: 2,
            cursor: 'pointer',
            backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
            '&:hover': {
              boxShadow: 3,
            },
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 500 }}>
                {task.title}
              </Typography>
              <Chip
                label={task.priority}
                size="small"
                color={priorityColors[task.priority]}
              />
            </Box>

            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {task.description}
              </Typography>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Box display="flex" gap={1} flexWrap="wrap">
                {task.labels && task.labels.length > 0 && (
                  <Box display="flex" gap={0.5}>
                    {task.labels.slice(0, 3).map((label) => (
                      <Chip
                        key={label.labelId}
                        label={label.label?.name}
                        size="small"
                        sx={{
                          backgroundColor: label.label?.color,
                          color: 'white',
                          height: 20,
                          fontSize: '0.7rem',
                        }}
                      />
                    ))}
                    {task.labels.length > 3 && (
                      <Chip
                        label={`+${task.labels.length - 3}`}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                )}

                {totalSubtasks > 0 && (
                  <Chip
                    label={`${completedSubtasks}/${totalSubtasks}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}

                {task.comments && task.comments.length > 0 && (
                  <Chip
                    label={`💬 ${task.comments.length}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>

              {task.assignees && task.assignees.length > 0 && (
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                  {task.assignees.map((assignee) => (
                    <Avatar key={assignee.userId} sx={{ bgcolor: 'primary.main' }}>
                      {assignee.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  ))}
                </AvatarGroup>
              )}
            </Box>

            {task.dueDate && (
              <Typography
                variant="caption"
                color={new Date(task.dueDate) < new Date() ? 'error' : 'text.secondary'}
                display="block"
                mt={1}
              >
                Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}
