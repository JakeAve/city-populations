export function serializeStateCity(state, city) {
    const formattedState = decodeURIComponent(state)
      .toLowerCase()
      .replace(/\s/g, "_");
    const formattedCity = decodeURIComponent(city)
      .toLowerCase()
      .replace(/\s/g, "_");
      return `${formattedState}/${formattedCity}`
}