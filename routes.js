import {
  getPopulation,
  updatePopulation,
} from "./controllers/cityPopulations.js";
import { router as routeHandler } from "./utils/routeHandler.js";
import { serveErrors } from "./utils/serveErrors.js";
import { serveJSON } from "./utils/serveJSON.js";
import { BadRequest } from "./errors/BadRequest.js";
import { serializeStateCity } from "./utils/serializeStateCity.js";

export const router = routeHandler;

router.get("/test", (_req, res) => {
  serveJSON(res, 200, { message: "test route" });
});

router.get("/api/population/state/:state/city/:city", async (req, res) => {
  try {
    const { state, city } = req.params;
    const stateCity = serializeStateCity(state, city);
    const population = await getPopulation(stateCity);

    if (population === null) {
      throw new BadRequest([
        { message: "This city does not exist", state, city },
      ]);
    }

    serveJSON(req, res, 200, { population }, true);
  } catch (err) {
    serveErrors(req, res, err);
  }
});

router.put("/api/population/state/:state/city/:city", async (req, res) => {
  try {
    const { state, city } = req.params;
    const body = await req.body.toString();

    const cached = process.routeCache.get(`${req.url}:${req.method}:${body}`);
    if (cached) {
      return serveJSON(req, res, 200, cached.data);
    }

    if (isNaN(Number(body))) {
      throw new BadRequest([
        { message: "Input could not be converted into a number", value: body },
      ]);
    }

    const stateCity = serializeStateCity(state, city);
    const { didCreate, population } = await updatePopulation(stateCity, body);

    if (population === null) {
      throw new BadRequest([
        { message: "That is not a valid state of the union", state, city },
      ]);
    }

    process.send({
      type: "add-route",
      route: `${req.url.toLowerCase()}:${req.method}:${body}`,
      response: { status: 200, data: { population } },
    });

    process.send({
      type: "add-route",
      route: `${req.url.toLowerCase()}:GET`,
      response: { status: 200, data: { population } },
    });

    serveJSON(req, res, didCreate ? 201 : 200, { population });
  } catch (err) {
    serveErrors(req, res, err);
  }
});
