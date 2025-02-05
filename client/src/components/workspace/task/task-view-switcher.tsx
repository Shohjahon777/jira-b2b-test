import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {DottedSeparator} from "@/components/resuable/dotted-separator.tsx";
import {Fragment, useState} from "react";
import TaskTable from "@/components/workspace/task/task-table.tsx";
import useWorkspaceId from "@/hooks/use-workspace-id.ts";
import {useQueryState} from "nuqs";
import {useQuery} from "@tanstack/react-query";
import {getAllTasksQueryFn} from "@/lib/api.ts";
import {useParams} from "react-router-dom";
import useTaskTableFilter from "@/hooks/use-task-table-filter.ts";
import {DataCalendar} from "@/components/workspace/task/calendar/data-calendar.tsx";
import {AllTaskResponseType} from "@/types/api.type.ts";

export const TaskViewSwitcher = () => {
    const param = useParams();
    const workspaceId = useWorkspaceId();
    const projectId = param.projectId as string;

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [filters, setFilters] = useTaskTableFilter();

    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table",
    });




    const { data, isLoading } = useQuery<AllTaskResponseType>({
        queryKey: ["all-tasks", workspaceId, pageSize, pageNumber, filters, projectId,],
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


    return (
        <Tabs
            defaultValue={view}
            onValueChange={setView}
            className="flex-1 w-full rounded-lg border"
        >
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

                <Fragment >
                    <TabsContent value="table" className="mt-0">
                        <TaskTable />
                    </TabsContent>
                    <TabsContent value="kanban" className="mt-0">
                        {/*<DataKanban data={tasks?.documents ?? []} onChange={onKanbanChange} />*/}
                        Data Kanban
                    </TabsContent>
                    <TabsContent value="calendar" className="mt-0">
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : (
                            <DataCalendar data={data ? (data as AllTaskResponseType).tasks : []} />
                        )}
                    </TabsContent>

                </Fragment>
            </div>
            </Tabs>
    )
}