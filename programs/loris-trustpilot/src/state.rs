use borsh::{BorshDeserialize, BorshSerialize};
use shank::ShankAccount;
use solana_program::account_info::AccountInfo;
use solana_program::entrypoint::ProgramResult;
use solana_program::msg;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;

use crate::error::LorisTrustpilotError;

#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub enum Key {
    Uninitialized,
    Domain,
    Review,
}

#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct Domain {
    pub key: Key,
    pub total_stars: u64,
    pub total_reviews: u64,
    pub reviewers: Vec<Pubkey>,
    pub domain_name: String,
}

impl Domain {
    pub fn len(&self) -> usize {
        1 + 8 + 8 + 4 + self.reviewers.len() * 32 + 4 + self.domain_name.len()
    }

    pub fn seeds(domain_name: &String) -> Vec<&[u8]> {
        vec!["domain".as_bytes(), domain_name.as_ref()]
    }

    pub fn find_pda(domain_name: &String) -> (Pubkey, u8) {
        Pubkey::find_program_address(&Self::seeds(domain_name), &crate::ID)
    }

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        Domain::deserialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            LorisTrustpilotError::DeserializationError.into()
        })
    }

    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        let mut bytes = Vec::with_capacity(account.data_len());
        self.serialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            LorisTrustpilotError::SerializationError
        })?;
        account.try_borrow_mut_data().unwrap()[..bytes.len()].copy_from_slice(&bytes);
        Ok(())
    }
}

#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct Review {
    pub key: Key,
    pub stars: u8,
    pub created_at: i64,
    pub updated_at: i64,
    pub reviewer: Pubkey,
    pub domain: Pubkey,
    pub comment: String,
}

impl Review {
    pub fn len(&self) -> usize {
        1 + 1 + 8 + 8 + 32 + 32 + 4 + self.comment.len()
    }

    pub fn seeds<'a>(domain: &'a Pubkey, reviewer: &'a Pubkey) -> Vec<&'a [u8]> {
        vec!["review".as_bytes(), domain.as_ref(), reviewer.as_ref()]
    }

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        Review::deserialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            LorisTrustpilotError::DeserializationError.into()
        })
    }

    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        let mut bytes = Vec::with_capacity(account.data_len());
        self.serialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            LorisTrustpilotError::SerializationError
        })?;
        account.try_borrow_mut_data().unwrap()[..bytes.len()].copy_from_slice(&bytes);
        Ok(())
    }
}
