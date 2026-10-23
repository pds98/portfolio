import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Erreur métier portant un code HTTP, interceptée par le gestionnaire d'erreurs. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Express 4 n'intercepte pas les promesses rejetées : sans ce wrapper, une
 * exception dans un handler `async` ferait planter la requête sans réponse.
 */
export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };
}

/** Convertit le paramètre `:id` en entier positif, sinon 400. */
export function parseId(raw: string | undefined): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Identifiant invalide");
  return id;
}
