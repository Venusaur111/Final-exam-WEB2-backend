import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { UserService } from "./services/admin/userService.js";
import { AuthController } from "./controllers/auth/authController.js";
import { UserController } from "./controllers/admin/userController.js";
import { CourseController } from "./controllers/admin/courseController.js";
import { ExamController } from "./controllers/admin/examController.js";
import { QuestionController } from "./controllers/admin/questionController.js";
import { StudentExamController } from "./controllers/student/studentController.js";
import { authenticate } from "./Security/authenticate.js";
import { requireRole } from "./Security/requireRole.js";
const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
}));
const userService = new UserService();
const authController = new AuthController();
const userController = new UserController(userService);
const courseController = new CourseController();
const examController = new ExamController();
const questionController = new QuestionController();
const studentExamController = new StudentExamController();
app.post("/api/auth/login", authController.login);
app.get("/api/students", authenticate, requireRole("admin"), userController.getAllStudents);
app.post("/api/students", authenticate, requireRole("admin"), userController.createStudent);
app.put("/api/students/:id", authenticate, requireRole("admin"), userController.updateStudent);
app.delete("/api/students/:id", authenticate, requireRole("admin"), userController.deactivateStudent);
app.get("/api/courses", authenticate, requireRole("admin"), courseController.getAllCourses);
app.post("/api/courses", authenticate, requireRole("admin"), courseController.createCourse);
app.put("/api/courses/:id", authenticate, requireRole("admin"), courseController.updateCourse);
app.delete("/api/courses/:id", authenticate, requireRole("admin"), courseController.deleteCourse);
app.get("/api/exams", authenticate, requireRole("admin"), examController.getAllExams);
app.post("/api/exams", authenticate, requireRole("admin"), examController.createExam);
app.get("/api/exams/:id", authenticate, requireRole("admin"), examController.getExamById);
app.put("/api/exams/:id", authenticate, requireRole("admin"), examController.updateExam);
app.delete("/api/exams/:id", authenticate, requireRole("admin"), examController.deleteExam);
app.get("/api/exams/:id/results", authenticate, requireRole("admin"), examController.getExamResults);
app.get("/api/exams/:id/questions", authenticate, requireRole("admin"), questionController.getQuestionsByExam);
app.post("/api/exams/:id/questions", authenticate, requireRole("admin"), questionController.createQuestion);
app.put("/api/questions/:id", authenticate, requireRole("admin"), questionController.updateQuestion);
app.delete("/api/questions/:id", authenticate, requireRole("admin"), questionController.deleteQuestion);
app.get("/api/my/exams", authenticate, requireRole("student"), studentExamController.getAvailableExams);
app.get("/api/my/exams/:id", authenticate, requireRole("student"), studentExamController.getExamToTake);
app.post("/api/my/exams/:id/submit", authenticate, requireRole("student"), studentExamController.submitExam);
app.get("/api/my/results", authenticate, requireRole("student"), studentExamController.getMyResults);
app.use((_req, res) => {
    res.status(404).json({ message: "Ressource introuvable." });
});
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
export default app;
