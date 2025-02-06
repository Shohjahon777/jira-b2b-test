import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { BadRequestException, NotFoundException } from "../utils/appError";

export const createTaskService = async (
    workspaceId: string,
    projectId: string,
    userId: string,
    body: {
        title: string;
        description?: string;
        priority: string;
        status: string;
        assignedTo?: string | null;
        dueDate?: string;
        position: number;
    }
) => {
    const { title, description, priority, status, assignedTo, dueDate } = body;

    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException("Project not found or does not belong to this workspace");
    }

    if (assignedTo) {
        const isAssignedUserMember = await MemberModel.exists({
            userId: assignedTo,
            workspaceId,
        });

        if (!isAssignedUserMember) {
            throw new Error("Assigned user is not a member of this workspace.");
        }
    }

    // Find the highest position in the same status column
    const lastTask = await TaskModel.findOne({ status, workspace: workspaceId })
        .sort({ position: -1 })
        .select("position");

    const newPosition = lastTask ? lastTask.position + 1000 : 1000;

    const task = new TaskModel({
        title,
        description,
        priority: priority || TaskPriorityEnum.MEDIUM,
        status: status || TaskStatusEnum.TODO,
        assignedTo,
        createdBy: userId,
        workspace: workspaceId,
        project: projectId,
        dueDate,
        position: newPosition,
    });

    await task.save();

    return { task };
};


export const updateTaskService = async (
    workspaceId: string,
    projectId: string,
    taskId: string,
    body: {
        title?: string;
        description?: string;
        priority?: string;
        status: string;
        assignedTo?: string | null;
        dueDate?: string;
    }
) => {
    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "Project not found or does not belong to this workspace"
        );
    }

    const task = await TaskModel.findById(taskId);

    if (!task || task.project.toString() !== projectId.toString()) {
        throw new NotFoundException(
            "Task not found or does not belong to this project"
        );
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
        taskId,
        {
            ...body,
        },
        { new: true }
    );

    if (!updatedTask) {
        throw new BadRequestException("Failed to update task");
    }

    return { updatedTask };
};

export const getAllTasksService = async (
    workspaceId: string,
    filters: {
        projectId?: string;
        status?: string[];
        priority?: string[];
        assignedTo?: string[];
        keyword?: string;
        dueDate?: string;
    },
    pagination: {
        pageSize: number;
        pageNumber: number;
    }
) => {
    const query: Record<string, any> = {
        workspace: workspaceId,
    };

    if (filters.projectId) {
        query.project = filters.projectId;
    }

    if (filters.status && filters.status?.length > 0) {
        query.status = { $in: filters.status };
    }

    if (filters.priority && filters.priority?.length > 0) {
        query.priority = { $in: filters.priority };
    }

    if (filters.assignedTo && filters.assignedTo?.length > 0) {
        query.assignedTo = { $in: filters.assignedTo };
    }

    if (filters.keyword && filters.keyword !== undefined) {
        query.title = { $regex: filters.keyword, $options: "i" };
    }

    if (filters.dueDate) {
        query.dueDate = {
            $eq: new Date(filters.dueDate),
        };
    }

    //Pagination Setup
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;

    const [tasks, totalCount] = await Promise.all([
        TaskModel.find(query)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 })
            .populate("assignedTo", "_id name profilePicture -password")
            .populate("project", "_id emoji name"),
        TaskModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        tasks,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    };
};

export const getTaskByIdService = async (
    workspaceId: string,
    projectId: string,
    taskId: string
) => {
    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "Project not found or does not belong to this workspace"
        );
    }

    const task = await TaskModel.findOne({
        _id: taskId,
        workspace: workspaceId,
        project: projectId,
    }).populate("assignedTo", "_id name profilePicture -password");

    if (!task) {
        throw new NotFoundException("Task not found.");
    }

    return task;
};

export const deleteTaskService = async (
    workspaceId: string,
    taskId: string
) => {
    const task = await TaskModel.findOneAndDelete({
        _id: taskId,
        workspace: workspaceId,
    });

    if (!task) {
        throw new NotFoundException(
            "Task not found or does not belong to the specified workspace"
        );
    }

    return;
};

//
// export const updateBulkTaskService = async (
//     workspaceId: string,
//     projectId: string,
//     body: {
//         title?: string;
//         description?: string;
//         priority?: string;
//         status?: string;
//         assignedTo?: string | null;
//         dueDate?: string;
//     }
// ) => {
//     const project = await ProjectModel.findById(projectId);
//
//     if (!project || project.workspace.toString() !== workspaceId.toString()) {
//         throw new NotFoundException(
//             "Project not found or does not belong to this workspace"
//         );
//     }
//
//     // Find all tasks that belong to this project
//     const tasks = await TaskModel.find({ project: projectId });
//
//     if (!tasks.length) {
//         throw new NotFoundException("No tasks found for this project");
//     }
//
//     // Bulk update all tasks in the project
//     const updateResult = await TaskModel.updateMany(
//         { project: projectId }, // Filter: Only update tasks in this project
//         { $set: body } // Update: Apply all fields dynamically
//     );
//
//     if (updateResult.modifiedCount === 0) {
//         throw new BadRequestException("No tasks were updated");
//     }
//
//     // Fetch and return updated tasks
//     const updatedTasks = await TaskModel.find({ project: projectId });
//
//     return { updatedTasks };
// };
