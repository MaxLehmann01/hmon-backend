import { NextFunction, Request, Response, Router } from "express";
import PlugService from "./PlugService";
import RouteError from "src/core/Server/RouteError";

export default class Controller {
    public getRouter(): Router {
        const router = Router();

        router.post("/:plugId/toggle", Controller.togglePlug);

        return router;
    }

    private static async togglePlug(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { plugId } = req.params;

            if (!plugId) {
                throw new RouteError(400, "Missing plugId");
            }

            if (isNaN(Number(plugId))) {
                throw new RouteError(400, "Invalid plugId");
            }

            const result = await PlugService.togglePlug(Number(plugId));

            if (result === -1) {
                throw new RouteError(404, "Plug is protected");
            }

            if (result === 0) {
                throw new RouteError(404, "Plug not found");
            }

            res.status(200).json({ message: "Plug toggled successfully" });
        } catch (error) {
            next(error);
        }
    }
}
