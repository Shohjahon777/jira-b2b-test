import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { TaskType } from "@/types/api.type";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { deleteTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import EditTaskDialog from "@/components/workspace/task/edit-task-dialog";

interface DataTableRowActionsProps {
  row: Row<TaskType>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  // Extract task details
  const { _id: taskId, taskCode, project } = row.original;
  const projectId = project?._id;

  // State for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Mutation for deleting a task
  const { mutate: deleteTask, isPending: isDeleting } = useMutation({
    mutationFn: deleteTaskMutationFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
      toast({ title: "Task Deleted", description: data.message, variant: "success" });
      setOpenDeleteDialog(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleDelete = () => {
    deleteTask({ workspaceId, taskId });
  };

  return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            {/* Edit Task */}
            <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => e.preventDefault()}
                onClick={(e) => e.stopPropagation()}
            >
              <EditTaskDialog
                  projectId={projectId}
                  taskId={taskId}
                  trigger={<span className="w-full">Edit Task</span>}
              />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Delete Task */}
            <DropdownMenuItem
                className="!text-destructive cursor-pointer"
                onClick={() => setOpenDeleteDialog(true)}
            >
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Confirm Dialog for Delete */}
        <ConfirmDialog
            isOpen={openDeleteDialog}
            isLoading={isDeleting}
            onClose={() => setOpenDeleteDialog(false)}
            onConfirm={handleDelete}
            title="Delete Task"
            description={`Are you sure you want to delete task "${taskCode}"?`}
            confirmText="Delete"
            cancelText="Cancel"
        />
      </>
  );
}
