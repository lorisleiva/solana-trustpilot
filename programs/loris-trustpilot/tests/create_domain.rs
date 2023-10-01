#![cfg(feature = "test-bpf")]

use borsh::BorshDeserialize;
use loris_trustpilot::state::Domain;
use solana_program_test::{tokio, ProgramTest};
use solana_sdk::{signature::Signer, transaction::Transaction};

#[tokio::test]
async fn create_domain() {
    let mut context = ProgramTest::new("loris_trustpilot", loris_trustpilot::ID, None)
        .start_with_context()
        .await;

    let ix = loris_trustpilot::instruction::create_domain(&context.payer.pubkey(), "example.com");
    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
        &[&context.payer],
        context.last_blockhash,
    );
    context.banks_client.process_transaction(tx).await.unwrap();

    let domain_pda = Domain::find_pda(&String::from("example.com")).0;
    let account = context.banks_client.get_account(domain_pda).await.unwrap();
    assert!(account.is_some());

    let account = account.unwrap();
    assert_eq!(account.data.len(), 1 + 8 + 8 + 4 + 4 + 11);

    let mut account_data = account.data.as_ref();
    let my_account = Domain::deserialize(&mut account_data).unwrap();
    assert_eq!(my_account.total_stars, 0);
    assert_eq!(my_account.total_reviews, 0);
    assert_eq!(my_account.reviewers, Vec::new());
    assert_eq!(my_account.domain_name, String::from("example.com"));
}
