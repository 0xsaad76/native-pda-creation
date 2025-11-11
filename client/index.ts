import { test, expect, beforeAll, describe } from "bun:test";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

const PROGRAM_ID = new PublicKey(
  "75Zp2SwmevG3tMGTHjjXkXde8KxufKyjqKZUbsThwn5f"
);

describe("Create PDA from client (localnet)", () => {
  let payer: Keypair;
  let pda: PublicKey;
  let bump: number;

  beforeAll(async () => {
    payer = Keypair.generate();

    // Airdrop SOL to payer
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(sig, "confirmed");

    console.log("Airdropped SOL to payer:", payer.publicKey.toBase58());

    // must match seeds from the pda
    [pda, bump] = PublicKey.findProgramAddressSync(
      [payer.publicKey.toBuffer(), Buffer.from("user")],
      PROGRAM_ID
    );

    console.log("Derived PDA:", pda.toBase58());
    console.log("Bump:", bump);

    const ix = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: pda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: Buffer.alloc(0), // No instruction data
    });

    const tx = new Transaction().add(ix);
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.sign(payer);

    const txSig = await connection.sendRawTransaction(tx.serialize());
    const confirmation = await connection.confirmTransaction(
      txSig,
      "confirmed"
    );

    console.log("Transaction signature:", txSig);
    console.log("Transaction confirmation:", confirmation);
  });

  test("should create a PDA", async () => {
    const balance = await connection.getBalance(pda);
    console.log("PDA balance:", balance);

    expect(balance).toBeGreaterThan(0);
    expect(balance).toBe(1_000_000_000);
    console.log("✅ PDA created successfully!");
  });
});
