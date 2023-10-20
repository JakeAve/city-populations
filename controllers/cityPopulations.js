import fs from "fs/promises";

export async function getPopulation(state, city) {
  try {
    const formattedState = decodeURIComponent(state)
      .toLocaleLowerCase()
      .replace(/\s/g, "_");
    const formattedCity = decodeURIComponent(city)
      .toLocaleLowerCase()
      .replace(/\s/g, "_");
    const contents = await fs.readFile(
      `./data/${formattedState}/${formattedCity}.txt`,
      { encoding: "utf-8" }
    );
    return Number(contents);
  } catch (err) {
    if (err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

export async function updatePopulation(state, city, number) {
  try {
    const formattedState = decodeURIComponent(state)
      .toLocaleLowerCase()
      .replace(/\s/g, "_");
    const formattedCity = decodeURIComponent(city)
      .toLocaleLowerCase()
      .replace(/\s/g, "_");
    const filePath = `./data/${formattedState}/${formattedCity}.txt`;
    let didCreate = false;
    try {
      await fs.stat(filePath);
    } catch (err) {
      if (err.code === "ENOENT") {
        didCreate = true;
      } else throw err;
    }
    await fs.writeFile(filePath, number);
    return { didCreate, population: number };
  } catch (err) {
    if (err.code === "ENOENT") {
      return { population: null };
    }
    throw err;
  }
}
