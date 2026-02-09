import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import '../styles/KanbanBoard.css';

const KanbanBoard = ({ tasks, onTaskUpdate, onTaskEdit, onTaskDelete }) => {
  const [columns, setColumns] = useState({
    todo: [],
    'in-progress': [],
    done: [],
  });

  useEffect(() => {
    const sortByPosition = (list) =>
      [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const organized = {
      todo: sortByPosition(tasks.filter((t) => t.status === 'todo')),
      'in-progress': sortByPosition(tasks.filter((t) => t.status === 'in-progress')),
      done: sortByPosition(tasks.filter((t) => t.status === 'done')),
    };
    setColumns(organized);
  }, [tasks]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const task = sourceColumn.find((t) => t._id === draggableId);

    if (source.droppableId === destination.droppableId) {
      const newColumn = Array.from(sourceColumn);
      newColumn.splice(source.index, 1);
      newColumn.splice(destination.index, 0, task);

      setColumns({
        ...columns,
        [source.droppableId]: newColumn,
      });

      try {
        await Promise.all(
          newColumn.map((item, index) =>
            onTaskUpdate(item._id, { position: index })
          )
        );
      } catch (error) {}
    } else {
      const newSourceColumn = Array.from(sourceColumn);
      const newDestColumn = Array.from(destColumn);

      newSourceColumn.splice(source.index, 1);
      newDestColumn.splice(destination.index, 0, task);

      setColumns({
        ...columns,
        [source.droppableId]: newSourceColumn,
        [destination.droppableId]: newDestColumn,
      });

      try {
        await Promise.all([
          ...newSourceColumn.map((item, index) =>
            onTaskUpdate(item._id, { position: index })
          ),
          ...newDestColumn.map((item, index) => {
            const updates = { position: index };
            if (item._id === draggableId) {
              updates.status = destination.droppableId;
            }
            return onTaskUpdate(item._id, updates);
          }),
        ]);
      } catch (error) {}
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
                      {(provided, snapshot) => (
                        <TaskCard
                          task={task}
                          onEdit={onTaskEdit}
                          onDelete={onTaskDelete}
                          provided={provided}
                          snapshot={snapshot}
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
