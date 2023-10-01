use crate::assertions::{
    assert_account_key, assert_empty, assert_non_empty, assert_pda, assert_program_owner,
    assert_same_pubkeys, assert_signer, assert_writable,
};
use crate::error::LorisTrustpilotError;
use crate::instruction::LorisTrustpilotInstruction;
use crate::state::{Domain, Key, Review};
use crate::utils::{close_account, create_account, realloc_account};
use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_program,
    sysvar::Sysvar,
};

pub struct Processor;
impl Processor {
    pub fn process_instruction(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction: LorisTrustpilotInstruction =
            LorisTrustpilotInstruction::try_from_slice(instruction_data)?;
        match instruction {
            LorisTrustpilotInstruction::CreateDomain { domain_name } => {
                msg!("Instruction: CreateDomain");
                create_domain(accounts, domain_name)
            }
            LorisTrustpilotInstruction::WriteReview { stars, comment } => {
                msg!("Instruction: WriteReview");
                write_review(accounts, stars, comment)
            }
            LorisTrustpilotInstruction::UpdateReview { stars, comment } => {
                msg!("Instruction: UpdateReview");
                update_review(accounts, stars, comment)
            }
            LorisTrustpilotInstruction::DeleteReview => {
                msg!("Instruction: DeleteReview");
                delete_review(accounts)
            }
        }
    }
}

fn create_domain(accounts: &[AccountInfo], domain_name: String) -> ProgramResult {
    // Accounts.
    let account_info_iter = &mut accounts.iter();
    let payer = next_account_info(account_info_iter)?;
    let domain = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Guards.
    assert_signer("payer", payer)?;
    assert_writable("payer", payer)?;
    assert_writable("domain", domain)?;
    let domain_bump = assert_pda("domain", domain, &crate::ID, &Domain::seeds(&domain_name))?;
    assert_same_pubkeys("system_program", system_program, &system_program::id())?;

    // Do nothing if the domain already exists.
    if !domain.data_is_empty() {
        return Ok(());
    }

    // Create Domain PDA.
    let domain_account = Domain {
        key: Key::Domain,
        total_stars: 0,
        total_reviews: 0,
        reviewers: Vec::new(),
        domain_name: domain_name.clone(),
    };
    let mut seeds = Domain::seeds(&domain_name);
    let bump = [domain_bump];
    seeds.push(&bump);
    create_account(
        domain,
        payer,
        system_program,
        domain_account.len(),
        &crate::ID,
        Some(&[&seeds]),
    )?;

    domain_account.save(domain)
}

fn write_review(accounts: &[AccountInfo], stars: u8, comment: String) -> ProgramResult {
    // Accounts.
    let account_info_iter = &mut accounts.iter();
    let payer = next_account_info(account_info_iter)?;
    let reviewer = next_account_info(account_info_iter)?;
    let domain = next_account_info(account_info_iter)?;
    let review = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Guards.
    assert_signer("payer", payer)?;
    assert_writable("payer", payer)?;
    assert_signer("reviewer", reviewer)?;
    assert_writable("domain", domain)?;
    assert_non_empty("domain", domain)?;
    assert_program_owner("domain", domain, &crate::ID)?;
    assert_account_key("domain", domain, Key::Domain)?;
    let mut domain_account = Domain::load(domain)?;
    assert_writable("review", review)?;
    assert_empty("review", review)?;
    let review_bump = assert_pda(
        "review",
        review,
        &crate::ID,
        &Review::seeds(&domain.key, &reviewer.key),
    )?;
    assert_same_pubkeys("system_program", system_program, &system_program::id())?;

    // Create Review PDA.
    let now = Clock::get()?.unix_timestamp;
    let review_account = Review {
        key: Key::Review,
        stars,
        created_at: now,
        updated_at: now,
        reviewer: *reviewer.key,
        domain: *domain.key,
        comment,
    };
    let mut seeds = Review::seeds(&domain.key, &reviewer.key);
    let bump = [review_bump];
    seeds.push(&bump);
    create_account(
        review,
        payer,
        system_program,
        review_account.len(),
        &crate::ID,
        Some(&[&seeds]),
    )?;
    review_account.save(review)?;

    // Update Domain PDA.
    domain_account.total_stars =
        domain_account
            .total_stars
            .checked_add(stars as u64)
            .ok_or::<ProgramError>(LorisTrustpilotError::NumericalOverflow.into())?;
    domain_account.total_reviews = domain_account
        .total_reviews
        .checked_add(1u64)
        .ok_or::<ProgramError>(LorisTrustpilotError::NumericalOverflow.into())?;
    domain_account.reviewers.push(*reviewer.key);

    // Reallocate and save Domain PDA.
    realloc_account(domain, payer, system_program, domain_account.len(), false)?;
    domain_account.save(domain)
}

