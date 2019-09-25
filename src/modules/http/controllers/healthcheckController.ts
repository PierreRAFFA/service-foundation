import { Request, Response } from "express";
import { getHealth } from "../../../app/appHealth";
import { IAppHealth } from "../../../interfaces";
import { HealthStatus } from "../../../constants";

/**
 * Returns the status of each service the ms needs
 *
 * @param {e.Request} req
 * @param {e.Response} res
 */
export function read(req: Request, res: Response) {
  const health: IAppHealth = getHealth();
  const statusCode: number = health.status === HealthStatus.Fail ? 500 : 200;
  res.status(statusCode).send(health);
}
