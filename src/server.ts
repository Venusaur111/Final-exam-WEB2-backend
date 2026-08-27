import express from "express";
// ── Admin: Students ───────────────────────────────────
import { UserRepository } from "./Repository/admin/adminUserRepositories.js";
import { UserService } from "./services/admin/userService.js";
// ── Auth ──────────────────────────────────────────────
import { AuthController } from "./controllers/auth/authController.js";

// ── Admin: Students ───────────────────────────────────
import { UserController } from "./controllers/admin/userController.js";

// ── Admin: Courses ────────────────────────────────────
import { CourseController } from "./controllers/admin/courseController.js";

// ── Admin: Exams ──────────────────────────────────────
import { ExamController } from "./controllers/admin/examController.js";

// ── Admin: Questions ──────────────────────────────────
import { QuestionController } from "./controllers/admin/questionController.js";

// ── Student: Exams & Results ──────────────────────────
import { StudentExamController } from "./controllers/student/studentController.js";

// ── Security ──────────────────────────────────────────
import { authenticate } from "./Security/authenticate.js";
import { requireRole } from "./Security/requireRole.js";

const app = express();
app.use(express.json());
const userRepository = new UserRepository();
const userService = new UserService();

// 2. Passage du service au contrôleur

// ── Instanciations ────────────────────────────────────
const authController = new AuthController();
const userController = new UserController(userService);
const courseController = new CourseController();
const examController = new ExamController();
const questionController = new QuestionController();
const studentExamController = new StudentExamController();

// ══════════════════════════════════════════════════════
// Auth (Public)
// ══════════════════════════════════════════════════════

app.post("/api/auth/login", authController.login);

// ══════════════════════════════════════════════════════
// Administrateur uniquement
// ══════════════════════════════════════════════════════

// ── Étudiants ─────────────────────────────────────────
app.get("/api/students", authenticate, requireRole("admin"), userController.getAllStudents);
app.post("/api/students", authenticate, requireRole("admin"), userController.createStudent);
app.put("/api/students/:id", authenticate, requireRole("admin"), userController.updateStudent);
app.delete("/api/students/:id", authenticate, requireRole("admin"), userController.deactivateStudent); // RG-10

// ── Cours ─────────────────────────────────────────────
app.get("/api/courses", authenticate, requireRole("admin"), courseController.getAllCourses);
app.post("/api/courses", authenticate, requireRole("admin"), courseController.createCourse);
app.put("/api/courses/:id", authenticate, requireRole("admin"), courseController.updateCourse);
app.delete("/api/courses/:id", authenticate, requireRole("admin"), courseController.deleteCourse); // RG-09

// ── Examens ───────────────────────────────────────────
app.get("/api/exams", authenticate, requireRole("admin"), examController.getAllExams);
app.post("/api/exams", authenticate, requireRole("admin"), examController.createExam);
app.get("/api/exams/:id", authenticate, requireRole("admin"), examController.getExamById);
app.put("/api/exams/:id", authenticate, requireRole("admin"), examController.updateExam);
app.delete("/api/exams/:id", authenticate, requireRole("admin"), examController.deleteExam); // RG-09
app.get("/api/exams/:id/results", authenticate, requireRole("admin"), examController.getExamResults);

// ── Questions ─────────────────────────────────────────
app.get("/api/exams/:id/questions", authenticate, requireRole("admin"), questionController.getQuestionsByExam);
app.post("/api/exams/:id/questions", authenticate, requireRole("admin"), questionController.createQuestion); // RG-04
app.put("/api/questions/:id", authenticate, requireRole("admin"), questionController.updateQuestion); // RG-08
app.delete("/api/questions/:id", authenticate, requireRole("admin"), questionController.deleteQuestion); // RG-08

// ══════════════════════════════════════════════════════
// Étudiant uniquement
// ══════════════════════════════════════════════════════

app.get("/api/my/exams", authenticate, requireRole("student"), studentExamController.getAvailableExams);
app.get("/api/my/exams/:id", authenticate, requireRole("student"), studentExamController.getExamToTake); // RG-07
app.post("/api/my/exams/:id/submit", authenticate, requireRole("student"), studentExamController.submitExam); // RG-06
app.get("/api/my/results/:attemptId/correction", authenticate, requireRole("student"), studentExamController.getCorrectionForAttempt);

// ══════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

export default app;