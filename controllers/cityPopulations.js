import fs from "fs/promises";

export async function getPopulation(stateCity) {
  try {
    const contents = await fs.readFile(`./data/${stateCity}.txt`, {
      encoding: "utf-8",
    });
    return Number(contents);
  } catch (err) {
    if (err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

export async function updatePopulation(stateCity, number) {
  try {
    const filePath = `./data/${stateCity}.txt`;
    let didCreate = false;
    try {
      await fs.stat(filePath);
    } catch (err) {
      if (err.code === "ENOENT") {
        didCreate = true;
      } else throw err;
    }
    await fs.writeFile(filePath, number);
    return { didCreate, population: Number(number) };
  } catch (err) {
    if (err.code === "ENOENT") {
      return { population: null };
    }
    throw err;
  }
}
