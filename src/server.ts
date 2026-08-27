import express from "express";
import { UserRepository } from "./Repository/userrepo.js";
import { AdminUserService } from "./services/userserv.js";
import { UserController } from "./controllers/usercontroller.js";
const app = express();

app.use(express.json());

const userRepository = new UserRepository();
const userService = new AdminUserService(userRepository);
const userController = new UserController(userService);




app.get("/api/v1/admin/students", async (req: Request, res: Response) => {
    await userController.getStudentById(req, res);
});


app.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});