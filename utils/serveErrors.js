import { BadRequest } from "../errors/BadRequest.js";
import { InternalServerError } from "../errors/InternalServerError.js";
import { serveJSON } from "./serveJSON.js";

export function serveErrors(req, res, err) {
  if (!(err instanceof BadRequest)) {
    console.error(err);
    err = new InternalServerError([{ message: "Internal server error" }]);
  }

  serveJSON(req, res, err.status, {
    message: err.message,
    errors: err.errors,
  }, !(err instanceof InternalServerError));
}
