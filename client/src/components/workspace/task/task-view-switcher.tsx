import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Fragment, useState } from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import {getAllTasksQueryFn, updateBulkTaskMutationFn} from "@/lib/api.ts";
import useWorkspaceId from "@/hooks/use-workspace-id.ts";
import useTaskTableFilter from "@/hooks/use-task-table-filter.ts";
import { useQueryState } from "nuqs";

import { DataKanban } from "@/components/workspace/task/kanban/data-kanban.tsx";
import { DataCalendar } from "@/components/workspace/task/calendar/data-calendar.tsx";
import TaskTable from "@/components/workspace/task/task-table.tsx";
import { DottedSeparator } from "@/components/resuable/dotted-separator.tsx";

import {AllTaskResponseType } from "@/types/api.type.ts";
import { TaskStatusEnumType } from "@/constant";
import {toast} from "@/hooks/use-toast.ts";

export const TaskViewSwitcher = () => {
    const param = useParams();
    const workspaceId = useWorkspaceId();
    const projectId = param.projectId as string;
    const queryClient = useQueryClient();


    const [pageNumber] = useState(1);
    const [pageSize] = useState(2000);
    const [filters] = useTaskTableFilter();

    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table",
    });

    const { mutate } = useMutation({
        mutationFn: updateBulkTaskMutationFn,
    });

    // Fetch tasks from API
    const { data, isLoading } = useQuery<AllTaskResponseType>({
        queryKey: ["all-tasks", workspaceId, pageSize, pageNumber, filters, projectId],
        queryFn: () =>
            getAllTasksQueryFn({
                workspaceId,
                keyword: filters.keyword,
                priority: filters.priority,
                projectId: projectId || filters.projectId,
                assignedTo: filters.assigneeId,
                status: filters.status,
                pageNumber,
                pageSize,
            }),
        staleTime: 0,
    });

    // Handle Kanban updates
    const onKanbanChange = (updatedTasks: {$id: string; status: TaskStatusEnumType; position: number }[]) => {
        console.log("Updated Kanban Tasks:", updatedTasks);

        updatedTasks.forEach((task) => {
            const payload = {
                workspaceId,
                projectId: projectId ? projectId : "",
                taskId: task.$id,
                data: {
                    status: task.status,
                    position: task.position,
                },
            };

            mutate(payload, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["project-analytics", projectId] });
                    queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });

                    toast({ title: "Success", description: "Task updated successfully", variant: "success" });
                },
                onError: (error) => {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                },
            });
        });
    };



    return (
        <Tabs defaultValue={view} onValueChange={setView} className="flex-1 w-full rounded-lg border">
            <div className="h-full flex flex-col overflow-auto p-4">
                <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
                            Table
                        </TabsTrigger>
                        <TabsTrigger className="h-8 w-full lg:w-auto" value="kanban">
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger className="h-8 w-full lg:w-auto" value="calendar">
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                </div>
                <DottedSeparator className="my-4" />

                <Fragment>
                    <TabsContent value="table" className="mt-0">
                        <TaskTable />
                    </TabsContent>

                    <TabsContent value="kanban" className="mt-0">
                        {isLoading ? (
                            <p>Loading Kanban...</p>
                        ) : (
                            <DataKanban data={data ? data.tasks : []} onChange={onKanbanChange} />
                        )}
                    </TabsContent>

                    <TabsContent value="calendar" className="mt-0">
                        {isLoading ? (
                            <p>Loading Calendar...</p>
                        ) : (
                            <DataCalendar data={data ? data.tasks : []} />
                        )}
                    </TabsContent>
                </Fragment>
            </div>
        </Tabs>
    );
};
