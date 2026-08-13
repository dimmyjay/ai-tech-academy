// backfill_course.js
// Usage: node backfill_course.js <COURSE_ID> <PATH_TO_SERVICE_ACCOUNT_JSON> [--force]
// Example: node backfill_course.js course_abc ./serviceAccount.json --force

const admin = require("firebase-admin");
const fs = require("fs");

if (process.argv.length < 4) {
  console.error("Usage: node backfill_course.js <COURSE_ID> <SERVICE_ACCOUNT_JSON> [--force]");
  process.exit(1);
}

const COURSE_ID = process.argv[2];
const SERVICE_ACCOUNT_PATH = process.argv[3];
const FORCE = process.argv.includes("--force");

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || serviceAccount.databaseUrl || "https://<YOUR-PROJECT>.firebaseio.com";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: DATABASE_URL,
});

const db = admin.database();

const TEMPLATE_ARTICLE = `Learning objectives:
- Understand the topic and key concepts.
- Follow step-by-step instructions and run the provided example.
- Complete the short exercise to practice.

Prerequisites:
- Basic command-line familiarity.
- (Optional) A code editor such as VS Code.

Step-by-step instructions:
1. Follow the steps in order.
2. Set up any required tools.
3. Run the example and verify it works.

Example / Try this:
\`\`\`bash
# Replace this with concrete commands for the lesson
echo "Hello, world"
\`\`\`

Common pitfalls:
- Not activating the environment.
- Using the wrong command for your OS.

Short exercise:
- Try the example and make a small modification.

Summary:
- This lesson covered the essential steps and a runnable example.
`;

async function run() {
  try {
    const courseRef = db.ref(`courses/${COURSE_ID}`);
    const snap = await courseRef.once("value");
    if (!snap.exists()) {
      console.error("Course not found:", COURSE_ID);
      process.exit(2);
    }
    const course = snap.val();
    const modules = Array.isArray(course.modules) ? course.modules : Object.values(course.modules || {});

    for (let mi = 0; mi < modules.length; mi++) {
      const m = modules[mi];
      const lessons = Array.isArray(m.lessons) ? m.lessons : Object.values(m.lessons || {});
      for (let li = 0; li < lessons.length; li++) {
        const lesson = lessons[li] || {};
        const content = typeof lesson.content === "string" ? lesson.content.trim() : "";
        if (FORCE || !content || content.length < 200 || /being prepared|tbd|no content/i.test(content)) {
          const fill = (lesson.type === "code-along") ? TEMPLATE_ARTICLE.replace("echo \"Hello, world\"", "echo \"Hello, world\" # (replace with lesson-specific commands)") : TEMPLATE_ARTICLE;
          lesson.content = fill;
          lesson.updatedAt = Date.now();
          console.log(`Backfilled module ${mi+1} lesson ${li+1}: ${lesson.title || "untitled"}`);
        } else {
          console.log(`Skipping module ${mi+1} lesson ${li+1} (has content)`);
        }
        lessons[li] = lesson;
      }
      modules[mi] = { ...m, lessons };
    }

    await courseRef.child("modules").set(modules);
    await courseRef.update({ updatedAt: Date.now(), processing: false, isPublished: true });
    console.log("Backfill complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error in backfill:", err);
    process.exit(3);
  }
}

run();