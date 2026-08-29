export class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    // ... constructeur et autres méthodes ...
    async getStudentById(req, res) {
        const id = req.query.id;
        if (!id || typeof id !== 'string') {
            res.status(400).json({ message: "Identifiant invalide ou absent" });
            return;
        }
        const student = await this.userService.getStudentById(id);
        if (!student) {
            res.status(404).json({ message: "Étudiant introuvable" });
            return;
        }
        res.json(student);
    }
}
