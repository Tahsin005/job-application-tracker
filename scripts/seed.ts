import connectDB from "../lib/db";
import "@/lib/models";
import { Board, Column, JobApplication, TopUpPackage, MfsProvider, AdminSettings } from "@/lib/models";
import {
    DEFAULT_TOP_UP_PACKAGES,
    DEFAULT_MFS_PROVIDERS,
    DEFAULT_MFS_SETTINGS,
} from "../lib/constants/top-up-defaults";

const USER_ID = "69ddd315fc2ab9cdb2059dcd";

const SAMPLE_JOBS = [
    // Wish List
    {
        company: "MU Company",
        position: "Software Developer",
        location: "San Francisco, CA",
        tags: ["React", "Tailwind", "High Pay"],
        description: "Build modern web applications using React and Tailwind CSS",
        jobUrl: "https://example.com/jobs/1",
        salary: "$120k - $150k",
    },
    {
        company: "Stripe",
        position: "Front End Developer",
        location: "Remote",
        tags: ["TypeScript", "React", "Next.js"],
        description: "Work on payment infrastructure frontend",
        jobUrl: "https://example.com/jobs/2",
        salary: "$130k - $160k",
    },
    {
        company: "Nutrishe",
        position: "QA Engineer",
        location: "New York, NY",
        tags: ["CIT", "Appium", "CI/CD"],
        description: "Ensure quality of mobile and web applications",
        jobUrl: "https://example.com/jobs/3",
        salary: "$90k - $110k",
    },
    // Applied
    {
        company: "LeaFood",
        position: "DevOps Engineer",
        location: "Austin, TX",
        tags: ["promQL", "Full-stack", "Docker"],
        description: "Manage infrastructure and deployment pipelines",
        jobUrl: "https://example.com/jobs/4",
        salary: "$110k - $140k",
    },
    {
        company: "Nomura",
        position: "Mobile Developer",
        location: "Tokyo, Japan",
        tags: ["React Native", "iOS", "Android"],
        description: "Develop mobile applications for financial services",
        jobUrl: "https://example.com/jobs/5",
        salary: "$100k - $130k",
    },
    {
        company: "Wise",
        position: "UI/UX Designer",
        location: "London, UK",
        tags: ["Figma", "Design Systems", "User Research"],
        description: "Design beautiful and intuitive user experiences",
        jobUrl: "https://example.com/jobs/6",
        salary: "$80k - $100k",
    },
    {
        company: "Danone",
        position: "DevOps Engineer",
        location: "Paris, France",
        tags: ["promQL", "Full-stack", "Docker"],
        description: "Support cloud infrastructure and CI/CD",
        jobUrl: "https://example.com/jobs/7",
        salary: "$95k - $120k",
    },
    // Interviewing
    {
        company: "Retomotion",
        position: "Web Designer",
        location: "Berlin, Germany",
        tags: ["Figma", "React", "Bootstrap"],
        description: "Create responsive web designs and implement them",
        jobUrl: "https://example.com/jobs/8",
        salary: "$85k - $105k",
        interviews: [
            {
                roundType: "Screening",
                scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                durationMinutes: 30,
                interviewerNames: "Lukas Weber (Talent Acquisition)",
                status: "passed",
                notes: "Discussed portfolio and past responsive web design projects.",
                feedback: "Strong visual sense and frontend familiarity. Recommended for technical round.",
            },
            {
                roundType: "Technical",
                customRoundName: "Portfolio & UI Coding Session",
                scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                durationMinutes: 60,
                interviewerNames: "Elena Rostova (Lead UI Designer)",
                meetingUrl: "https://meet.google.com/abc-defg-hij",
                location: "Google Meet",
                status: "scheduled",
                notes: "Prepare Figma component library walkthrough and live styling demo.",
            },
        ],
    },
    {
        company: "WorkLab",
        position: "Product Manager",
        location: "Seattle, WA",
        tags: ["Product Strategy", "Agile", "Analytics"],
        description:
            "Help drive the product and business planning for our platform",
        jobUrl: "https://example.com/jobs/9",
        salary: "$140k - $170k",
        interviews: [
            {
                roundType: "Screening",
                scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                durationMinutes: 30,
                interviewerNames: "David Kim (Recruiting Partner)",
                status: "passed",
                notes: "Initial phone screen on product background.",
            },
            {
                roundType: "Behavioral",
                customRoundName: "Leadership & Cross-Functional Alignment",
                scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                durationMinutes: 45,
                interviewerNames: "Rachel Green (Head of Product)",
                status: "passed",
                notes: "Covered conflict resolution and roadmap trade-offs.",
            },
            {
                roundType: "System Design",
                customRoundName: "Product Architecture & Analytics Deep Dive",
                scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                durationMinutes: 60,
                interviewerNames: "Marcus Vance (VP of Engineering)",
                meetingUrl: "https://meet.google.com/xyz-uvwx-rst",
                location: "Google Meet",
                status: "scheduled",
                notes: "Present feature metric funnel and product telemetry architecture.",
            },
        ],
    },
    {
        company: "I Networks",
        position: "Mobile Developer",
        location: "Remote",
        tags: ["Flutter", "Dart", "Firebase"],
        description: "Build cross-platform mobile applications",
        jobUrl: "https://example.com/jobs/10",
        salary: "$115k - $145k",
        interviews: [
            {
                roundType: "Technical",
                customRoundName: "Mobile State Management & Dart Live Coding",
                scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                durationMinutes: 60,
                interviewerNames: "Kenji Sato (Senior Staff Mobile Engineer)",
                meetingUrl: "https://zoom.us/j/9876543210",
                location: "Zoom",
                status: "scheduled",
                notes: "Review Bloc and Riverpod state management patterns and offline caching.",
            },
        ],
    },
    // Offer
    {
        company: "Profan",
        position: "Software Developer",
        location: "Stockholm, Sweden",
        tags: ["Node.js", "PostgreSQL", "AWS"],
        description: "Develop backend services and APIs",
        jobUrl: "https://example.com/jobs/11",
        salary: "$100k - $125k",
    },
    {
        company: "MUS Logistics",
        position: "UI Designer",
        location: "Amsterdam, Netherlands",
        tags: ["Figma", "Illustrator"],
        description:
        "Lead the UX process and workflow, and work closely with development team",
        jobUrl: "https://example.com/jobs/12",
        salary: "$90k - $110k",
    },
    // Rejected
    {
        company: "Ultra Vouche",
        position: "Associate",
        location: "Chicago, IL",
        tags: ["Scrum", "Agile"],
        description: "Support product development and project management",
        jobUrl: "https://example.com/jobs/13",
        salary: "$70k - $85k",
    },
    {
        company: "NRI",
        position: "Web Test",
        location: "Boston, MA",
        tags: ["Testing", "Automation"],
        description: "Manage product testing and quality assurance",
        jobUrl: "https://example.com/jobs/14",
        salary: "$75k - $90k",
    },
    {
        company: "TOG London",
        position: "Data Ana",
        location: "London, UK",
        tags: ["JavaScript", "Python", "SQL"],
        description: "Analyze user data and provide insights for product decisions",
        jobUrl: "https://example.com/jobs/15",
        salary: "$85k - $100k",
    },
];

