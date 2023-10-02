import { generateSignerWithSol } from '@metaplex-foundation/umi-bundle-tests';
import test from 'ava';
import {
  Domain,
  Key,
  Review,
  createDomain,
  fetchDomain,
  fetchReview,
  findDomainPda,
  findReviewPda,
  writeReview,
} from '../src';
import { createUmi } from './_setup';

test('it can write a review to an existing domain', async (t) => {
  // Given a Umi instance and an existing domain.
  const umi = await createUmi();
  const domainName = 'write-review.example.com';
  await createDomain(umi, { domainName }).sendAndConfirm(umi);

  // When a reviewer writes a review for the domain.
  const reviewer = await generateSignerWithSol(umi);
  await writeReview(umi, {
    payer: reviewer,
    reviewer,
    domainName,
    stars: 5,
    comment: 'Great stuff!',
  }).sendAndConfirm(umi);

  // Then the Domain account was updated to include the new review.
  const [domainPda] = findDomainPda(umi, { domainName });
  t.like(await fetchDomain(umi, domainPda), <Domain>{
    publicKey: domainPda,
    key: Key.Domain,
    totalStars: 5n,
    totalReviews: 1n,
    reviewers: [reviewer.publicKey],
    domainName,
  });

  // And an Review account was created with the correct data.
  const [reviewPda] = findReviewPda(umi, {
    domain: domainPda,
    reviewer: reviewer.publicKey,
  });
  const reviewAccount = await fetchReview(umi, reviewPda);
  t.like(reviewAccount, <Review>{
    publicKey: reviewPda,
    key: Key.Review,
    stars: 5,
    reviewer: reviewer.publicKey,
    domain: domainPda,
    comment: 'Great stuff!',
  });
});

test('it cannot write a review for a missing domain', async (t) => {
  // Given a Umi instance.
  const umi = await createUmi();

  // When a reviewer tries to write a review for a missing domain.
  const reviewer = await generateSignerWithSol(umi);
  const promise = writeReview(umi, {
    payer: reviewer,
    reviewer,
    domainName: 'missing.example.com',
    stars: 5,
    comment: 'Great stuff!',
  }).sendAndConfirm(umi);

  // Then we expect a program error.
  await t.throwsAsync(promise, { name: 'ExpectedNonEmptyAccount' });
});
