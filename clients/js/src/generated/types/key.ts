/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Serializer, scalarEnum } from '@metaplex-foundation/umi/serializers';

export enum Key {
  Uninitialized,
  MyAccount,
  MyPdaAccount,
}

export type KeyArgs = Key;

/** @deprecated Use `getKeySerializer()` without any argument instead. */
export function getKeySerializer(_context: object): Serializer<KeyArgs, Key>;
export function getKeySerializer(): Serializer<KeyArgs, Key>;
export function getKeySerializer(
  _context: object = {}
): Serializer<KeyArgs, Key> {
  return scalarEnum<Key>(Key, { description: 'Key' }) as Serializer<
    KeyArgs,
    Key
  >;
}
