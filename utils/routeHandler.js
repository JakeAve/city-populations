import { serveJSON } from "./serveJSON.js";

export const router = {
  routes: [],

  get(path, handler) {
    this.routes.push({ path, method: "GET", handler });
  },

  put(path, handler) {
    this.routes.push({ path, method: "PUT", handler });
  },

  handle(req, res) {
    const url = req.url.toLowerCase();
    const cachedRoute = process.routeCache.get(`${url}:${req.method}`);
    if (cachedRoute) {
      return serveJSON(req, res, cachedRoute.status, cachedRoute.data);
    }

    const pathParts = url.match(/[^/]+/g) || [];
    req.params = {};
    if (req.method === "PUT" || req.method === "POST") {
      req.body = {
        toString: async () => {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const body = Buffer.concat(chunks).toString();
          req.body = body;
          return body;
        },
      };
    }
    for (const route of this.routes) {
      if (route.method === req.method && isRouteMatch(pathParts, route.path, req)) {
        return route.handler(req, res);
      }
    }

    serveJSON(req, res, 404, { message: "Not found", path: url });
  },
};

function isRouteMatch(input, route, req) {
  const routeParts = route.toLowerCase().match(/[^/]+/g) || [];
  if (routeParts.length !== input.length) {
    return false;
  }
  for (const [i, part] of routeParts.entries()) {
    if (part.startsWith(":")) {
      req.params[part.slice(1)] = input[i];
    } else if (input[i] !== part) {
      return false;
    }
  }
  return true;
}
