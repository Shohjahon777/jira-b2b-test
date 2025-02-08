import { parseAsBoolean, useQueryState } from "nuqs";

const useCreateTaskDialog = () => {
    const [open, setOpen] = useQueryState(
        "new-task",
        parseAsBoolean.withDefault(false)
    );
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    return {
        open,
        onOpen,
        onClose,
    };
};

export default useCreateTaskDialog;