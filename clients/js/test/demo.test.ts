import { generateSignerWithSol } from '@metaplex-foundation/umi-bundle-tests';
import test from 'ava';
import {
  Domain,
  Key,
  Review,
  createDomain,
  deleteReview,
  fetchDomain,
  fetchReview,
  findDomainPda,
  findReviewPda,
  updateReview,
  writeReview,
} from '../src';
import { createUmi } from './_setup';

test('it can write, update and delete reviews for specific domain names', async (t) => {
  // Umi.
  const umi = await createUmi();

  // Wallets.
  const reviewerA = await generateSignerWithSol(umi);
  const reviewerB = await generateSignerWithSol(umi);

  // PDAs.
  const [domainPda] = findDomainPda(umi, { domainName: 'example.com' });
  const [reviewAPda] = findReviewPda(umi, {
    domain: domainPda,
    reviewer: reviewerA.publicKey,
  });
  const [reviewBPda] = findReviewPda(umi, {
    domain: domainPda,
    reviewer: reviewerB.publicKey,
  });

  // Write Review A.
  await createDomain(umi, { domainName: 'example.com' })
    .add(
      writeReview(umi, {
        payer: reviewerA,
        reviewer: reviewerA,
        domainName: 'example.com',
        stars: 5,
        comment: 'Great stuff!',
      })
    )
    .sendAndConfirm(umi);

  // Assert.
  t.like(await fetchDomain(umi, domainPda), <Domain>{
    publicKey: domainPda,
    key: Key.Domain,
    totalStars: 5n,
    totalReviews: 1n,
    reviewers: [reviewerA.publicKey],
    domainName: 'example.com',
  });
  t.like(await fetchReview(umi, reviewAPda), <Review>{
    publicKey: reviewAPda,
    key: Key.Review,
    stars: 5,
    reviewer: reviewerA.publicKey,
    domain: domainPda,
    comment: 'Great stuff!',
  });

  // Write Review B.
  await writeReview(umi, {
    payer: reviewerB,
    reviewer: reviewerB,
    domainName: 'example.com',
    stars: 1,
    comment: 'SCAM!',
  }).sendAndConfirm(umi);

  // Assert.
  t.like(await fetchDomain(umi, domainPda), <Domain>{
    totalStars: 6n,
    totalReviews: 2n,
    reviewers: [reviewerA.publicKey, reviewerB.publicKey],
  });
  t.like(await fetchReview(umi, reviewBPda), <Review>{
    publicKey: reviewBPda,
    key: Key.Review,
    stars: 1,
    reviewer: reviewerB.publicKey,
    domain: domainPda,
    comment: 'SCAM!',
  });

  // Update Review A.
  await updateReview(umi, {
    payer: reviewerA,
    reviewer: reviewerA,
    domainName: 'example.com',
    stars: 3,
    comment: 'Not-so-great stuff!',
  }).sendAndConfirm(umi);

  // Assert.
  t.like(await fetchDomain(umi, domainPda), <Domain>{
    totalStars: 4n,
    totalReviews: 2n,
    reviewers: [reviewerA.publicKey, reviewerB.publicKey],
  });
  t.like(await fetchReview(umi, reviewAPda), <Review>{
    stars: 3,
    comment: 'Not-so-great stuff!',
  });

  // Delete Review B.
  await deleteReview(umi, {
    payer: reviewerB,
    reviewer: reviewerB,
    domainName: 'example.com',
  }).sendAndConfirm(umi);

  // Assert.
  t.like(await fetchDomain(umi, domainPda), <Domain>{
    totalStars: 3n,
    totalReviews: 1n,
    reviewers: [reviewerA.publicKey],
  });
  t.false(await umi.rpc.accountExists(reviewBPda));
});
