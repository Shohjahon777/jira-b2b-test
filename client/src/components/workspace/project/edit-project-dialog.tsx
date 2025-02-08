import { Edit3 } from "lucide-react";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import EditProjectForm from "./edit-project-form";
import { ProjectType } from "@/types/api.type";
import { useState } from "react";
import Logo from "@/components/logo";

const EditProjectDialog = (props: { project?: ProjectType }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <div>
      <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="mt-1.5" asChild>
          <button>
            <Edit3 className="w-5 h-5" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg border-0">
          <DialogTitle>
            <div className="flex h-[30px] items-center justify-center w-full px-1">
              <Logo />
              <div className="hidden md:flex ml-2 items-center gap-2 self-center font-medium">
                Team Sync.
              </div>
            </div>
          </DialogTitle>
          <EditProjectForm project={props.project} onClose={onClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditProjectDialog;
