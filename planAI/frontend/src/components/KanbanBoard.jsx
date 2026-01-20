import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import '../styles/KanbanBoard.css';

/**
 * KanbanBoard Component
 * Displays tasks in a kanban board layout with drag and drop
 */
const KanbanBoard = ({ tasks, onTaskUpdate, onTaskEdit, onTaskDelete }) => {
  const [columns, setColumns] = useState({
    todo: [],
    'in-progress': [],
    done: [],
  });

  useEffect(() => {
    // Organize tasks by status
    const organized = {
      todo: tasks.filter((t) => t.status === 'todo'),
      'in-progress': tasks.filter((t) => t.status === 'in-progress'),
      done: tasks.filter((t) => t.status === 'done'),
    };
    setColumns(organized);
  }, [tasks]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // No change in position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const task = sourceColumn.find((t) => t._id === draggableId);

    // Moving within the same column
    if (source.droppableId === destination.droppableId) {
      const newColumn = Array.from(sourceColumn);
      newColumn.splice(source.index, 1);
      newColumn.splice(destination.index, 0, task);

      setColumns({
        ...columns,
        [source.droppableId]: newColumn,
      });
    } else {
      // Moving to a different column
      const newSourceColumn = Array.from(sourceColumn);
      const newDestColumn = Array.from(destColumn);

      newSourceColumn.splice(source.index, 1);
      newDestColumn.splice(destination.index, 0, task);

      setColumns({
        ...columns,
        [source.droppableId]: newSourceColumn,
        [destination.droppableId]: newDestColumn,
      });

      // Update task status on backend
      await onTaskUpdate(task._id, { status: destination.droppableId });
    }
  };

  const columnConfig = [
    { id: 'todo', title: 'To Do', color: '#64748b' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#10b981' },
  ];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {columnConfig.map((column) => (
          <div key={column.id} className="kanban-column">
            <div
              className="column-header"
              style={{ borderTopColor: column.color }}
            >
              <h3>{column.title}</h3>
              <span className="task-count">{columns[column.id].length}</span>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`column-content ${
                    snapshot.isDraggingOver ? 'dragging-over' : ''
                  }`}
                >
                  {columns[column.id].map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <TaskCard
                          task={task}
                          onEdit={onTaskEdit}
                          onDelete={onTaskDelete}
                          provided={provided}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {columns[column.id].length === 0 && (
                    <div className="empty-column">
                      <p>No tasks</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
