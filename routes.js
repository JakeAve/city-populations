import {
  getPopulation,
  updatePopulation,
} from "./controllers/cityPopulations.js";
import { router as routeHandler } from "./utils/routeHandler.js";
import { serveErrors } from "./utils/serveErrors.js";
import { serveJSON } from "./utils/serveJSON.js";
import { BadRequest } from "./errors/BadRequest.js";

export const router = routeHandler;

router.get("/test", (_req, res) => {
  serveJSON(res, 200, { message: "test route" });
});

router.get("/api/population/state/:state/city/:city", async (req, res) => {
  try {
    const { state, city } = req.params;
    const number = await getPopulation(state, city);

    if (number === null) {
      throw new BadRequest([
        { message: "This city does not exist", state, city },
      ]);
    }

    serveJSON(res, 200, { population: number });
  } catch (err) {
    serveErrors(res, err);
  }
});

router.put("/api/population/state/:state/city/:city", async (req, res) => {
  try {
    const { state, city } = req.params;
    const body = await req.body;

    if (isNaN(Number(body))) {
      throw new BadRequest([
        { message: "Input could not be converted into a number", value: body },
      ]);
    }

    const { didCreate, population } = await updatePopulation(state, city, body);

    if (population === null) {
      throw new BadRequest([
        { message: "That is not a valid state of the union", state, city },
      ]);
    }

    serveJSON(res, didCreate ? 201 : 200, { population });
  } catch (err) {
    serveErrors(res, err);
  }
});