async function seed() {
    if (!USER_ID) {
        console.error("❌ Error: SEED_USER_ID environment variable is required");
        console.log("Usage: SEED_USER_ID=your-user-id npm run seed");
        process.exit(1);
    }

    try {
        console.log("🌱 Starting seed process...");
        console.log(`📋 Seeding data for user ID: ${USER_ID}`);

        await connectDB();
        console.log("✅ Connected to database");

        // Find the user's board
        let board = await Board.findOne({ userId: USER_ID, name: "Job Hunt" });

        if (!board) {
            console.log("⚠️  Board not found. Creating board...");
            const { initializeUserBoard } = await import("../lib/init-user-board");
            board = await initializeUserBoard(USER_ID);
            console.log("✅ Board created");
        } else {
            console.log("✅ Board found");
        }

        // Get all columns
        const columns = await Column.find({ boardId: board._id }).sort({
            order: 1,
        });
        console.log(`✅ Found ${columns.length} columns`);

        if (columns.length === 0) {
            console.error(
                "❌ No columns found. Please ensure the board has default columns."
            );
            process.exit(1);
        }

        // Map column names to column IDs
        const columnMap: Record<string, string> = {};
        columns.forEach((col) => {
            columnMap[col.name] = col._id.toString();
        });

        // Clear existing job applications for this user
        const existingJobs = await JobApplication.find({ userId: USER_ID });
        if (existingJobs.length > 0) {
            console.log(
                `🗑️  Deleting ${existingJobs.length} existing job applications...`
            );
            await JobApplication.deleteMany({ userId: USER_ID });

            // Clear job applications from columns
            for (const column of columns) {
                column.jobApplications = [];
                await column.save();
            }
        }

        // Distribute jobs across columns
        const jobsByColumn: Record<string, typeof SAMPLE_JOBS> = {
            "Wish List": SAMPLE_JOBS.slice(0, 3),
            Applied: SAMPLE_JOBS.slice(3, 7),
            Interviewing: SAMPLE_JOBS.slice(7, 10),
            Offer: SAMPLE_JOBS.slice(10, 12),
            Rejected: SAMPLE_JOBS.slice(12, 15),
        };

        let totalCreated = 0;

        for (const [columnName, jobs] of Object.entries(jobsByColumn)) {
            const columnId = columnMap[columnName];
            if (!columnId) {
                console.warn(`⚠️  Column "${columnName}" not found, skipping...`);
                continue;
            }

            const column = columns.find((c) => c.name === columnName);
            if (!column) continue;

            for (let i = 0; i < jobs.length; i++) {
                const jobData = jobs[i];
                const jobApplication = await JobApplication.create({
                    company: jobData.company,
                    position: jobData.position,
                    location: jobData.location,
                    tags: jobData.tags,
                    description: jobData.description,
                    jobUrl: jobData.jobUrl,
                    salary: jobData.salary,
                    columnId: columnId,
                    boardId: board._id,
                    userId: USER_ID,
                    status: columnName.toLowerCase().replace(" ", "-"),
                    order: i,
                    interviews: (jobData as { interviews?: unknown[] }).interviews || [],
                });

                column.jobApplications.push(jobApplication._id);
                totalCreated++;
            }

            await column.save();
            console.log(`✅ Added ${jobs.length} jobs to "${columnName}" column`);
        }

        // Seed TopUp Packages if none exist
        const packageCount = await TopUpPackage.countDocuments();
        if (packageCount === 0) {
            await TopUpPackage.insertMany(DEFAULT_TOP_UP_PACKAGES);
            console.log(`📦 Seeded ${DEFAULT_TOP_UP_PACKAGES.length} default top-up packages`);
        }

        // Seed MFS Providers if none exist
        const providerCount = await MfsProvider.countDocuments();
        if (providerCount === 0) {
            await MfsProvider.insertMany(DEFAULT_MFS_PROVIDERS);
            console.log(`💳 Seeded ${DEFAULT_MFS_PROVIDERS.length} default MFS providers`);
        }

        // Seed MFS Admin Settings if none exist
        const settingsDoc = await AdminSettings.findOne({ key: "mfs_config" });
        if (!settingsDoc) {
            await AdminSettings.create(DEFAULT_MFS_SETTINGS);
            console.log(`⚙️ Seeded default MFS settings`);
        }

        console.log(`\n🎉 Seed completed successfully!`);
        console.log(`📊 Created ${totalCreated} job applications`);
        console.log(`📋 Board: ${board.name}`);
        console.log(`👤 User ID: ${USER_ID}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
}

seed();
