import { useCallback, useState, useEffect } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";

import { TaskType } from "@/types/api.type.ts";
import { TaskStatusEnum, TaskStatusEnumType } from "@/constant";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

interface DataKanbanProps {
    data: TaskType[];
    onChange: (
        task: { $id: string; status: TaskStatusEnumType; position: number }[]
    ) => void;
}

const boards: TaskStatusEnumType[] = Object.keys(TaskStatusEnum) as TaskStatusEnumType[];

type TaskState = Record<TaskStatusEnumType, TaskType[]>;

export const DataKanban = ({ data, onChange }: DataKanbanProps) => {
    const [task, setTask] = useState<TaskState>(() => {
        const initialTasks: TaskState = {
            BACKLOG: [],
            TODO: [],
            IN_PROGRESS: [],
            IN_REVIEW: [],
            DONE: [],
        };

        data.forEach((t) => {
            initialTasks[t.status].push(t);
        });

        // Sort tasks in each status column
        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatusEnumType] = initialTasks[
                status as TaskStatusEnumType
                ].sort((a, b) => a.position - b.position);
        });

        return initialTasks;
    });

    useEffect(() => {
        const newTask: TaskState = {
            BACKLOG: [],
            TODO: [],
            IN_PROGRESS: [],
            IN_REVIEW: [],
            DONE: [],
        };

        data.forEach((t) => {
            newTask[t.status].push(t);
        });

        Object.keys(newTask).forEach((status) => {
            newTask[status as TaskStatusEnumType] = newTask[status as TaskStatusEnumType].sort(
                (a, b) => a.position - b.position
            );
        });

        setTask(newTask);
    }, [data]);

    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (!result.destination) return;

            const { source, destination } = result;
            const sourceStatus = source.droppableId as TaskStatusEnumType;
            const destinationStatus = destination.droppableId as TaskStatusEnumType;

            let updatesPayload: { $id: string; status: TaskStatusEnumType; position: number }[] = [];

            setTask((prevTasks) => {
                const newTasks = { ...prevTasks };

                // Remove task from source column
                const sourceColumn = [...newTasks[sourceStatus]];
                const [movedTask] = sourceColumn.splice(source.index, 1);

                if (!movedTask) {
                    console.error("No task found at the source index");
                    return prevTasks;
                }

                // Preserve original task properties, update only `status` and `position`
                const updatedMovedTask = {
                    ...movedTask,
                    status: destinationStatus,
                };

                newTasks[sourceStatus] = sourceColumn;

                // Add task to destination column
                const destinationColumn = [...newTasks[destinationStatus]];
                destinationColumn.splice(destination.index, 0, updatedMovedTask);
                newTasks[destinationStatus] = destinationColumn;

                // Prepare payload for updating positions
                updatesPayload = [];

                // Always update the moved task
                updatesPayload.push({
                    $id: updatedMovedTask._id,
                    status: updatedMovedTask.status,
                    position: Math.min((destination.index + 1) * 1000, 1_000_000),
                });

                // Update positions for affected tasks in destination column
                newTasks[destinationStatus].forEach((t, index) => {
                    if (t._id !== updatedMovedTask._id) {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                        if (t.position !== newPosition) {
                            updatesPayload.push({
                                $id: t._id,
                                status: t.status,
                                position: newPosition,
                            });
                        }
                    }
                });

                // If moved between columns, update source column positions
                if (sourceStatus !== destinationStatus) {
                    newTasks[sourceStatus].forEach((t, index) => {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                        if (t.position !== newPosition) {
                            updatesPayload.push({
                                $id: t._id,
                                status: sourceStatus,
                                position: newPosition,
                            });
                        }
                    });
                }

                return newTasks;
            });

            onChange(updatesPayload);
        },
        [onChange]
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {boards.map((board) => (
                    <div
                        key={board}
                        className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]"
                    >
                        <KanbanColumnHeader board={board} taskCount={task[board].length} />
                        <Droppable droppableId={board}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="min-h-[200px] py-1.5"
                                >
                                    {task[board].map((t, index) => (
                                        <Draggable
                                            key={t._id}
                                            draggableId={t._id}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <KanbanCard task={t} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};
