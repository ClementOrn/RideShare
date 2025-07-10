import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id';

export const config = getDefaultConfig({
  appName: 'Private Rideshare Platform',
  projectId,
  chains: [sepolia],
  ssr: true,
});
