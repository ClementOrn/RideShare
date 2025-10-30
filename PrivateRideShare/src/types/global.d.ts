/**
 * Global type declarations
 */

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    removeListener: (event: string, handler: (...args: any[]) => void) => void;
    selectedAddress?: string | null;
    networkVersion?: string;
  };
}

declare module '@fhevm/universal-sdk' {
  export function createFhevmInstance(config: {
    chainId: number;
    network: string;
    gatewayUrl: string;
  }): Promise<any>;
}
