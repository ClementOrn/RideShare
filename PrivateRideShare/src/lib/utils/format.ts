/**
 * Formatting utilities
 */

/**
 * Format Ethereum address
 */
export function formatAddress(address: string): string {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return 'N/A';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}

/**
 * Format wei to ETH
 */
export function formatEther(wei: bigint | string): string {
  const value = typeof wei === 'string' ? BigInt(wei) : wei;
  const eth = Number(value) / 1e18;
  return eth.toFixed(4);
}

/**
 * Parse ETH to wei
 */
export function parseEther(eth: string): bigint {
  return BigInt(Math.floor(parseFloat(eth) * 1e18));
}
