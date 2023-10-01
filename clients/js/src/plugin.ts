import { UmiPlugin } from '@metaplex-foundation/umi';
import { createLorisTrustpilotProgram } from './generated';

export const lorisTrustpilot = (): UmiPlugin => ({
  install(umi) {
    umi.programs.add(createLorisTrustpilotProgram(), false);
  },
});
