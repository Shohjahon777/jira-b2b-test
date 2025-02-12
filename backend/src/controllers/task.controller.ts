import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
    createTaskSchema,
    taskIdSchema,
    updateTaskSchema,
} from "../validation/task.validation";
import { projectIdSchema } from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
    createTaskService,
    deleteTaskService,
    getAllTasksService,
    getTaskByIdService,
    updateTaskService,
} from "../services/task.service";
import { HTTPSTATUS } from "../config/http.config";
import TaskModel from "../models/task.model";
// // import MemberModel from "../models/member.model";
// import {BadRequestException} from "../utils/appError";
// import UserModel from "../models/user.model";



export const createTaskController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        // Parse request data
        const body = createTaskSchema.parse(req.body);
        const projectId = projectIdSchema.parse(req.params.projectId);
        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        // Ensure assignedTo is always an array
        const assignedTo = body.assignedTo
            ? Array.isArray(body.assignedTo)
                ? body.assignedTo
                : [body.assignedTo]
            : undefined;

        // Check user permissions
        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.CREATE_TASK]);

        // Find the highest position task in the same status column
        const lastTask = await TaskModel.findOne({
            status: body.status,
            workspace: workspaceId
        }).sort({ position: -1 });

        // Assign new position
        const newPosition = lastTask ? lastTask.position + 1000 : 1000;

        // Create the task with the new position
        const { task } = await createTaskService(
            workspaceId,
            projectId,
            userId,
            {
                ...body,
                assignedTo: body.assignedTo ? (Array.isArray(body.assignedTo) ? body.assignedTo : [body.assignedTo]) : [],
                position: newPosition
            }
        );


        return res.status(HTTPSTATUS.OK).json({
            message: "Task created successfully",
            task,
        });
    }
);




// export const createTaskController = asyncHandler(
//     async (req: Request, res: Response) => {
//         const userId = req.user?._id;
//
//         const body = createTaskSchema.parse(req.body);
//         const projectId = projectIdSchema.parse(req.params.projectId);
//         const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
//
//         const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
//         roleGuard(role, [Permissions.CREATE_TASK]);
//
//         const { task } = await createTaskService(
//             workspaceId,
//             projectId,
//             userId,
//             body
//         );
//
//         return res.status(HTTPSTATUS.OK).json({
//             message: "Task created successfully",
//             task,
//         });
//     }
// );

export const updateTaskController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const body = updateTaskSchema.parse(req.body);

        const taskId = taskIdSchema.parse(req.params.id);
        const projectId = projectIdSchema.parse(req.params.projectId);
        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.EDIT_TASK]);

        const { updatedTask } = await updateTaskService(
            workspaceId,
            projectId,
            taskId,
            body
        );

        return res.status(HTTPSTATUS.OK).json({
            message: "Task updated successfully",
            task: updatedTask,
        });
    }
);

export const getAllTasksController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const filters = {
            projectId: req.query.projectId as string | undefined,
            status: req.query.status
                ? (req.query.status as string)?.split(",")
                : undefined,
            priority: req.query.priority
                ? (req.query.priority as string)?.split(",")
                : undefined,
            assignedTo: req.query.assignedTo
                ? (req.query.assignedTo as string)?.split(",")
                : undefined,
            keyword: req.query.keyword as string | undefined,
            dueDate: req.query.dueDate as string | undefined,
        };

        const pagination = {
            pageSize: parseInt(req.query.pageSize as string) || 10,
            pageNumber: parseInt(req.query.pageNumber as string) || 1,
        };

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.VIEW_ONLY]);

        const result = await getAllTasksService(workspaceId, filters, pagination);

        return res.status(HTTPSTATUS.OK).json({
            message: "All tasks fetched successfully",
            ...result,
        });
    }
);

export const getTaskByIdController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const taskId = taskIdSchema.parse(req.params.id);
        const projectId = projectIdSchema.parse(req.params.projectId);
        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.VIEW_ONLY]);

        const task = await getTaskByIdService(workspaceId, projectId, taskId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Task fetched successfully",
            task,
        });
    }
);

export const deleteTaskController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const taskId = taskIdSchema.parse(req.params.id);
        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.DELETE_TASK]);

        await deleteTaskService(workspaceId, taskId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Task deleted successfully",
        });
    }
);


// export const updateTaskBulkController = asyncHandler(
//     async (req: Request, res: Response) => {
//         const userId = req.user?._id;
//
//         const body = updateTaskSchema.parse(req.body);
//
//         // const taskId = taskIdSchema.parse(req.params.id);
//         const projectId = projectIdSchema.parse(req.params.projectId);
//         const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
//
//         const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
//         roleGuard(role, [Permissions.EDIT_TASK]);
//
//         const { updatedTasks } = await updateBulkTaskService(
//             workspaceId,
//             projectId,
//             body
//         );
//
//         return res.status(HTTPSTATUS.OK).json({
//             message: "Tasks updated successfully",
//             task: updatedTasks,
//         });
//     }
// );
