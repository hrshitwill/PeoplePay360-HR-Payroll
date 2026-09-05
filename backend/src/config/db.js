const mongoose = require("mongoose");
const Employee = require("../models/Employee");

let memoryServerInstance = null;

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        if (uri) {
            try {
                await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
                console.log("MongoDB connected successfully to:", uri.replace(/:([^:@]+)@/, ":****@"));
            } catch (uriErr) {
                console.warn("Could not connect to provided MONGO_URI, switching to in-memory MongoDB:", uriErr.message);
                uri = null;
            }
        }

        if (!uri) {
            const { MongoMemoryServer } = require("mongodb-memory-server");
            memoryServerInstance = await MongoMemoryServer.create();
            const memUri = memoryServerInstance.getUri();
            process.env.MONGO_URI = memUri;
            await mongoose.connect(memUri);
            console.log("Connected to embedded In-Memory MongoDB successfully");
        }

        // Auto-seed if database is empty
        const count = await Employee.countDocuments();
        if (count === 0) {
            console.log("Database is empty. Automatically seeding 400-employee enterprise dataset...");
            const seedLargeDataset = require("../scripts/seedLargeDataset");
            await seedLargeDataset();
            console.log("Initial enterprise dataset seeding complete!");
        }

        // Ensure all legacy demo accounts are set to INACTIVE so users must register/login with their own ID
        const User = require("../models/User");
        await User.updateMany(
            { email: { $in: ["admin@peoplepay360.com", "sarah.jenkins@peoplepay360.com", "david.kim@peoplepay360.com", "elena.rostova@peoplepay360.com", "alex.morgan@peoplepay360.com"] } },
            { $set: { status: "INACTIVE" } }
        );
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;