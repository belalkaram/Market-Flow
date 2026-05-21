import { Response } from "express";

export function success(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created(res: Response, data: unknown) {
  return success(res, data, 201);
}

export function paginated(
  res: Response,
  data: unknown,
  meta: { total: number; page: number; limit: number },
) {
  return res.status(200).json({ success: true, data, meta });
}
