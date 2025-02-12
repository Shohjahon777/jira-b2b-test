import { z } from "zod";
import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";

export const titleSchema = z.string().trim().min(1).max(255);
export const descriptionSchema = z.string().trim().optional();
export const updatetitleSchema = z.string().trim().min(1).max(255).optional();
export const assignedToSchema = z
    .union([
        z.string().trim().min(1),  // Single user
        z.array(z.string().trim().min(1)) // Multiple users
    ])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .nullable()
    .optional();



export const prioritySchema = z.enum(
    Object.values(TaskPriorityEnum) as [string, ...string[]]
);

export const updateprioritySchema = z.enum(
    Object.values(TaskPriorityEnum) as [string, ...string[]]
).optional();

export const statusSchema = z.enum(
    Object.values(TaskStatusEnum) as [string, ...string[]]
);

export const dueDateSchema = z
    .string()
    .trim()
    .optional()
    .refine(
        (val) => {
            return !val || !isNaN(Date.parse(val));
        },
        {
            message: "Invalid date format. Please provide a valid date string.",
        }
    );

export const taskIdSchema = z.string().trim().min(1);

export const createTaskSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    priority: prioritySchema,
    status: statusSchema,
    assignedTo: assignedToSchema,
    dueDate: dueDateSchema,
});

export const updateTaskSchema = z.object({
    title: updatetitleSchema,
    description: descriptionSchema,
    priority: updateprioritySchema,
    status: statusSchema,
    assignedTo: assignedToSchema,
    dueDate: dueDateSchema,
});