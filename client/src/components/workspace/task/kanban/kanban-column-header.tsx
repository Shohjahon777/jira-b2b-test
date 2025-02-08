import React from "react";
import { snakeCaseToTitleCase } from "@/lib/utils";
import {
    CircleCheckIcon,
    CircleDashedIcon,
    CircleDotDashedIcon,
    CircleDotIcon,
    CircleIcon,
    // PlusIcon,
} from "lucide-react";
// import { Button } from "@/components/ui/button";
// import useCreateTaskDialog from "@/hooks/use-create-task-dialog.ts";
import { TaskStatusEnumType } from "@/constant";

interface KanbanColumnHeaderProps {
    board: TaskStatusEnumType;
    taskCount: number;
}

const statusIconMap: Record<TaskStatusEnumType, React.ReactNode> = {
    BACKLOG: <CircleDashedIcon className="size-[18px] text-pink-400" />,
    TODO: <CircleIcon className="size-[18px] text-red-400" />,
    IN_PROGRESS: <CircleDotDashedIcon className="size-[18px] text-yellow-400" />,
    IN_REVIEW: <CircleDotIcon className="size-[18px] text-blue-400" />,
    DONE: <CircleCheckIcon className="size-[18px] text-emerald-400" />,
};

export const KanbanColumnHeader = ({ board, taskCount }: KanbanColumnHeaderProps) => {
    // const { onOpen } = useCreateTaskDialog();
    const icon = statusIconMap[board];

    return (
        <div className="px-2 py-1.5 flex items-center justify-center">
            <div className="flex items-center gap-x-2">
                {icon}
                <h2 className="text-sm font-medium">{snakeCaseToTitleCase(board)}</h2>
                <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 text-xs text-neutral-700 font-medium">
                    {taskCount}
                </div>
            </div>
            {/*<Button onClick={onOpen} variant="ghost" size="icon" className="size-5">*/}
            {/*    <PlusIcon className="size-4 text-neutral-500" />*/}
            {/*</Button>*/}
        </div>
    );
};
