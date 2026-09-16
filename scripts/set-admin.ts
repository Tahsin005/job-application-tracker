import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import connectDB from "../lib/db";

async function setAdmin() {
    const targetEmail = process.env.TARGET_EMAIL || "tahsin.ferdous3546@gmail.com";

    console.log(`Connecting to database to promote ${targetEmail} to admin...`);

    const mongooseInstance = await connectDB();
    const db = mongooseInstance.connection.db;

    if (!db) {
        throw new Error("Failed to access database instance.");
    }

    const userCol = db.collection("user");

    const existingUser = await userCol.findOne({ email: targetEmail });
    if (!existingUser) {
        console.error(`User with email ${targetEmail} not found in database!`);
        process.exit(1);
    }

    console.log(`Found user: ${existingUser.name} (${existingUser.email}), current isAdmin: ${existingUser.isAdmin}, role: ${existingUser.role}`);

    const result = await userCol.updateOne(
        { email: targetEmail },
        {
            $set: {
                isAdmin: true,
                role: "admin",
            },
        }
    );

    console.log(`Successfully updated ${result.modifiedCount} document(s).`);

    const updatedUser = await userCol.findOne({ email: targetEmail });
    console.log("Updated user record:", {
        id: updatedUser?._id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        isAdmin: updatedUser?.isAdmin,
        role: updatedUser?.role,
    });

    process.exit(0);
}

setAdmin().catch((err) => {
    console.error("Error setting admin role:", err);
    process.exit(1);
});
