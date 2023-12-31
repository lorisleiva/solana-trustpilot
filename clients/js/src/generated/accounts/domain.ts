/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  Context,
  Pda,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  publicKey as toPublicKey,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  array,
  mapSerializer,
  publicKey as publicKeySerializer,
  string,
  struct,
  u64,
} from '@metaplex-foundation/umi/serializers';
import { Key, KeyArgs, getKeySerializer } from '../types';

export type Domain = Account<DomainAccountData>;

export type DomainAccountData = {
  key: Key;
  totalStars: bigint;
  totalReviews: bigint;
  reviewers: Array<PublicKey>;
  domainName: string;
};

export type DomainAccountDataArgs = {
  totalStars: number | bigint;
  totalReviews: number | bigint;
  reviewers: Array<PublicKey>;
  domainName: string;
};

export function getDomainAccountDataSerializer(): Serializer<
  DomainAccountDataArgs,
  DomainAccountData
> {
  return mapSerializer<DomainAccountDataArgs, any, DomainAccountData>(
    struct<DomainAccountData>(
      [
        ['key', getKeySerializer()],
        ['totalStars', u64()],
        ['totalReviews', u64()],
        ['reviewers', array(publicKeySerializer())],
        ['domainName', string()],
      ],
      { description: 'DomainAccountData' }
    ),
    (value) => ({ ...value, key: Key.Domain })
  ) as Serializer<DomainAccountDataArgs, DomainAccountData>;
}

export function deserializeDomain(rawAccount: RpcAccount): Domain {
  return deserializeAccount(rawAccount, getDomainAccountDataSerializer());
}

export async function fetchDomain(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<Domain> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  assertAccountExists(maybeAccount, 'Domain');
  return deserializeDomain(maybeAccount);
}

export async function safeFetchDomain(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<Domain | null> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  return maybeAccount.exists ? deserializeDomain(maybeAccount) : null;
}

export async function fetchAllDomain(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<Domain[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'Domain');
    return deserializeDomain(maybeAccount);
  });
}

export async function safeFetchAllDomain(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<Domain[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) => deserializeDomain(maybeAccount as RpcAccount));
}

export function getDomainGpaBuilder(
  context: Pick<Context, 'rpc' | 'programs'>
) {
  const programId = context.programs.getPublicKey(
    'lorisTrustpilot',
    '6BvjJHhheqrQpNFkYKAMtd1B7FPTBpxp1QncnwsH3mE7'
  );
  return gpaBuilder(context, programId)
    .registerFields<{
      key: KeyArgs;
      totalStars: number | bigint;
      totalReviews: number | bigint;
      reviewers: Array<PublicKey>;
      domainName: string;
    }>({
      key: [0, getKeySerializer()],
      totalStars: [1, u64()],
      totalReviews: [9, u64()],
      reviewers: [17, array(publicKeySerializer())],
      domainName: [null, string()],
    })
    .deserializeUsing<Domain>((account) => deserializeDomain(account))
    .whereField('key', Key.Domain);
}

export function findDomainPda(
  context: Pick<Context, 'eddsa' | 'programs'>,
  seeds: {
    /** The domain name to review */
    domainName: string;
  }
): Pda {
  const programId = context.programs.getPublicKey(
    'lorisTrustpilot',
    '6BvjJHhheqrQpNFkYKAMtd1B7FPTBpxp1QncnwsH3mE7'
  );
  return context.eddsa.findPda(programId, [
    string({ size: 'variable' }).serialize('domain'),
    string({ size: 'variable' }).serialize(seeds.domainName),
  ]);
}

export async function fetchDomainFromSeeds(
  context: Pick<Context, 'eddsa' | 'programs' | 'rpc'>,
  seeds: Parameters<typeof findDomainPda>[1],
  options?: RpcGetAccountOptions
): Promise<Domain> {
  return fetchDomain(context, findDomainPda(context, seeds), options);
}

export async function safeFetchDomainFromSeeds(
  context: Pick<Context, 'eddsa' | 'programs' | 'rpc'>,
  seeds: Parameters<typeof findDomainPda>[1],
  options?: RpcGetAccountOptions
): Promise<Domain | null> {
  return safeFetchDomain(context, findDomainPda(context, seeds), options);
}
