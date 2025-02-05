import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EditTaskForm from "./edit-task-form";

interface EditTaskDialogProps {
    projectId?: string;
    taskId: string;
    trigger: React.ReactNode;
}

const EditTaskDialog = ({ projectId, taskId, trigger }: EditTaskDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);


    const onClose = () => {
        setIsOpen(false);
    };
    return (
        <div>
            <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
                    <EditTaskForm projectId={projectId} taskId={taskId} onClose={onClose} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditTaskDialog;
