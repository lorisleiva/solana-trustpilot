/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  mapSerializer,
  string,
  struct,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type UpdateReviewInstructionAccounts = {
  /** The account paying for the storage fees */
  payer?: Signer;
  /** The account reviewing the domain */
  reviewer: Signer;
  /** The domain PDA. Seeds: ['domain', domain string] */
  domain: PublicKey | Pda;
  /** The review PDA. Seeds: ['review', domain PDA, reviewer] */
  review: PublicKey | Pda;
  /** The system program */
  systemProgram?: PublicKey | Pda;
};

// Data.
export type UpdateReviewInstructionData = {
  discriminator: number;
  stars: number;
  comment: string;
};

export type UpdateReviewInstructionDataArgs = {
  stars: number;
  comment: string;
};

export function getUpdateReviewInstructionDataSerializer(): Serializer<
  UpdateReviewInstructionDataArgs,
  UpdateReviewInstructionData
> {
  return mapSerializer<
    UpdateReviewInstructionDataArgs,
    any,
    UpdateReviewInstructionData
  >(
    struct<UpdateReviewInstructionData>(
      [
        ['discriminator', u8()],
        ['stars', u8()],
        ['comment', string()],
      ],
      { description: 'UpdateReviewInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 2 })
  ) as Serializer<UpdateReviewInstructionDataArgs, UpdateReviewInstructionData>;
}

// Args.
export type UpdateReviewInstructionArgs = UpdateReviewInstructionDataArgs;

// Instruction.
export function updateReview(
  context: Pick<Context, 'payer' | 'programs'>,
  input: UpdateReviewInstructionAccounts & UpdateReviewInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'lorisTrustpilot',
    '6BvjJHhheqrQpNFkYKAMtd1B7FPTBpxp1QncnwsH3mE7'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    payer: { index: 0, isWritable: true, value: input.payer ?? null },
    reviewer: { index: 1, isWritable: false, value: input.reviewer ?? null },
    domain: { index: 2, isWritable: true, value: input.domain ?? null },
    review: { index: 3, isWritable: true, value: input.review ?? null },
    systemProgram: {
      index: 4,
      isWritable: false,
      value: input.systemProgram ?? null,
    },
  };

  // Arguments.
  const resolvedArgs: UpdateReviewInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.payer.value) {
    resolvedAccounts.payer.value = context.payer;
  }
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    );
    resolvedAccounts.systemProgram.isWritable = false;
  }

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    'programId',
    programId
  );

  // Data.
  const data = getUpdateReviewInstructionDataSerializer().serialize(
    resolvedArgs as UpdateReviewInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}