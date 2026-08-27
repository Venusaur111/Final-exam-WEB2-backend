import express from 'express';
import { AdminStudentController } from './controllers/admin/adminStudentController.js';
import { AdminCourseController } from './controllers/admin/adminCourseController.js';
import { AdminExamController } from './controllers/admin/adminExamController.js';
import { AdminQuestionController } from './controllers/admin/adminQuestionController.js';
import { StudentPortalController } from './controllers/student/studentPortalController.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Les objets s'instancient d'eux-mêmes en cascade
app.use("/api/v1/admin/students", new AdminStudentController().getRouter());
app.use("/api/v1/admin/courses", new AdminCourseController().getRouter());
app.use("/api/v1/admin/exams", new AdminExamController().getRouter());
app.use("/api/v1/admin/questions", new AdminQuestionController().getRouter());
app.use("/api/v1/student", new StudentPortalController().getRouter());

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

export default app;