require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Import your models
const db = require("../../models");

const User = db.user;
const Server = db.server;
const Channel = db.channel;
const Message = db.message;
const Chat = db.chat;

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

    // ================ CREATE CHATS ================
    const chats = await Chat.insertMany([
      // Multiple chats for Rajesh Kumar
      {
        title: "Java Programming Help",
        userId: users[0]._id, // Rajesh Kumar
        conversationHistory: [
          {
            author: "user",
            message: "Can you explain the concept of Java inheritance?",
            timestamp: new Date("2024-12-01T10:00:00Z"),
          },
          {
            author: "ai",
            message:
              "Inheritance in Java is a mechanism where a new class (child/subclass) can inherit properties and methods from an existing class (parent/superclass). It promotes code reusability and establishes a relationship between classes.",
            timestamp: new Date("2024-12-01T10:00:15Z"),
          },
          {
            author: "user",
            message: "Can you give me an example?",
            timestamp: new Date("2024-12-01T10:02:00Z"),
          },
          {
            author: "ai",
            message:
              "Sure! Here's an example:\n\nclass Animal {\n  void eat() {\n    System.out.println('Eating...');\n  }\n}\n\nclass Dog extends Animal {\n  void bark() {\n    System.out.println('Barking...');\n  }\n}\n\nThe Dog class inherits the eat() method from Animal class.",
            timestamp: new Date("2024-12-01T10:02:30Z"),
          },
        ],
        access: "private",
        aiModel: "gpt-4",
      },
      {
        title: "Web Development Project Ideas",
        userId: users[0]._id, // Rajesh Kumar
        conversationHistory: [
          {
            author: "user",
            message:
              "I need ideas for a final year web development project. Something innovative.",
            timestamp: new Date("2024-12-03T15:00:00Z"),
          },
          {
            author: "ai",
            message:
              "Here are some innovative web development project ideas:\n1. AI-powered study companion for students\n2. Real-time collaborative code editor\n3. Campus event management system with QR-based attendance\n4. Student-faculty communication platform\n5. Online examination system with AI proctoring\n\nWhich domain interests you the most?",
            timestamp: new Date("2024-12-03T15:00:45Z"),
          },
          {
            author: "user",
            message:
              "The student-faculty communication platform sounds interesting. Tell me more.",
            timestamp: new Date("2024-12-03T15:03:00Z"),
          },
          {
            author: "ai",
            message:
              "Great choice! A student-faculty communication platform could include:\n- Real-time messaging with channels for different subjects\n- Announcement boards\n- Assignment submission and grading\n- Virtual office hours\n- Discussion forums\n- File sharing capabilities\n- Integration with calendar for scheduling\n\nYou could use React for frontend, Node.js/Express for backend, Socket.io for real-time features, and MongoDB for database.",
            timestamp: new Date("2024-12-03T15:04:00Z"),
          },
        ],
        access: "public",
        aiModel: "gpt-4",
      },
      {
        title: "Database Design Questions",
        userId: users[0]._id, // Rajesh Kumar
        conversationHistory: [
          {
            author: "user",
            message:
              "What's the difference between SQL and NoSQL databases?",
            timestamp: new Date("2024-12-05T11:00:00Z"),
          },
          {
            author: "ai",
            message:
              "SQL vs NoSQL:\n\nSQL (Relational):\n- Structured data with fixed schema\n- Tables with rows and columns\n- ACID properties\n- Vertical scaling\n- Examples: MySQL, PostgreSQL\n\nNoSQL:\n- Flexible schema\n- Document, key-value, graph, or column-based\n- BASE properties\n- Horizontal scaling\n- Examples: MongoDB, Redis, Cassandra\n\nChoose based on your data structure and scalability needs.",
            timestamp: new Date("2024-12-05T11:00:30Z"),
          },
        ],
        access: "private",
        aiModel: "gpt-3.5-turbo",
      },
      {
        title: "React Best Practices",
        userId: users[0]._id, // Rajesh Kumar
        conversationHistory: [
          {
            author: "user",
            message: "What are some React best practices I should follow?",
            timestamp: new Date("2024-12-08T14:00:00Z"),
          },
          {
            author: "ai",
            message:
              "Here are key React best practices:\n\n1. Component Organization: Keep components small and focused\n2. Use functional components with hooks\n3. Implement proper prop validation with PropTypes or TypeScript\n4. Avoid unnecessary re-renders with React.memo and useMemo\n5. Use meaningful component and variable names\n6. Keep state as local as possible\n7. Use custom hooks for reusable logic\n8. Handle errors with error boundaries\n9. Implement code splitting with lazy loading\n10. Follow consistent folder structure",
            timestamp: new Date("2024-12-08T14:00:45Z"),
          },
          {
            author: "user",
            message: "Can you explain useMemo and useCallback?",
            timestamp: new Date("2024-12-08T14:02:00Z"),
          },
          {
            author: "ai",
            message:
              "useMemo and useCallback are optimization hooks:\n\nuseMemo:\n- Memoizes the result of a computation\n- Only recalculates when dependencies change\n- Use for expensive calculations\n\nuseCallback:\n- Memoizes a function definition\n- Returns same function reference unless dependencies change\n- Useful when passing callbacks to optimized child components\n\nExample:\nconst memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);\nconst memoizedCallback = useCallback(() => { doSomething(a, b); }, [a, b]);",
            timestamp: new Date("2024-12-08T14:02:40Z"),
          },
        ],
        access: "public",
        aiModel: "gpt-4",
      },
      {
        title: "Career Guidance in Tech",
        userId: users[0]._id, // Rajesh Kumar
        conversationHistory: [
          {
            author: "user",
            message:
              "What skills should I focus on for a career in full-stack development?",
            timestamp: new Date("2024-12-10T16:00:00Z"),
          },
          {
            author: "ai",
            message:
              "For a successful full-stack development career, focus on:\n\nFrontend:\n- HTML, CSS, JavaScript (ES6+)\n- React or Vue.js\n- Responsive design\n- State management (Redux, Context API)\n\nBackend:\n- Node.js/Express or Python/Django\n- RESTful API design\n- Database management (SQL & NoSQL)\n- Authentication & Authorization\n\nDevOps:\n- Git version control\n- Docker basics\n- CI/CD pipelines\n- Cloud platforms (AWS/Azure)\n\nSoft Skills:\n- Problem-solving\n- Communication\n- Agile methodology",
            timestamp: new Date("2024-12-10T16:01:00Z"),
          },
        ],
        access: "private",
        aiModel: "gpt-4",
      },
      // Chats for Priya Sharma
      {
        title: "Python Data Structures",
        userId: users[1]._id, // Priya Sharma
        conversationHistory: [
          {
            author: "user",
            message: "Explain different data structures in Python",
            timestamp: new Date("2024-12-02T13:00:00Z"),
          },
          {
            author: "ai",
            message:
              "Python has several built-in data structures:\n\n1. Lists: Ordered, mutable collection [1, 2, 3]\n2. Tuples: Ordered, immutable collection (1, 2, 3)\n3. Sets: Unordered, unique elements {1, 2, 3}\n4. Dictionaries: Key-value pairs {'name': 'Priya', 'age': 21}\n5. Strings: Immutable sequence of characters\n\nEach has specific use cases based on mutability, order, and uniqueness requirements.",
            timestamp: new Date("2024-12-02T13:00:30Z"),
          },
        ],
        access: "private",
        aiModel: "gpt-3.5-turbo",
      },
      {
        title: "Machine Learning Basics",
        userId: users[1]._id, // Priya Sharma
        conversationHistory: [
          {
            author: "user",
            message: "How do I get started with machine learning?",
            timestamp: new Date("2024-12-07T10:00:00Z"),
          },
          {
            author: "ai",
            message:
              "Getting started with ML:\n\n1. Prerequisites:\n- Python programming\n- Statistics and probability\n- Linear algebra basics\n\n2. Learn fundamentals:\n- Supervised vs unsupervised learning\n- Common algorithms (Linear Regression, Decision Trees, etc.)\n\n3. Tools:\n- NumPy, Pandas for data manipulation\n- Scikit-learn for ML algorithms\n- TensorFlow/PyTorch for deep learning\n\n4. Practice:\n- Work on Kaggle datasets\n- Build small projects\n- Take online courses (Coursera, edX)",
            timestamp: new Date("2024-12-07T10:01:00Z"),
          },
        ],
        access: "public",
        aiModel: "gpt-4",
      },
      // Chats for Vikram Singh
      {
        title: "Git and Version Control",
        userId: users[4]._id, // Vikram Singh
        conversationHistory: [
          {
            author: "user",
            message: "What are the essential Git commands I should know?",
            timestamp: new Date("2024-12-04T12:00:00Z"),
          },
          {
            author: "ai",
            message:
              "Essential Git commands:\n\nBasics:\n- git init: Initialize repository\n- git clone: Clone repository\n- git add: Stage changes\n- git commit: Commit changes\n- git push: Push to remote\n- git pull: Pull from remote\n\nBranching:\n- git branch: List/create branches\n- git checkout: Switch branches\n- git merge: Merge branches\n\nOther:\n- git status: Check status\n- git log: View commit history\n- git diff: See changes",
            timestamp: new Date("2024-12-04T12:00:45Z"),
          },
        ],
        access: "private",
        aiModel: "gpt-3.5-turbo",
      },
      // Chats for Dr. Anil Verma
      {
        title: "Teaching Methodology Discussion",
        userId: users[2]._id, // Dr. Anil Verma
        conversationHistory: [
          {
            author: "user",
            message:
              "What are effective ways to teach programming to beginners?",
            timestamp: new Date("2024-12-06T09:00:00Z"),
          },
          {
            author: "ai",
            message:
              "Effective programming teaching strategies:\n\n1. Start with fundamentals: Logic before syntax\n2. Use visual aids and flowcharts\n3. Provide hands-on practice with small exercises\n4. Use real-world examples and projects\n5. Encourage debugging as a learning tool\n6. Pair programming for collaboration\n7. Regular code reviews and feedback\n8. Gamification to maintain engagement\n9. Build gradually from simple to complex\n10. Create a supportive learning environment",
            timestamp: new Date("2024-12-06T09:01:00Z"),
          },
        ],
        access: "private",
        aiModel: "gpt-4",
      },
      // Chats for Sneha Reddy
      {
        title: "Career Transition Advice",
        userId: users[3]._id, // Sneha Reddy
        conversationHistory: [
          {
            author: "user",
            message:
              "I'm an alumni looking to transition into data science. Any advice?",
            timestamp: new Date("2024-12-09T14:00:00Z"),
          },
          {
            author: "ai",
            message:
              "Transitioning to data science:\n\n1. Build foundation:\n- Python/R programming\n- Statistics and probability\n- SQL for databases\n\n2. Learn tools:\n- Pandas, NumPy for data manipulation\n- Matplotlib, Seaborn for visualization\n- Scikit-learn for ML\n\n3. Gain experience:\n- Work on real datasets (Kaggle)\n- Build portfolio projects\n- Contribute to open source\n\n4. Network:\n- Join data science communities\n- Attend meetups/webinars\n- Connect with professionals on LinkedIn\n\n5. Consider certifications from Google, IBM, or Coursera",
            timestamp: new Date("2024-12-09T14:01:00Z"),
          },
        ],
        access: "private",
        aiModel: "gpt-4",
      },
    ]);

    console.log(`Created ${chats.length} chats...`);

    // Update users with chat references
    await User.updateOne(
      { _id: users[0]._id }, // Rajesh Kumar
      {
        chats: [
          chats[0]._id,
          chats[1]._id,
          chats[2]._id,
          chats[3]._id,
          chats[4]._id,
        ],
      }
    );
    await User.updateOne(
      { _id: users[1]._id }, // Priya Sharma
      { chats: [chats[5]._id, chats[6]._id] }
    );
    await User.updateOne(
      { _id: users[4]._id }, // Vikram Singh
      { chats: [chats[7]._id] }
    );
    await User.updateOne(
      { _id: users[2]._id }, // Dr. Anil Verma
      { chats: [chats[8]._id] }
    );
    await User.updateOne(
      { _id: users[3]._id }, // Sneha Reddy
      { chats: [chats[9]._id] }
    );

    console.log("✅ Dummy data generation completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Users: ${users.length}`);
    console.log(`- Servers: ${servers.length}`);
    console.log(`- Channels: ${channels.length}`);
    console.log(`- Messages: ${messages.length}`);
    console.log(`- Chats: ${chats.length}`);
    console.log("\n💬 Chat Distribution:");
    console.log(`- Rajesh Kumar: 5 chats`);
    console.log(`- Priya Sharma: 2 chats`);
    console.log(`- Vikram Singh: 1 chat`);
    console.log(`- Dr. Anil Verma: 1 chat`);
    console.log(`- Sneha Reddy: 1 chat`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error generating dummy data:", error);
    await mongoose.disconnect();
  }
}

// Run the function
generateDummyData();