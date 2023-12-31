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
import { findDomainPda } from '../accounts';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  expectSome,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type CreateDomainInstructionAccounts = {
  /** The account paying for the storage fees */
  payer?: Signer;
  /** The domain PDA. Seeds: ['domain', domain string] */
  domain?: PublicKey | Pda;
  /** The system program */
  systemProgram?: PublicKey | Pda;
};

// Data.
export type CreateDomainInstructionData = {
  discriminator: number;
  domainName: string;
};

export type CreateDomainInstructionDataArgs = { domainName: string };

export function getCreateDomainInstructionDataSerializer(): Serializer<
  CreateDomainInstructionDataArgs,
  CreateDomainInstructionData
> {
  return mapSerializer<
    CreateDomainInstructionDataArgs,
    any,
    CreateDomainInstructionData
  >(
    struct<CreateDomainInstructionData>(
      [
        ['discriminator', u8()],
        ['domainName', string()],
      ],
      { description: 'CreateDomainInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 0 })
  ) as Serializer<CreateDomainInstructionDataArgs, CreateDomainInstructionData>;
}

// Args.
export type CreateDomainInstructionArgs = CreateDomainInstructionDataArgs;

// Instruction.
export function createDomain(
  context: Pick<Context, 'eddsa' | 'payer' | 'programs'>,
  input: CreateDomainInstructionAccounts & CreateDomainInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'lorisTrustpilot',
    '6BvjJHhheqrQpNFkYKAMtd1B7FPTBpxp1QncnwsH3mE7'
  );

  // Accounts.
  const resolvedAccounts = {
    payer: { index: 0, isWritable: true, value: input.payer ?? null },
    domain: { index: 1, isWritable: true, value: input.domain ?? null },
    systemProgram: {
      index: 2,
      isWritable: false,
      value: input.systemProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Arguments.
  const resolvedArgs: CreateDomainInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.payer.value) {
    resolvedAccounts.payer.value = context.payer;
  }
  if (!resolvedAccounts.domain.value) {
    resolvedAccounts.domain.value = findDomainPda(context, {
      domainName: expectSome(resolvedArgs.domainName),
    });
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
  const data = getCreateDomainInstructionDataSerializer().serialize(
    resolvedArgs as CreateDomainInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
