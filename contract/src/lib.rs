use crate::entrypoint::entrypoint;

use solana_program::{
    account_info::{ AccountInfo, next_account_info },
    entrypoint::{ self, ProgramResult },
    msg,
    program::invoke_signed,
    pubkey::Pubkey, system_instruction,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8]
) -> ProgramResult {
    let iter = &mut _accounts.iter();

    // the below must be in the order
    let user_account = next_account_info(iter)?;
    let pda = next_account_info(iter)?;
    let system_program = next_account_info(iter)?;

    let seed = &[user_account.key.as_ref(), b"user"];
    let (pda_publickey, bump) = Pubkey::find_program_address(seed, &_program_id);

    msg!("pda address from the bump find instruction {}", pda_publickey);

    let instruction = system_instruction::create_account(
        user_account.key,
        pda.key,
        1000000000,
        8,
        _program_id
    );

    let bump_seed = &[bump];
    let signer_seeds: &[&[u8]] = &[user_account.key.as_ref(), b"user", bump_seed];
    invoke_signed(&instruction, _accounts, &[signer_seeds])?;

    Ok(())
}
