import { z } from "zod";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformOptions,
} from "@/lib/helper";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { getTaskByIdQueryFn, updateTaskMutationFn } from "@/lib/api";
import {useEffect, useState} from "react";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EditTaskFormProps {
  projectId?: string;
  taskId: string;
  onClose: () => void;
}

export default function EditTaskForm({ projectId, taskId, onClose }: EditTaskFormProps) {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const [isLoadingTask, setIsLoadingTask] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: updateTaskMutationFn,
  });

  const { data, isLoading } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    skip: !!projectId,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);

  const projects = data?.projects || [];
  const members = memberData?.members || [];

    const projectOptions = projects?.map((project) => {
        return {
            label: (
                <div className="flex items-center gap-1">
                    <span>{project.emoji}</span>
                    <span>{project.name}</span>
                </div>
            ),
            value: project._id,
        };
    });

  const membersOptions = members?.map((member) => {
    const name = member.userId?.name || "Unknown";
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);

    return {
      label: (
          <div className="flex items-center space-x-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
              <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
            </Avatar>
            <span>{name}</span>
          </div>
      ),
      value: member.userId._id,
    };
  });

  const formSchema = z.object({
    title: z.string().trim().min(1, {
      message: "Title is required",
    }),
    description: z.string().trim(),
    projectId: z.string().trim().min(1, {
      message: "Project is required",
    }),
    status: z.enum(
        Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
        {
          required_error: "Status is required",
        }
    ),
    priority: z.enum(
        Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
        {
          required_error: "Priority is required",
        }
    ),
    assignedTo: z.string().trim().min(1, {
      message: "AssignedTo is required",
    }),
    dueDate: z.date({
      required_error: "A date of birth is required.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: projectId || "",
      status: TaskStatusEnum.TODO,
      priority: TaskPriorityEnum.MEDIUM,
      assignedTo: "",
      dueDate: new Date(),
    },
  });

  useEffect(() => {
    if (!taskId || !projectId || !workspaceId) {
      console.warn("Missing required IDs:", { taskId, projectId, workspaceId });
      return;
    }
    if (taskId && projectId && workspaceId) {
      (async () => {
        try {
          setIsLoadingTask(true);
          const taskData = await getTaskByIdQueryFn({
            workspaceId,
            projectId,
            taskId,
          });

          if (taskData?.task) {
            form.reset({
              title: taskData.task.title || "",
              description: taskData.task.description || "",
              projectId: taskData.task.project?._id || projectId || "",
              status: taskData.task.status || TaskStatusEnum.TODO,
              priority: taskData.task.priority || TaskPriorityEnum.MEDIUM,
              assignedTo: taskData.task.assignedTo?._id || "",
              dueDate: taskData.task.dueDate ? new Date(taskData.task.dueDate) : new Date(),
            });
          }
        } catch (error) {
          console.error("Failed to fetch task:", error);
          toast({ title: "Error", description: "Failed to fetch task details", variant: "destructive" });
        } finally {
          setIsLoadingTask(false);
        }
      })();
    }
  }, [taskId, projectId, workspaceId]);

  const taskStatusList = Object.values(TaskStatusEnum);
  const taskPriorityList = Object.values(TaskPriorityEnum);

  const statusOptions = transformOptions(taskStatusList);
  const priorityOptions = transformOptions(taskPriorityList);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted with values:", values);
    if (isPending) return;

    const payload = {
      workspaceId,
      projectId: projectId ? projectId : "",
      taskId,
      data: {
        ...values,
        dueDate: values.dueDate.toISOString(),
      },
    };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["project-analytics", projectId] });
        queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });

        toast({ title: "Success", description: "Task updated successfully", variant: "success" });
        onClose();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  };

  if (isLoadingTask) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin" /></div>;
  }
  

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        <div className="mb-5 pb-2 border-b">
          <h1 className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1 text-center sm:text-left">
            Edit Task
          </h1>
          <p className="text-muted-foreground text-sm leading-tight">
            Update task details and manage resources
          </p>
        </div>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Task title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Website Redesign"
                        className="!h-[48px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Task description
                      <span className="text-xs font-extralight ml-2">
                        Optional
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={1} placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!projectId && (
              <div>
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoading && (
                            <div className="my-2">
                              <Loader className="w-4 h-4 place-self-center flex animate-spin" />
                            </div>
                          )}
                          <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                            {projectOptions?.map((option) => (
                              <SelectItem
                                key={option.value}
                                className="!capitalize cursor-pointer"
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div>
                  <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned To</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a assignee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                                  {membersOptions?.map((option) => (
                                      <SelectItem
                                          className="cursor-pointer"
                                          key={option.value}
                                          value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                  ))}
                                </div>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>

            <div className="!mt-2">
                  <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Due Date</FormLabel>
                              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                  <PopoverTrigger asChild>
                                      <FormControl>
                                          <Button
                                              variant={"outline"}
                                              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                              className={cn(
                                                  "w-full flex-1 pl-3 text-left font-normal",
                                                  !field.value && "text-muted-foreground"
                                              )}
                                          >
                                              {field.value ? (
                                                  format(field.value, "PPP")
                                              ) : (
                                                  <span>Pick a date</span>
                                              )}
                                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                      </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start" >
                                      <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={(date) => {
                                              field.onChange(date);
                                              setIsCalendarOpen(false); // Close the popover after selecting a date
                                          }}
                                          disabled={(date) =>
                                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                              date > new Date("2100-12-31")
                                          }
                                          initialFocus
                                          defaultMonth={new Date()}
                                          fromMonth={new Date()}
                                      />
                                  </PopoverContent>
                              </Popover>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>

            <div>
                  <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                      className="!text-muted-foreground !capitalize"
                                      placeholder="Select a status"
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions?.map((status) => (
                                    <SelectItem
                                        className="!capitalize"
                                        key={status.value}
                                        value={status.value}
                                    >
                                      {status.label}
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>

            <div>
            <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions?.map((priority) => (
                              <SelectItem
                                  className="!capitalize"
                                  key={priority.value}
                                  value={priority.value}
                              >
                                {priority.label}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )}
            />
      </div>

            <Button
              className="flex place-self-end h-[40px] text-white font-semibold"
              type="submit"
              disabled={isPending}
            >
              {isPending && <Loader className="animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}