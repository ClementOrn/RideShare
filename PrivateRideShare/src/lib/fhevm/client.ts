/**
 * FHEVM Client utilities
 * Wrapper around @fhevm/universal-sdk for client-side operations
 */

import { createFhevmInstance } from '@fhevm/universal-sdk';
import { ethers } from 'ethers';

export class FHEVMClient {
  private instance: any = null;
  private provider: ethers.Provider | null = null;

  async initialize(provider: ethers.Provider) {
    try {
      this.provider = provider;
      const network = await provider.getNetwork();

      this.instance = await createFhevmInstance({
        chainId: Number(network.chainId),
        network: 'sepolia', // Adjust based on network
        gatewayUrl: 'https://gateway.sepolia.zama.ai',
      });

      console.log('FHEVM SDK initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize FHEVM SDK:', error);
      return false;
    }
  }

  /**
   * Encrypt a uint32 value
   */
  async encryptUint32(value: number): Promise<any> {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized');
    }

    try {
      const encrypted = await this.instance.encrypt_uint32(value);
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  /**
   * Decrypt a value
   */
  async decrypt(handle: any, type: string = 'uint32'): Promise<any> {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized');
    }

    try {
      const decrypted = await this.instance.decrypt(handle, type);
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  /**
   * Check if instance is initialized
   */
  isReady(): boolean {
    return this.instance !== null;
  }

  /**
   * Get the instance
   */
  getInstance() {
    return this.instance;
  }
}

// Export singleton instance
export const fhevmClient = new FHEVMClient();
