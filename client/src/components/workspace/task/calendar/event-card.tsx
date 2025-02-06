// import { useRouter } from "next/navigation";
// import useWorkspaceId from "@/hooks/use-workspace-id.ts";
import {cn} from "@/lib/utils.ts";
import {TaskStatusEnum} from "@/constant";
import {MemberAvatar} from "@/components/workspace/member/member-avatar.tsx";

interface EventCardProps {
    // id: string;
    title: string;
    assignedTo: {
        _id: string;
        name: string;
        profilePicture: string | null;
    } | null;
    status: keyof typeof TaskStatusEnum;
}

const statusColorMap: Record<keyof typeof TaskStatusEnum, string> = {
    [TaskStatusEnum.BACKLOG]: "border-l-pink-500",
    [TaskStatusEnum.TODO]: "border-l-red-500",
    [TaskStatusEnum.IN_PROGRESS]: "border-l-yellow-500",
    [TaskStatusEnum.IN_REVIEW]: "border-l-blue-500",
    [TaskStatusEnum.DONE]: "border-l-emerald-500",
};
export const EventCard = ({
                                // id,
                              title,
                              assignedTo,
                              status,
                          }: EventCardProps) => {
    // const workspaceId = useWorkspaceId();
    // const router = useRouter();

    // const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    //     e.stopPropagation();
    //     router.push(`/workspaces/${workspaceId}/project/${id}`);
    // };

    return (
        <div className="px-2">
            <div
                // onClick={onClick}
                className={cn(
                    "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
                    statusColorMap[status]
                )}
            >
                <p>{title}</p>
                <div className="flex items-center gap-x-1">
                    {assignedTo ? (
                        <>
                            <MemberAvatar name={assignedTo.name} />
                        </>
                    ) : (
                        <p className="text-gray-400">Unassigned</p> // Show placeholder
                    )}
                </div>

            </div>
        </div>
    );
};
