import { PublicKey } from '@metaplex-foundation/umi';
import test from 'ava';
import { Domain, Key, createDomain, fetchDomain, findDomainPda } from '../src';
import { createUmi } from './_setup';

test('it can create a new domain account', async (t) => {
  // Given a Umi instance.
  const umi = await createUmi();

  // When we create a new domain.
  await createDomain(umi, { domainName: 'example.com' }).sendAndConfirm(umi);

  // Then an account was created with the correct data.
  const [domainPda] = findDomainPda(umi, { domainName: 'example.com' });
  t.like(await fetchDomain(umi, domainPda), <Domain>{
    publicKey: domainPda,
    key: Key.Domain,
    totalStars: 0n,
    totalReviews: 0n,
    reviewers: [] as PublicKey[],
    domainName: 'example.com',
  });
});
