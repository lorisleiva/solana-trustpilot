/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  ACCOUNT_HEADER_SIZE,
  AccountMeta,
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
  struct,
  u16,
  u32,
  u8,
} from '@metaplex-foundation/umi/serializers';
import { getMyAccountSize } from '../accounts';
import { addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type CreateInstructionAccounts = {
  /** The address of the new account */
  address: Signer;
  /** The authority of the new account */
  authority?: PublicKey | Pda;
  /** The account paying for the storage fees */
  payer?: Signer;
  /** The system program */
  systemProgram?: PublicKey | Pda;
};

// Data.
export type CreateInstructionData = {
  discriminator: number;
  foo: number;
  bar: number;
};

export type CreateInstructionDataArgs = { foo: number; bar: number };

/** @deprecated Use `getCreateInstructionDataSerializer()` without any argument instead. */
export function getCreateInstructionDataSerializer(
  _context: object
): Serializer<CreateInstructionDataArgs, CreateInstructionData>;
export function getCreateInstructionDataSerializer(): Serializer<
  CreateInstructionDataArgs,
  CreateInstructionData
>;
export function getCreateInstructionDataSerializer(
  _context: object = {}
): Serializer<CreateInstructionDataArgs, CreateInstructionData> {
  return mapSerializer<CreateInstructionDataArgs, any, CreateInstructionData>(
    struct<CreateInstructionData>(
      [
        ['discriminator', u8()],
        ['foo', u16()],
        ['bar', u32()],
      ],
      { description: 'CreateInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 0 })
  ) as Serializer<CreateInstructionDataArgs, CreateInstructionData>;
}

// Args.
export type CreateInstructionArgs = CreateInstructionDataArgs;

// Instruction.
export function create(
  context: Pick<Context, 'programs' | 'identity' | 'payer'>,
  input: CreateInstructionAccounts & CreateInstructionArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplProjectName',
    'MyProgram1111111111111111111111111111111111'
  );

  // Resolved inputs.
  const resolvedAccounts = {
    address: [input.address, true] as const,
  };
  const resolvingArgs = {};
  addObjectProperty(
    resolvedAccounts,
    'authority',
    input.authority
      ? ([input.authority, false] as const)
      : ([context.identity.publicKey, false] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'payer',
    input.payer
      ? ([input.payer, true] as const)
      : ([context.payer, true] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'systemProgram',
    input.systemProgram
      ? ([input.systemProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'splSystem',
            '11111111111111111111111111111111'
          ),
          false,
        ] as const)
  );
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.address, false);
  addAccountMeta(keys, signers, resolvedAccounts.authority, false);
  addAccountMeta(keys, signers, resolvedAccounts.payer, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);

  // Data.
  const data = getCreateInstructionDataSerializer().serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = getMyAccountSize() + ACCOUNT_HEADER_SIZE;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}