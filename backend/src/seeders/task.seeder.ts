import "dotenv/config"
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import TaskModel from "../models/task.model";
import {sampleTasks} from "./task.sample";


const seedTasks = async () => {
    console.log("Seeding task started...");
    try {
        await connectDatabase();

        const session = await mongoose.startSession();
        session.startTransaction();

        console.log("Clearing existing tasks...");
        await TaskModel.deleteMany(); // Remove existing tasks (optional)
        console.log("🗑 Old tasks removed");

        const insertedTasks = await TaskModel.insertMany(sampleTasks);
        console.log(`✅ Seeded ${insertedTasks.length} tasks`);

        await session.commitTransaction();
        console.log("Transaction committed.");

        await session.endSession();
        console.log("Session ended.");

        console.log("Seeding completed successfully.");
    } catch (error) {
        console.error("Error during seeding:", error);
    }
};

seedTasks().catch((error) =>
    console.error("Error running seed script:", error)
);