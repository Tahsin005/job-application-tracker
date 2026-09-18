export const DEFAULT_TOP_UP_PACKAGES = [
    {
        name: "Level 1 - Starter Boost",
        tierKey: "level1",
        order: 1,
        price: 150,
        currency: "BDT",
        description: "Great for active job hunters applying to a focused set of roles.",
        badgeText: "Starter",
        credits: {
            atsScan: 10,
            coverLetter: 10,
            outreach: 10,
            applicationEmail: 10,
        },
        isActive: true,
    },
    {
        name: "Level 2 - Job Hunter Pack",
        tierKey: "level2",
        order: 2,
        price: 300,
        currency: "BDT",
        description: "Our most popular pack for aggressive job search campaigns.",
        badgeText: "Most Popular",
        credits: {
            atsScan: 25,
            coverLetter: 25,
            outreach: 25,
            applicationEmail: 25,
        },
        isActive: true,
    },
    {
        name: "Level 3 - Pro Accelerator",
        tierKey: "pro",
        order: 3,
        price: 600,
        currency: "BDT",
        description: "Maximum firepower with ample credits for all AI resume tools.",
        badgeText: "Best Value",
        credits: {
            atsScan: 60,
            coverLetter: 60,
            outreach: 60,
            applicationEmail: 60,
        },
        isActive: true,
    },
];

export const DEFAULT_MFS_PROVIDERS = [
    {
        name: "bKash",
        slug: "bkash",
        accountType: "Personal",
        accountNumber: "01700000000",
        instructions: "Send Money using bKash Personal account.",
        order: 1,
        color: "#E2136E",
        isActive: true,
    },
    {
        name: "Nagad",
        slug: "nagad",
        accountType: "Personal",
        accountNumber: "01800000000",
        instructions: "Send Money using Nagad Personal account.",
        order: 2,
        color: "#F7941D",
        isActive: true,
    },
    {
        name: "Rocket",
        slug: "rocket",
        accountType: "Personal",
        accountNumber: "01900000000",
        instructions: "Send Money using Rocket Personal account.",
        order: 3,
        color: "#8C3494",
        isActive: true,
    },
];

export const DEFAULT_MFS_SETTINGS = {
    key: "mfs_config",
    bkashNumber: "",
    nagadNumber: "",
    rocketNumber: "",
    upayNumber: "",
    instructions:
        "Send the exact amount via Personal Send Money. After payment, enter your sender mobile number and the Transaction ID (TrxID) below.",
};
