import { strict as assert } from "node:assert";
import fs from "fs/promises";

const baseURL = `http://127.0.0.1:5554`;

import { it, describe } from "mocha";

describe("routes testing", () => {
  it("throws a 404 on a bad route", async () => {
    const resp = await fetch(baseURL + "/bad-route");
    assert.strictEqual(resp.status, 404);
  });
  it("ignores capitalization", async () => {
    const resp = await fetch(
      baseURL + "/api/population/state/Maryland/city/Annapolis"
    );
    assert.strictEqual(resp.status, 200);
    const resp2 = await fetch(
      baseURL + "/api/population/state/MARYLAND/city/ANNAPOLIS"
    );
    assert.strictEqual(resp2.status, 200);
    const resp3 = await fetch(
      baseURL + "/api/population/state/maryland/city/annapolis"
    );
    assert.strictEqual(resp3.status, 200);
  });
  it("parses spaces correctly", async () => {
    const resp = await fetch(
      baseURL + "/api/population/state/New Mexico/city/Santa fe"
    );
    assert.strictEqual(resp.status, 200);
    const resp2 = await fetch(
      baseURL + "/api/population/state/New%20Mexico/city/Santa%20Fe"
    );
    assert.strictEqual(resp2.status, 200);
    const resp3 = await fetch(
      baseURL + "/api/population/state/new_mexico/city/santa_fe"
    );
    assert.strictEqual(resp3.status, 200);
  });
  it("throws a 400 when you GET an invalid city", async () => {
    const resp = await fetch(
      baseURL + "/api/population/state/new_mexico/city/zzz"
    );
    assert.strictEqual(resp.status, 400);
  });
  it("throws a 400 when you GET an invalid state", async () => {
    const resp = await fetch(
      baseURL + "/api/population/state/canada/city/toronto"
    );
    assert.strictEqual(resp.status, 400);
  });
  it("returns the population as a number in JSON", async () => {
    const resp = await fetch(
      baseURL + "/api/population/state/maryland/city/annapolis"
    );
    assert.strictEqual(resp.status, 200);
    const data = await resp.json();
    const isPopulationNotANumber = isNaN(data.population);
    assert.strictEqual(isPopulationNotANumber, false);
  });
  it("updates a city if it exists", async () => {
    const resp = await fetch(
      baseURL + "/api/population/state/california/city/taft"
    );
    assert.strictEqual(resp.status, 200);
    const { population } = await resp.json();
    const resp2 = await fetch(
      baseURL + "/api/population/state/california/city/taft",
      { method: "PUT", body: 5 }
    );
    assert.strictEqual(resp2.status, 200);
    const resp3 = await fetch(
      baseURL + "/api/population/state/california/city/taft"
    );
    const { population: populationEdit } = await resp3.json();
    assert.strictEqual(populationEdit, 5);
    const resp4 = await fetch(
      baseURL + "/api/population/state/california/city/taft",
      { method: "PUT", body: population }
    );
    if (resp4.status !== 200) {
      throw new Error("California Taft population should be " + population);
    }
  });
  it("creates a new city if it does not exist", async () => {
    const endpoint = baseURL + "/api/population/state/california/city/zzz";
    const resp = await fetch(endpoint);
    assert.strictEqual(resp.status, 400);
    const resp2 = await fetch(endpoint, { method: "PUT", body: 5 });
    assert.strictEqual(resp2.status, 201);
    const resp3 = await fetch(endpoint);
    const { population: populationEdit } = await resp3.json();
    assert.strictEqual(populationEdit, 5);
    await fs.rm(`./data/california/zzz.txt`);
  });
  it("throws a 400 if the body is not a number", async () => {
    const endpoint = baseURL + "/api/population/state/california/city/zzzz";
    const resp = await fetch(endpoint);
    assert.strictEqual(resp.status, 400);
    const resp2 = await fetch(endpoint, {
      method: "PUT",
      body: "who cares about sanitation?",
    });
    assert.strictEqual(resp2.status, 400);
  });
  it("throws a 400 if you try adding a city to a non-existent state", async () => {
    const endpoint = baseURL + "/api/population/state/canada/city/zzzz";
    const resp = await fetch(endpoint, { method: "PUT", body: 5 });
    assert.strictEqual(resp.status, 400);
  });
});
