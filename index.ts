import {
  Keypair,
  Connection,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const con = new Connection("http://127.0.0.1:8899", "confirmed");

async function main() {
  const userAccount = new Keypair();
  const dataAccount = new Keypair();

  const airdropping = await con.requestAirdrop(
    userAccount.publicKey,
    5000_000_000
  );
  await con.confirmTransaction(airdropping);

  const balance = await con.getBalance(userAccount.publicKey);

  console.log("user account public key : ", userAccount.publicKey.toString());
  console.log("balacnce : ", balance);

  const rent_amt = await con.getMinimumBalanceForRentExemption(8);

  console.log("rent_amt : ", rent_amt);

  const instruction = await SystemProgram.createAccount({
    fromPubkey: userAccount.publicKey,
    newAccountPubkey: dataAccount.publicKey,
    lamports: rent_amt,
    space: 8,
    programId: SystemProgram.programId,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = userAccount.publicKey;
  transaction.recentBlockhash = (await con.getLatestBlockhash()).blockhash; // this field is mandatory, in solana the transaction success are time bounded to 20sec, means if the transaction is not confirmed in 20sec then it will never get confirmed.

  // solana expects the userAccount as well as dataAccount(that is to be created) sign the trasnaction during the creation of the data account.
  await con.sendTransaction(transaction, [userAccount, ]);

  console.log("dataaccount public key : ", dataAccount.publicKey.toString());
}

main();
