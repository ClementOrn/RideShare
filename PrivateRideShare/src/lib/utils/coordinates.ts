/**
 * Coordinate conversion utilities
 * Convert between decimal and integer representations
 */

const COORDINATE_MULTIPLIER = 1000000;

/**
 * Convert decimal coordinate to integer (multiply by 1,000,000)
 */
export function coordinateToInt(coord: number): number {
  return Math.floor(coord * COORDINATE_MULTIPLIER);
}

/**
 * Convert integer coordinate back to decimal (divide by 1,000,000)
 */
export function intToCoordinate(coordInt: number): number {
  return coordInt / COORDINATE_MULTIPLIER;
}

/**
 * Validate coordinate values
 */
export function validateCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Format coordinate for display
 */
export function formatCoordinate(coord: number): string {
  return coord.toFixed(6);
}
