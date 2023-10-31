export function serveJSON(
  req,
  res,
  status = 200,
  data = {},
  shouldCache = false
) {
  if (shouldCache) {
    const body = req.body ? `:${req.body}` : "";
    process.send({
      type: "add-route",
      route: `${req.url.toLowerCase()}:${req.method}${body}`,
      response: { status, data },
    });
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}
