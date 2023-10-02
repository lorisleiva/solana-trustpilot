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
  updateReview,
  writeReview,
} from '../src';
import { createUmi } from './_setup';

test('it can update an existing review on a domain', async (t) => {
  // Given a Umi instance and an existing review on a domain.
  const umi = await createUmi();
  const domainName = 'update-review.example.com';
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

  // When a reviewer writes a review for the domain.
  await updateReview(umi, {
    payer: reviewer,
    reviewer,
    domainName,
    stars: 3,
    comment: 'Not-so-great stuff!',
  }).sendAndConfirm(umi);

  // Then the Domain account was updated.
  const [domainPda] = findDomainPda(umi, { domainName });
  t.like(await fetchDomain(umi, domainPda), <Domain>{
    publicKey: domainPda,
    key: Key.Domain,
    totalStars: 3n,
    totalReviews: 1n,
    reviewers: [reviewer.publicKey],
    domainName,
  });

  // And the Review account was updated as well.
  const [reviewPda] = findReviewPda(umi, {
    domain: domainPda,
    reviewer: reviewer.publicKey,
  });
  const reviewAccount = await fetchReview(umi, reviewPda);
  t.like(reviewAccount, <Review>{
    publicKey: reviewPda,
    key: Key.Review,
    stars: 3,
    reviewer: reviewer.publicKey,
    domain: domainPda,
    comment: 'Not-so-great stuff!',
  });
});

test('it cannot update a non-existing review', async (t) => {
  // Given a Umi instance and an existing domain.
  const umi = await createUmi();
  const domainName = 'update-review-2.example.com';
  await createDomain(umi, { domainName }).sendAndConfirm(umi);

  // When a reviewer writes a review for a missing domain.
  const reviewer = await generateSignerWithSol(umi);
  const promise = updateReview(umi, {
    payer: reviewer,
    reviewer,
    domainName,
    stars: 3,
    comment: 'Not-so-great stuff!',
  }).sendAndConfirm(umi);

  // Then we expect a program error.
  await t.throwsAsync(promise, { name: 'ExpectedNonEmptyAccount' });
});
