import { TaskDate } from "../task-date.tsx"
import {TaskType} from "@/types/api.type.ts";
import {DottedSeparator} from "@/components/resuable/dotted-separator.tsx";
import {MemberAvatar} from "@/components/workspace/member/member-avatar.tsx";
import {ProjectAvatar} from "@/components/workspace/project/project-avatar.tsx";

interface KanbanCardProps {
    task: TaskType;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
    return (
        <div className="bg-white p-2.5 mb-1.5 rounded shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-x-2">
                <p className="text-sm line-clamp-2">{task.title}</p>
                {/*<TaskActions id={task.$id} projectId={task.projectId}>*/}
                {/*    <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover: opacity-75 transition" />*/}
                {/*</TaskActions>*/}
            </div>
            <DottedSeparator />
            <div className="flex items-center gap-x-1.5">
                {task.assignedTo.length > 0 &&
                    task.assignedTo.map( (user) => (<MemberAvatar name={user.name} fallbackClassName="text-[10px]" />))}
                <div className="size-1 rounded-full bg-neutral-300" />
                <TaskDate value={task.dueDate} className="text-xs" />
            </div>
            <div className="flex items-center gap-x-1.5">
                {task.project?.name && (
                    <ProjectAvatar
                    name={task.project?.name}
                    image={task.project?.emoji}
                    fallbackClassName="text-[10px]"
                />
                )}
                <span className="text-xs font-medium">{task.project?.name}</span>
            </div>
        </div>
    );
};
