import { BadRequest } from "../errors/BadRequest.js";
import { InternalServerError } from "../errors/InternalServerError.js";
import { serveJSON } from "./serveJSON.js";

export function serveErrors(res, err) {
  if (!(err instanceof BadRequest)) {
    console.error(err);
    err = new InternalServerError([{ message: "Internal server error" }]);
  }

  serveJSON(res, err.status, {
    message: err.message,
    errors: err.errors,
  });
}
