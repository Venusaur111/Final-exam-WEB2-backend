import {
    Request,
    Response,
} from "express";

import {
    StudentExamService,
} from "../../services/student/studentExamService.js";

export class StudentExamController {
    private studentExamService: StudentExamService;

    constructor() {
        this.studentExamService =
            new StudentExamService();
    }

    getAvailableExams = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const studentId =
                (req as any).user?.id;

            const exams =
                await this.studentExamService
                    .getAvailableExams(
                        studentId
                    );

            res.status(200).json(exams);
        } catch (error: any) {
            res.status(
                error?.status || 500
            ).json({
                message:
                    error?.message ||
                    "Erreur serveur.",
            });
        }
    };

    getExamToTake = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<void> => {
        try {
            const { id: examId } =
                req.params;

            const studentId =
                (req as any).user?.id;

            const exam =
                await this.studentExamService
                    .getExamToTake(
                        examId,
                        studentId
                    );

            res.status(200).json(exam);
        } catch (error: any) {
            res.status(
                error?.status || 500
            ).json({
                message:
                    error?.message ||
                    "Erreur serveur.",
            });
        }
    };

    submitExam = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<void> => {
        try {
            const { id: examId } =
                req.params;

            const studentId =
                (req as any).user?.id;

            const raw =
                req.body?.answers ??
                req.body;

            const answers =
                Array.isArray(raw)
                    ? raw
                    : [];

            const correction =
                await this.studentExamService
                    .submitExam(
                        examId,
                        studentId,
                        answers
                    );

            res.status(201).json(
                correction
            );
        } catch (error: any) {
            res.status(
                error?.status || 500
            ).json({
                message:
                    error?.message ||
                    "Erreur serveur.",
            });
        }
    };

    getMyResults = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const studentId =
                (req as any).user?.id;

            const results =
                await this.studentExamService
                    .getMyResults(
                        studentId
                    );

            res.status(200).json(
                results
            );
        } catch (error: any) {
            res.status(
                error?.status || 500
            ).json({
                message:
                    error?.message ||
                    "Erreur serveur.",
            });
        }
    };

    /**
     * Affiche le résultat d'un examen précis
     * pour l'étudiant connecté.
     *
     * Cette méthode est différente de
     * getExamToTake().
     *
     * getExamToTake() sert à passer un examen.
     * getExamResult() sert à consulter un examen
     * déjà soumis.
     */
    getExamResult = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<void> => {
        try {
            const { id: examId } =
                req.params;

            const studentId =
                (req as any).user?.id;

            const result =
                await this.studentExamService
                    .getExamResult(
                        examId,
                        studentId
                    );

            res.status(200).json(
                result
            );
        } catch (error: any) {
            res.status(
                error?.status || 500
            ).json({
                message:
                    error?.message ||
                    "Erreur serveur.",
            });
        }
    };
}

