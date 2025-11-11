# 🌀 Solana PDA Creation Example

This project demonstrates how to create a **Program Derived Address (PDA)** using a custom Solana Rust program and a TypeScript client.  
It runs fully on your **local Solana validator** — no mainnet connection required.

---

## 📁 Project Structure

```

project/
├── src/
│   └── lib.rs               # Solana program logic
├── target/deploy/
│   └── contract.so          # Compiled program (generated automatically)
├── Cargo.toml               # Rust build configuration
├── index.test.ts            # Bun test file for client-side execution
└── README.md

```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- 🦀 **Rust** → [Install Rust](https://www.rust-lang.org/tools/install)
- 💠 **Solana CLI** →
  ```bash
  sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
  ```

````

* 🧠 **Bun** (for running TypeScript tests) →

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
* ✅ Confirm all tools are working:

  ```bash
  solana --version
  cargo --version
  bun --version
  ```

---

## 🚀 1. Build the Solana Program

From the root of your project, run:

```bash
cargo build-sbf
```

> This will compile your Rust program for the Solana BPF runtime.

After it finishes, your compiled `.so` file will be here:

```
target/deploy/contract.so
```

---

## 🔑 2. Start Local Solana Validator

Run this in a **new terminal window**:

```bash
solana-test-validator --reset
```

Keep this running — it simulates a full Solana blockchain locally.

---

## 📦 3. Deploy the Program

In another terminal window (while the validator is running):

```bash
solana program deploy ./target/deploy/contract.so
```

This will output something like:

```
Program Id: 6hUgtGJYbccik7HbtKRDiyaq4tdFrjdcquxGgA1hQShA
```

Copy that **Program ID** — you’ll need it for your test file.

---

## 🧩 4. Update Your Test File

Open `index.test.ts` and set your program ID:

```ts
const PROGRAM_ID = new PublicKey("6hUgtGJYbccik7HbtKRDiyaq4tdFrjdcquxGgA1hQShA");
```

---

## 🧪 5. Run the Client Test

Run your Bun test script to simulate a user creating a PDA:

```bash
bun test
```

If everything is configured correctly, you’ll see output like:

```
Airdropped SOL to payer: 3gxQH5...
Derived PDA: 7jKfYt...
Transaction signature: 5H9Dk...
PDA balance: 1000000000
✅ PDA created successfully!
```

---

## 🧠 Troubleshooting

| Issue                                                                 | Fix                                                                               |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| ❌ `Program failed: Cross-program invocation with unauthorized signer` | Ensure PDA seeds match between Rust (`lib.rs`) and TypeScript (`index.test.ts`).  |
| ❌ `Transaction not confirmed`                                         | Make sure your local validator is running.                                        |
| ❌ `Program not found`                                                 | Check that the `.so` path and `PROGRAM_ID` are correct.                           |
| ⚠️ `Balance is 0`                                                     | Verify your program allocates lamports with `system_instruction::create_account`. |

---

## 🧩 PDA Logic Summary

Your Rust program (`lib.rs`) performs these steps:

1. Reads user and PDA accounts from input.
2. Derives a PDA using:

   ```rust
   let seed = &[user_account.key.as_ref(), b"user"];
   let (pda_publickey, bump) = Pubkey::find_program_address(seed, &_program_id);
   ```
3. Creates the PDA account with lamports using:

   ```rust
   let instruction = system_instruction::create_account(
       user_account.key,
       pda.key,
       1000000000,
       8,
       _program_id,
   );
   invoke_signed(&instruction, _accounts, &[signer_seeds])?;
   ```

Your client test then validates that the PDA is successfully created and funded.

---
````
