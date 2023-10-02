import { PublicKey } from '@metaplex-foundation/umi';
import { generateSignerWithSol } from '@metaplex-foundation/umi-bundle-tests';
import test from 'ava';
import {
  Domain,
  Key,
  createDomain,
  deleteReview,
  fetchDomain,
  findDomainPda,
  findReviewPda,
  writeReview,
} from '../src';
import { createUmi } from './_setup';

test('it can delete an existing review on a domain', async (t) => {
  // Given a Umi instance and an existing review on a domain.
  const umi = await createUmi();
  const domainName = 'delete-review.example.com';
  const reviewer = await generateSignerWithSol(umi);
  await createDomain(umi, { domainName })
    .add(
      writeReview(umi, {
        payer: reviewer,
        reviewer,
        domainName,
        stars: 5,
        comment: 'Great stuff!',
      })
    )
    .sendAndConfirm(umi);

  // When the reviewer deletes its review for the domain.
  await deleteReview(umi, {
    payer: reviewer,
    reviewer,
    domainName,
  }).sendAndConfirm(umi);

  // Then the Domain account was updated.
  const [domainPda] = findDomainPda(umi, { domainName });
  t.like(await fetchDomain(umi, domainPda), <Domain>{
    publicKey: domainPda,
    key: Key.Domain,
    totalStars: 0n,
    totalReviews: 0n,
    reviewers: [] as PublicKey[],
    domainName,
  });

  // And the Review account was deleted.
  const [reviewPda] = findReviewPda(umi, {
    domain: domainPda,
    reviewer: reviewer.publicKey,
  });
  t.false(await umi.rpc.accountExists(reviewPda));
});

test('it cannot delete a non-existing review', async (t) => {
  // Given a Umi instance and an existing domain.
  const umi = await createUmi();
  const domainName = 'delete-review-2.example.com';
  await createDomain(umi, { domainName }).sendAndConfirm(umi);

  // When a reviewer tries to delete a non-existing review.
  const reviewer = await generateSignerWithSol(umi);
  const promise = deleteReview(umi, {
    payer: reviewer,
    reviewer,
    domainName,
  }).sendAndConfirm(umi);

  // Then we expect a program error.
  await t.throwsAsync(promise, { name: 'ExpectedNonEmptyAccount' });
});