fn update_review(accounts: &[AccountInfo], stars: u8, comment: String) -> ProgramResult {
    // Accounts.
    let account_info_iter = &mut accounts.iter();
    let payer = next_account_info(account_info_iter)?;
    let reviewer = next_account_info(account_info_iter)?;
    let domain = next_account_info(account_info_iter)?;
    let review = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Guards.
    assert_signer("payer", payer)?;
    assert_writable("payer", payer)?;
    assert_signer("reviewer", reviewer)?;
    assert_writable("domain", domain)?;
    assert_non_empty("domain", domain)?;
    assert_program_owner("domain", domain, &crate::ID)?;
    assert_account_key("domain", domain, Key::Domain)?;
    let mut domain_account = Domain::load(domain)?;
    assert_writable("review", review)?;
    assert_non_empty("review", review)?;
    assert_program_owner("review", review, &crate::ID)?;
    assert_account_key("review", review, Key::Review)?;
    assert_pda(
        "review",
        review,
        &crate::ID,
        &Review::seeds(&domain.key, &reviewer.key),
    )?;
    let mut review_account = Review::load(review)?;
    assert_same_pubkeys("reviewer", reviewer, &review_account.reviewer)?;
    assert_same_pubkeys("system_program", system_program, &system_program::id())?;

    // Update Review PDA.
    let now = Clock::get()?.unix_timestamp;
    let previous_stars = review_account.stars;
    review_account.updated_at = now;
    review_account.stars = stars;
    review_account.comment = comment;

    // Reallocate and save Review PDA.
    realloc_account(review, payer, system_program, review_account.len(), true)?;
    review_account.save(review)?;

    // Update Domain PDA.
    domain_account.total_stars = domain_account
        .total_stars
        .checked_add(stars as u64)
        .ok_or::<ProgramError>(LorisTrustpilotError::NumericalOverflow.into())?
        .checked_sub(previous_stars as u64)
        .ok_or::<ProgramError>(LorisTrustpilotError::NumericalOverflow.into())?;

    // Save Domain PDA.
    domain_account.save(domain)
}

fn delete_review(accounts: &[AccountInfo]) -> ProgramResult {
    // Accounts.
    let account_info_iter = &mut accounts.iter();
    let payer = next_account_info(account_info_iter)?;
    let reviewer = next_account_info(account_info_iter)?;
    let domain = next_account_info(account_info_iter)?;
    let review = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Guards.
    assert_signer("payer", payer)?;
    assert_writable("payer", payer)?;
    assert_signer("reviewer", reviewer)?;
    assert_writable("domain", domain)?;
    assert_non_empty("domain", domain)?;
    assert_program_owner("domain", domain, &crate::ID)?;
    assert_account_key("domain", domain, Key::Domain)?;
    let mut domain_account = Domain::load(domain)?;
    assert_writable("review", review)?;
    assert_non_empty("review", review)?;
    assert_program_owner("review", review, &crate::ID)?;
    assert_account_key("review", review, Key::Review)?;
    assert_pda(
        "review",
        review,
        &crate::ID,
        &Review::seeds(&domain.key, &reviewer.key),
    )?;
    let review_account = Review::load(review)?;
    assert_same_pubkeys("reviewer", reviewer, &review_account.reviewer)?;
    assert_same_pubkeys("system_program", system_program, &system_program::id())?;

    // Close Review PDA.
    close_account(review, payer)?;

    // Update Domain PDA.
    domain_account.total_stars = domain_account
        .total_stars
        .checked_sub(review_account.stars as u64)
        .ok_or::<ProgramError>(LorisTrustpilotError::NumericalOverflow.into())?;
    domain_account.total_reviews = domain_account
        .total_reviews
        .checked_sub(1u64)
        .ok_or::<ProgramError>(LorisTrustpilotError::NumericalOverflow.into())?;
    domain_account.reviewers.retain(|&r| r != *reviewer.key);

    // Reallocate and save Domain PDA.
    realloc_account(domain, payer, system_program, domain_account.len(), true)?;
    domain_account.save(domain)
}
