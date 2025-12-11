require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Import your models
const db = require("../../models");

const User = db.user;
const Server = db.server;
const Channel = db.channel;
const Message = db.message;

// Generate dummy data
async function generateDummyData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });

    // ================ CREATE USERS ================
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = await User.insertMany([
      {
        email: "2021001@josephscollege.ac.in",
        password: hashedPassword,
        number: "9876543210",
        name: "Rajesh Kumar",
        role: "student",
        avatarURL: "https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png",
        providers: ["local"],
        profile: {
          userName: "rajesh_kumar",
        },
        academic: {
          course: "BCA",
          currentSemester: "5",
          year: "2021",
        },
        isClassRepresentative: true,
        activity: {
          lastLogin: new Date(),
        },
        security: {
          twoFactorEnabled: false,
          loginAttempts: 0,
          emailVerified: true,
          numberVerified: true,
          mustChangePassword: false,
          passwordHistory: [],
        },
        isActive: true,
      },
      {
        email: "2021002@josephscollege.ac.in",
        password: hashedPassword,
        number: "9876543211",
        name: "Priya Sharma",
        role: "student",
        avatarURL: "https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png",
        providers: ["local"],
        profile: {
          userName: "priya_sharma",
        },
        academic: {
          course: "BCA",
          currentSemester: "5",
          year: "2021",
        },
        isClassRepresentative: false,
        activity: {
          lastLogin: new Date(),
        },
        security: {
          twoFactorEnabled: false,
          loginAttempts: 0,
          emailVerified: true,
          numberVerified: true,
          mustChangePassword: false,
          passwordHistory: [],
        },
        isActive: true,
      },
      {
        email: "2020001@josephscollege.ac.in",
        password: hashedPassword,
        number: "9876543212",
        name: "Dr. Anil Verma",
        role: "faculty",
        avatarURL: "https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png",
        providers: ["google", "local"],
        googleID: "google_id_12345",
        profile: {
          userName: "dr_anil_verma",
        },
        activity: {
          lastLogin: new Date(),
        },
        security: {
          twoFactorEnabled: false,
          loginAttempts: 0,
          emailVerified: true,
          numberVerified: true,
          mustChangePassword: false,
          passwordHistory: [],
        },
        isActive: true,
      },
      {
        email: "2019001@josephscollege.ac.in",
        password: hashedPassword,
        number: "9876543213",
        name: "Sneha Reddy",
        role: "alumni",
        avatarURL: "https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png",
        providers: ["local"],
        profile: {
          userName: "sneha_reddy",
        },
        academic: {
          course: "BCA",
          currentSemester: "Graduated",
          year: "2019",
        },
        activity: {
          lastLogin: new Date(),
        },
        security: {
          twoFactorEnabled: false,
          loginAttempts: 0,
          emailVerified: true,
          numberVerified: true,
          mustChangePassword: false,
          passwordHistory: [],
        },
        isActive: true,
      },
      {
        email: "2021003@josephscollege.ac.in",
        password: hashedPassword,
        number: "9876543214",
        name: "Vikram Singh",
        role: "student",
        avatarURL: "https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png",
        providers: ["google"],
        googleID: "google_id_67890",
        profile: {
          userName: "vikram_singh",
        },
        academic: {
          course: "BCA",
          currentSemester: "5",
          year: "2021",
        },
        isClassRepresentative: false,
        activity: {
          lastLogin: new Date(),
        },
        security: {
          twoFactorEnabled: false,
          loginAttempts: 0,
          emailVerified: true,
          numberVerified: false,
          mustChangePassword: false,
          passwordHistory: [],
        },
        isActive: true,
      },
    ]);

    console.log(`Created ${users.length} users...`);

    // ================ CREATE SERVERS ================
    const servers = await Server.insertMany([
      {
        name: "BCA 2021 - Class",
        description: "Official server for BCA 2021 batch students",
        createdBy: users[0]._id, // Rajesh Kumar (CR)
        icon: "https://img.icons8.com/ios-filled/100/university.png",
        banner: "https://img.icons8.com/color/200/education.png",
        serverType: "class",
        academicInfo: {
          course: "BCA",
          year: "2021",
          currentSemester: "5",
        },
        joinPolicy: "invite_only",
        leaders: [
          {
            user: users[0]._id, // Rajesh Kumar
            role: "class_representative",
            assignedAt: new Date(),
          },
          {
            user: users[2]._id, // Dr. Anil Verma
            role: "admin",
            assignedAt: new Date(),
          },
        ],
        users: [users[0]._id, users[1]._id, users[2]._id, users[4]._id],
      },
      {
        name: "Computer Science Department",
        description: "Official department server for CS-related discussions",
        createdBy: users[2]._id, // Dr. Anil Verma
        icon: "https://img.icons8.com/ios-filled/100/code.png",
        serverType: "department",
        joinPolicy: "request_approval",
        leaders: [
          {
            user: users[2]._id, // Dr. Anil Verma
            role: "admin",
            assignedAt: new Date(),
          },
        ],
        users: [users[0]._id, users[1]._id, users[2]._id, users[4]._id],
      },
      {
        name: "Coding Club",
        description: "Learn, code, and build together!",
        createdBy: users[1]._id, // Priya Sharma
        icon: "https://img.icons8.com/ios-filled/100/programming.png",
        serverType: "club",
        joinPolicy: "open",
        leaders: [
          {
            user: users[1]._id, // Priya Sharma
            role: "committee_head",
            assignedAt: new Date(),
          },
          {
            user: users[4]._id, // Vikram Singh
            role: "moderator",
            assignedAt: new Date(),
          },
        ],
        users: [users[0]._id, users[1]._id, users[4]._id],
      },
      {
        name: "Alumni Network",
        description: "Stay connected with fellow alumni",
        createdBy: users[3]._id, // Sneha Reddy
        icon: "https://img.icons8.com/ios-filled/100/graduation-cap.png",
        serverType: "general",
        joinPolicy: "request_approval",
        leaders: [
          {
            user: users[3]._id, // Sneha Reddy
            role: "admin",
            assignedAt: new Date(),
          },
        ],
        users: [users[3]._id],
      },
      {
        name: "Web Dev Project Team",
        description: "Final year project collaboration space",
        createdBy: users[0]._id, // Rajesh Kumar
        icon: "https://img.icons8.com/ios-filled/100/web.png",
        serverType: "project",
        joinPolicy: "invite_only",
        leaders: [
          {
            user: users[0]._id, // Rajesh Kumar
            role: "admin",
            assignedAt: new Date(),
          },
        ],
        users: [users[0]._id, users[1]._id, users[4]._id],
      },
    ]);

    console.log(`Created ${servers.length} servers...`);

    // Update users with server references
    await User.updateOne(
      { _id: users[0]._id },
      {
        servers: [
          servers[0]._id,
          servers[1]._id,
          servers[2]._id,
          servers[4]._id,
        ],
      }
    );
    await User.updateOne(
      { _id: users[1]._id },
      {
        servers: [
          servers[0]._id,
          servers[1]._id,
          servers[2]._id,
          servers[4]._id,
        ],
      }
    );
    await User.updateOne(
      { _id: users[2]._id },
      { servers: [servers[0]._id, servers[1]._id] }
    );
    await User.updateOne({ _id: users[3]._id }, { servers: [servers[3]._id] });
    await User.updateOne(
      { _id: users[4]._id },
      {
        servers: [
          servers[0]._id,
          servers[1]._id,
          servers[2]._id,
          servers[4]._id,
        ],
      }
    );

    // ================ CREATE CHANNELS ================
    const channels = await Channel.insertMany([
      // Channels for BCA 2021 - Class server
      {
        name: "general",
        description: "General discussions for BCA 2021",
        type: "guild_text",
        createdBy: users[0]._id,
      },
      {
        name: "announcements",
        description: "Important class announcements",
        type: "guild_announcement",
        createdBy: users[0]._id,
      },
      {
        name: "assignments",
        description: "Assignment submissions and discussions",
        type: "guild_text",
        createdBy: users[2]._id,
      },
      // Channels for CS Department server
      {
        name: "department-general",
        description: "General department discussions",
        type: "guild_text",
        createdBy: users[2]._id,
      },
      {
        name: "department-announcements",
        description: "Official department announcements",
        type: "guild_announcement",
        createdBy: users[2]._id,
      },
      // Channels for Coding Club server
      {
        name: "club-general",
        description: "General club discussions",
        type: "guild_text",
        createdBy: users[1]._id,
      },
      {
        name: "project-showcase",
        description: "Share your coding projects",
        type: "guild_text",
        createdBy: users[1]._id,
      },
      // Channels for Alumni Network server
      {
        name: "alumni-general",
        description: "Connect with fellow alumni",
        type: "guild_text",
        createdBy: users[3]._id,
      },
      // Channels for Web Dev Project server
      {
        name: "project-planning",
        description: "Project planning and coordination",
        type: "guild_text",
        createdBy: users[0]._id,
      },
      {
        name: "code-reviews",
        description: "Code review discussions",
        type: "guild_text",
        createdBy: users[0]._id,
      },
    ]);

    console.log(`Created ${channels.length} channels...`);

    // Update servers with channel references
    await Server.updateOne(
      { _id: servers[0]._id },
      { channels: [channels[0]._id, channels[1]._id, channels[2]._id] }
    );
    await Server.updateOne(
      { _id: servers[1]._id },
      { channels: [channels[3]._id, channels[4]._id] }
    );
    await Server.updateOne(
      { _id: servers[2]._id },
      { channels: [channels[5]._id, channels[6]._id] }
    );
    await Server.updateOne(
      { _id: servers[3]._id },
      { channels: [channels[7]._id] }
    );
    await Server.updateOne(
      { _id: servers[4]._id },
      { channels: [channels[8]._id, channels[9]._id] }
    );

    // ================ CREATE MESSAGES ================
    const messages = await Message.insertMany([
      // Messages in BCA 2021 - general channel
      {
        userId: users[0]._id, // Rajesh Kumar
        type: "text",
        content: "Welcome everyone to the BCA 2021 class server!",
        timestamp: new Date("2024-12-01T09:00:00Z"),
      },
      {
        userId: users[1]._id, // Priya Sharma
        type: "text",
        content: "Thanks Rajesh! Excited to be here.",
        timestamp: new Date("2024-12-01T09:05:00Z"),
      },
      {
        userId: users[4]._id, // Vikram Singh
        type: "text",
        content: "Hey everyone! Looking forward to this semester.",
        timestamp: new Date("2024-12-01T09:10:00Z"),
      },
      // Messages in announcements channel
      {
        userId: users[2]._id, // Dr. Anil Verma
        type: "text",
        content:
          "Important: Mid-term exams will be held next week. Check the schedule.",
        timestamp: new Date("2024-12-02T10:00:00Z"),
      },
      {
        userId: users[0]._id, // Rajesh Kumar
        type: "text",
        content: "Reminder: Assignment submission deadline is Friday, 5 PM.",
        timestamp: new Date("2024-12-05T08:00:00Z"),
      },
      // Messages in assignments channel
      {
        userId: users[1]._id, // Priya Sharma
        type: "text",
        content: "Has anyone started the Java assignment yet?",
        timestamp: new Date("2024-12-03T14:00:00Z"),
      },
      {
        userId: users[4]._id, // Vikram Singh
        type: "text",
        content: "Yes, I'm halfway through. The recursion part is tricky!",
        timestamp: new Date("2024-12-03T14:15:00Z"),
      },
      {
        userId: users[1]._id, // Priya Sharma
        type: "text",
        content: "Can we discuss it tomorrow during lunch break?",
        timestamp: new Date("2024-12-03T14:20:00Z"),
        editedTimestamp: new Date("2024-12-03T14:25:00Z"),
      },
      // Messages in coding club
      {
        userId: users[1]._id, // Priya Sharma
        type: "text",
        content: "Welcome to the Coding Club! Share your projects here.",
        timestamp: new Date("2024-12-01T16:00:00Z"),
      },
      {
        userId: users[4]._id, // Vikram Singh
        type: "text",
        content:
          "I just finished a React portfolio website. Will share the link soon!",
        timestamp: new Date("2024-12-04T11:00:00Z"),
      },
      // Messages in project planning
      {
        userId: users[0]._id, // Rajesh Kumar
        type: "text",
        content: "Let's plan our project timeline. Meeting at 3 PM today?",
        timestamp: new Date("2024-12-06T10:00:00Z"),
      },
      {
        userId: users[1]._id, // Priya Sharma
        type: "text",
        content: "Works for me! I'll prepare the tech stack proposal.",
        timestamp: new Date("2024-12-06T10:15:00Z"),
      },
      // Deleted message example
      {
        userId: users[4]._id, // Vikram Singh
        type: "text",
        content: "This message was inappropriate",
        timestamp: new Date("2024-12-04T15:00:00Z"),
        deleted: true,
        deletedAt: new Date("2024-12-04T15:05:00Z"),
        deletedBy: users[0]._id, // Deleted by Rajesh (admin)
      },
      // Message with file type
      {
        userId: users[2]._id, // Dr. Anil Verma
        type: "file",
        content: "https://example.com/files/lecture_notes_week5.pdf",
        timestamp: new Date("2024-12-07T09:00:00Z"),
      },
    ]);

    console.log(`Created ${messages.length} messages...`);

    // Update channels with message references
    await Channel.updateOne(
      { _id: channels[0]._id },
      { messages: [messages[0]._id, messages[1]._id, messages[2]._id] }
    );
    await Channel.updateOne(
      { _id: channels[1]._id },
      { messages: [messages[3]._id, messages[4]._id] }
    );
    await Channel.updateOne(
      { _id: channels[2]._id },
      {
        messages: [
          messages[5]._id,
          messages[6]._id,
          messages[7]._id,
          messages[13]._id,
        ],
      }
    );
    await Channel.updateOne(
      { _id: channels[5]._id },
      { messages: [messages[8]._id, messages[9]._id] }
    );
    await Channel.updateOne(
      { _id: channels[8]._id },
      { messages: [messages[10]._id, messages[11]._id, messages[12]._id] }
    );

    console.log("✅ Dummy data generation completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Users: ${users.length}`);
    console.log(`- Servers: ${servers.length}`);
    console.log(`- Channels: ${channels.length}`);
    console.log(`- Messages: ${messages.length}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error generating dummy data:", error);
    await mongoose.disconnect();
  }
}

// Run the function
generateDummyData();
