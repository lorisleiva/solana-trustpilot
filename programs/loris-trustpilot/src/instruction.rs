use borsh::{BorshDeserialize, BorshSerialize};
use shank::ShankInstruction;
use solana_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
};

use crate::state::Domain;

#[derive(Debug, Clone, ShankInstruction, BorshSerialize, BorshDeserialize)]
#[rustfmt::skip]
pub enum LorisTrustpilotInstruction {
    /// Creates a new domain PDA.
    /// This instruction is permissionless.
    #[account(0, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(1, writable, name="domain", desc = "The domain PDA. Seeds: ['domain', domain string]")]
    #[account(2, name="system_program", desc = "The system program")]
    CreateDomain { domain_name: String },

    /// Writes a new review for a given domain.
    #[account(0, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(1, signer, name="reviewer", desc = "The account reviewing the domain")]
    #[account(2, writable, name="domain", desc = "The domain PDA. Seeds: ['domain', domain string]")]
    #[account(3, writable, name="review", desc = "The review PDA. Seeds: ['review', domain PDA, reviewer]")]
    #[account(4, name="system_program", desc = "The system program")]
    WriteReview { stars: u8, comment: String },

    /// Update an existing review for a given domain.
    #[account(0, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(1, signer, name="reviewer", desc = "The account reviewing the domain")]
    #[account(2, writable, name="domain", desc = "The domain PDA. Seeds: ['domain', domain string]")]
    #[account(3, writable, name="review", desc = "The review PDA. Seeds: ['review', domain PDA, reviewer]")]
    #[account(4, name="system_program", desc = "The system program")]
    UpdateReview { stars: u8, comment: String },

    /// Deletes an existing review for a given domain.
    #[account(0, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(1, signer, name="reviewer", desc = "The account reviewing the domain")]
    #[account(2, writable, name="domain", desc = "The domain PDA. Seeds: ['domain', domain string]")]
    #[account(3, writable, name="review", desc = "The review PDA. Seeds: ['review', domain PDA, reviewer]")]
    #[account(4, name="system_program", desc = "The system program")]
    DeleteReview,
}

pub fn create_domain(payer: &Pubkey, domain_name: &str) -> Instruction {
    let domain_name = domain_name.to_string();
    let accounts = vec![
        AccountMeta::new(*payer, true),
        AccountMeta::new(Domain::find_pda(&domain_name).0, false),
        AccountMeta::new_readonly(solana_program::system_program::ID, false),
    ];
    Instruction {
        program_id: crate::ID,
        accounts,
        data: LorisTrustpilotInstruction::CreateDomain { domain_name }
            .try_to_vec()
            .unwrap(),
    }
}
