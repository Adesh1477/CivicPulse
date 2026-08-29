export const CITY_LOCATIONS = [
  { id: "mg-road-sector-4", sector: "Sec 4", area: "Central District", address: "MG Road, Sector 4", landmark: "City Plaza", mapX: 325, mapY: 230, latitude: 12.9716, longitude: 77.5946 },
  { id: "lakeview-sector-7", sector: "Sec 7", area: "North Park", address: "Lakeview Avenue, Sector 7", landmark: "Botanical Park", mapX: 240, mapY: 360, latitude: 12.978, longitude: 77.586 },
  { id: "tramline-sector-3", sector: "Sec 3", area: "Transit Hub", address: "Tramline Road, Sector 3", landmark: "Transit Terminal", mapX: 500, mapY: 180, latitude: 12.974, longitude: 77.601 },
  { id: "market-sector-9", sector: "Sec 9", area: "Marketplace", address: "Market Street, Sector 9", landmark: "City Market", mapX: 745, mapY: 300, latitude: 12.968, longitude: 77.61 },
  { id: "riverside-sector-11", sector: "Sec 11", area: "Waterfront", address: "Riverside Avenue, Sector 11", landmark: "Reservoir", mapX: 430, mapY: 470, latitude: 12.963, longitude: 77.592 }
];

export function getLocationById(id) {
  return CITY_LOCATIONS.find((loc) => loc.id === id) || CITY_LOCATIONS[0];
}

export function getLocationByAddress(address = "") {
  if (!address) return CITY_LOCATIONS[0];
  const normalized = address.toLowerCase();
  return CITY_LOCATIONS.find((loc) => loc.address.toLowerCase().includes(normalized) || normalized.includes(loc.address.toLowerCase())) || CITY_LOCATIONS[0];
}
