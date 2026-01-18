---
layout  : wiki
title   : BITCOIN NODE - Transaction
summary : 
date    : 2026-01-18 17:54:32 +0900
updated : 2026-01-18 18:15:24 +0900
tag     : blockchain bitcoin tdd
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
toy     : Bitcoin
---
* TOC
{:toc}

# BITCOIN NODE - Transaction

![](/resource/wiki/blockchain-bitnode-transaction/transaction.png)

## Why Transactions Are the Heart of Bitcoin

If Bitcoin were a living organism, **transactions would be its heartbeat**. Every action in the Bitcoin network—sending money, receiving money, mining rewards—is expressed as a transaction. Understanding transactions is fundamental to understanding Bitcoin itself.

### What Makes Bitcoin Transactions Special?

1. **Immutable**: Once confirmed in a block, transactions cannot be altered or reversed
2. **Transparent**: Every transaction is visible on the blockchain for anyone to verify
3. **Scriptable**: Transactions use a simple programming language (Bitcoin Script) to define spending conditions
4. **Efficient**: VarInt encoding and UTXO model minimize blockchain size
5. **Secure**: Double SHA-256 hashing ensures transaction integrity

### The Flow of Value

```
┌─────────────┐
│  Previous   │
│ Transaction │ ────┐
│   Output    │     │
└─────────────┘     │
                    ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    Input    │  │    NEW      │  │   Output 0  │
│  (Unlocks   │──▶│ TRANSACTION │──▶│ (Locks to  │
│   UTXO)     │  │             │  │  Address A) │
└─────────────┘  └─────────────┘  └─────────────┘
                                  │   Output 1  │
                                  │ (Change to  │
                                  │  Sender)    │
                                  └─────────────┘
```

A transaction **consumes** previous outputs (inputs) and **creates** new outputs. This forms a chain of ownership that goes all the way back to coinbase transactions (newly created coins).

## The UTXO Model

Bitcoin uses the **UTXO** (Unspent Transaction Output) model, which is fundamentally different from the account-based model used by traditional banking systems.

### Account Model vs UTXO Model

**Account Model** (Banks, Ethereum):
```
Account Balance Ledger:
┌──────────────┬─────────┐
│   Account    │ Balance │
├──────────────┼─────────┤
│ Alice        │  $1,000 │
│ Bob          │    $500 │
│ Charlie      │  $2,000 │
└──────────────┴─────────┘

Transaction: Alice sends Bob $100
Result: Alice = $900, Bob = $600
```

**UTXO Model** (Bitcoin):
```
UTXO Set (Unspent Outputs):
┌──────────┬────────┬───────┬──────────┐
│   TXID   │ Output │ Value │  Owner   │
├──────────┼────────┼───────┼──────────┤
│ 4a5e1e.. │   0    │ 1 BTC │  Alice   │
│ 7b3c2a.. │   1    │ 2 BTC │  Bob     │
│ 9f8d5b.. │   2    │ 0.5   │  Charlie │
└──────────┴────────┴───────┴──────────┘

Transaction: Alice sends Bob 0.3 BTC

Input:  Consumes Alice's 1 BTC output
Output 0: Creates 0.3 BTC output for Bob
Output 1: Creates 0.7 BTC output for Alice (change)

New UTXO Set:
┌──────────┬────────┬───────┬──────────┐
│   TXID   │ Output │ Value │  Owner   │
├──────────┼────────┼───────┼──────────┤
│ new_tx.. │   0    │ 0.3   │  Bob     │  ← NEW
│ new_tx.. │   1    │ 0.7   │  Alice   │  ← NEW (change)
│ 7b3c2a.. │   1    │ 2 BTC │  Bob     │
│ 9f8d5b.. │   2    │ 0.5   │  Charlie │
└──────────┴────────┴───────┴──────────┘
```

### Why UTXO?

1. **Parallel Validation**: Different transactions spending different UTXOs can be validated in parallel
2. **Stateless Verification**: You only need the referenced UTXO to verify a transaction, not the entire history
3. **Double-Spend Prevention**: Once a UTXO is spent, it's removed from the set—no race conditions
4. **Privacy**: Users can generate new addresses for each transaction
5. **Simplicity**: Clear ownership chain—either a UTXO exists (unspent) or it doesn't (spent)

## Transaction Structure

A Bitcoin transaction consists of four main components:

```go
type Transaction struct {
    Version  int32      // Protocol version (usually 1 or 2)
    Inputs   []TxInput  // List of inputs (spending UTXOs)
    Outputs  []TxOutput // List of outputs (creating new UTXOs)
    LockTime uint32     // Earliest time/block for mining
}
```

### Transaction Input (TxInput)

```go
type TxInput struct {
    PreviousTxHash   [32]byte  // Which transaction?
    PreviousOutIndex uint32    // Which output of that transaction?
    ScriptSig        []byte    // Proof of ownership (signature + pubkey)
    Sequence         uint32    // Originally for RBF, now mostly 0xffffffff
}
```

Sequence 는 "초기에는 업데이트용으로 설계되었으나, 현재는 RBF(수수료 증액) 외에도 **OP_CSV(상대적 시간 잠금)** 를 구현하는 데 사용된다."

**What an input does:**
- **Points to** a previous output (UTXO) using `PreviousTxHash` + `PreviousOutIndex`
- **Proves ownership** by providing a signature (`ScriptSig`) that satisfies the previous output's locking conditions

**Special Case - Coinbase Input:**

A coinbase input creates new bitcoins (block reward). It's identified by:
- `PreviousTxHash`: All zeros (32 bytes of `0x00`)
- `PreviousOutIndex`: `0xffffffff` (maximum uint32 value)

Coinbase inputs don't spend existing UTXOs—they create new coins from thin air (within protocol limits).

```go
func (in *TxInput) IsCoinbase() bool {
    // Check if previous tx hash is all zeros
    for _, b := range in.PreviousTxHash {
        if b != 0 {
            return false
        }
    }
    // Check if previous output index is 0xffffffff
    return in.PreviousOutIndex == 0xffffffff
}
```

### Transaction Output (TxOutput)

```go
type TxOutput struct {
    Value        int64  // Amount in satoshis (1 BTC = 100,000,000 satoshis)
    ScriptPubKey []byte // Locking script (defines spending conditions)
}
```

**What an output does:**
- **Locks** a specific amount of bitcoin (`Value`) to a cryptographic condition
- **Defines** who can spend it via `ScriptPubKey` (typically "prove you own this public key")

**Example Values:**
```
50 BTC     = 5,000,000,000 satoshis (Genesis Block reward)
1 BTC      =   100,000,000 satoshis
0.01 BTC   =     1,000,000 satoshis
0.00000001 =             1 satoshi (smallest unit)
```

### Binary Serialization Format

Bitcoin transactions are transmitted as binary data over the network:

```
┌─────────────────────────────────────────────────────────┐
│                    TRANSACTION BINARY FORMAT            │
├─────────────────────────────────────────────────────────┤
│ Version (4 bytes, int32, little-endian)                 │
├─────────────────────────────────────────────────────────┤
│ Input Count (VarInt)                                    │
├─────────────────────────────────────────────────────────┤
│ ┌─ For Each Input ─────────────────────────────────┐   │
│ │ Previous TX Hash (32 bytes)                      │   │
│ │ Previous Output Index (4 bytes, uint32, LE)      │   │
│ │ Script Length (VarInt)                           │   │
│ │ ScriptSig (variable bytes)                       │   │
│ │ Sequence (4 bytes, uint32, LE)                   │   │
│ └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ Output Count (VarInt)                                   │
├─────────────────────────────────────────────────────────┤
│ ┌─ For Each Output ────────────────────────────────┐   │
│ │ Value (8 bytes, int64, little-endian)            │   │
│ │ Script Length (VarInt)                           │   │
│ │ ScriptPubKey (variable bytes)                    │   │
│ └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ LockTime (4 bytes, uint32, little-endian)               │
└─────────────────────────────────────────────────────────┘
```

**Why this format?**
1. **Compact**: VarInt encoding saves space for common small values
2. **Deterministic**: Same transaction always serializes to same bytes
3. **Hashable**: Serialized bytes can be hashed to compute TXID
4. **Network-efficient**: Binary format is smaller than JSON/XML

## TDD Implementation Process

Following the **Red-Green-Refactor** cycle, we implemented the transaction package with 97.7% test coverage.

### Phase 1: RED - Write the Tests First

We started by writing tests with **real Bitcoin data**—the Genesis Block coinbase transaction:

```go
func TestGenesisBlockCoinbase(t *testing.T) {
    // Genesis block coinbase transaction (raw hex)
    txHex := "01000000" +  // Version: 1
        "01" +             // Input count: 1
        // Coinbase Input
        "0000000000000000000000000000000000000000000000000000000000000000" +
        "ffffffff" +       // Coinbase markers
        "4d" +             // Script length: 77 bytes
        "04ffff001d0104455468652054696d65732030332f4a616e2f32303039..." +
        "ffffffff" +       // Sequence
        "01" +             // Output count: 1
        // Output
        "00f2052a01000000" +  // 50 BTC in satoshis
        "43" +                // Script length: 67 bytes
        "4104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962..." +
        "00000000"            // LockTime: 0

    txData, err := hex.DecodeString(txHex)
    require.NoError(t, err)

    // This will fail initially (RED phase)
    tx, err := Deserialize(bytes.NewReader(txData))
    require.NoError(t, err)

    // Verify the transaction
    assert.Equal(t, int32(1), tx.Version)
    assert.Len(t, tx.Inputs, 1)
    assert.True(t, tx.Inputs[0].IsCoinbase())
    assert.Len(t, tx.Outputs, 1)
    assert.Equal(t, int64(5000000000), tx.Outputs[0].Value)

    // Verify TXID
    expectedTXID := "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"
    assert.Equal(t, expectedTXID, tx.TXID())
}
```

**Why start with Genesis Block?**
- It's the first Bitcoin transaction ever created by Satoshi Nakamoto
- It's immutable and well-documented
- If we can parse this correctly, our implementation matches Bitcoin's protocol exactly

### Phase 2: GREEN - Make the Tests Pass

We implemented the structures and methods to make tests pass:

#### Step 1: Define the Structures

```go
type TxInput struct {
    PreviousTxHash   [32]byte
    PreviousOutIndex uint32
    ScriptSig        []byte
    Sequence         uint32
}

type TxOutput struct {
    Value        int64
    ScriptPubKey []byte
}

type Transaction struct {
    Version  int32
    Inputs   []TxInput
    Outputs  []TxOutput
    LockTime uint32
}
```

#### Step 2: Implement Deserialization

```go
func Deserialize(r io.Reader) (*Transaction, error) {
    tx := &Transaction{}

    // 1. Read version (4 bytes, little-endian)
    version, err := encoding.ReadInt32LE(r)
    if err != nil {
        return nil, fmt.Errorf("failed to read version: %w", err)
    }
    tx.Version = version

    // 2. Read input count (VarInt)
    inputCount, err := encoding.ReadVarInt(r)
    if err != nil {
        return nil, fmt.Errorf("failed to read input count: %w", err)
    }

    // 3. Read each input
    tx.Inputs = make([]TxInput, inputCount)
    for i := uint64(0); i < inputCount; i++ {
        input := &tx.Inputs[i]

        // Previous TX hash (32 bytes)
        if _, err := io.ReadFull(r, input.PreviousTxHash[:]); err != nil {
            return nil, fmt.Errorf("failed to read input %d prev hash: %w", i, err)
        }

        // Previous output index (4 bytes)
        prevIndex, err := encoding.ReadUint32LE(r)
        if err != nil {
            return nil, fmt.Errorf("failed to read input %d prev index: %w", i, err)
        }
        input.PreviousOutIndex = prevIndex

        // Script length (VarInt)
        scriptLen, err := encoding.ReadVarInt(r)
        if err != nil {
            return nil, fmt.Errorf("failed to read input %d script length: %w", i, err)
        }

        // ScriptSig
        input.ScriptSig = make([]byte, scriptLen)
        if _, err := io.ReadFull(r, input.ScriptSig); err != nil {
            return nil, fmt.Errorf("failed to read input %d script: %w", i, err)
        }

        // Sequence (4 bytes)
        sequence, err := encoding.ReadUint32LE(r)
        if err != nil {
            return nil, fmt.Errorf("failed to read input %d sequence: %w", i, err)
        }
        input.Sequence = sequence
    }

    // 4. Read output count and outputs (similar pattern)
    // 5. Read locktime
    // ... (see transaction.go for full implementation)

    return tx, nil
}
```

**Key Implementation Details:**
1. **Error Handling**: Every read operation checks for errors
2. **VarInt Usage**: Input/output counts and script lengths use VarInt encoding
3. **Little-Endian**: All multi-byte integers use little-endian byte order
4. **Memory Safety**: We allocate exact sizes for byte slices based on parsed lengths

#### Step 3: Implement Serialization

Serialization is the inverse of deserialization:

```go
func (tx *Transaction) Serialize(w io.Writer) error {
    // 1. Write version
    if err := encoding.WriteInt32LE(w, tx.Version); err != nil {
        return fmt.Errorf("failed to write version: %w", err)
    }

    // 2. Write input count
    if err := encoding.WriteVarInt(w, uint64(len(tx.Inputs))); err != nil {
        return fmt.Errorf("failed to write input count: %w", err)
    }

    // 3. Write each input
    for i, input := range tx.Inputs {
        if _, err := w.Write(input.PreviousTxHash[:]); err != nil {
            return fmt.Errorf("failed to write input %d prev hash: %w", i, err)
        }
        // ... write other fields
    }

    // 4. Write outputs and locktime
    // ... (see transaction.go for full implementation)

    return nil
}
```

We verified round-trip serialization works correctly:

```go
func TestTransactionSerialization(t *testing.T) {
    originalHex := "0100000001..." // Genesis transaction
    originalData, _ := hex.DecodeString(originalHex)

    // Deserialize
    tx, err := Deserialize(bytes.NewReader(originalData))
    require.NoError(t, err)

    // Serialize
    var buf bytes.Buffer
    err = tx.Serialize(&buf)
    require.NoError(t, err)

    // Compare: should be identical
    assert.Equal(t, originalData, buf.Bytes())
}
```

#### Step 4: Implement Transaction Hashing (TXID)

The Transaction ID (TXID) is computed by double SHA-256 hashing the serialized transaction:

```go
func (tx *Transaction) Hash() []byte {
    var buf bytes.Buffer
    if err := tx.Serialize(&buf); err != nil {
        // In production, this should never happen for a valid transaction
        return make([]byte, 32)
    }

    return crypto.DoubleSHA256(buf.Bytes())
}

func (tx *Transaction) TXID() string {
    hash := tx.Hash()
    reversed := crypto.ReverseBytes(hash)
    return hex.EncodeToString(reversed)
}
```

**Why reverse bytes for TXID?**

Bitcoin internally uses **little-endian** byte order, but block explorers and user-facing tools display hashes in **big-endian** format (reversed) because it's more intuitive for humans to read.

```
Internal Hash (little-endian):
3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a

TXID (big-endian, for display):
4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b
```

### Phase 3: REFACTOR - Improve Code Quality

After tests passed, we added:

1. **Comprehensive Error Testing**: Test every error path in serialization/deserialization
2. **Edge Cases**: Empty transactions, multiple inputs/outputs, coinbase detection
3. **Documentation**: Detailed comments explaining Bitcoin protocol specifics
4. **97.7% Coverage**: Ensured nearly all code paths are tested

```go
func TestSerializeErrors(t *testing.T) {
    tx := &Transaction{ /* ... */ }

    tests := []struct {
        name      string
        failAfter int
    }{
        {"fail_at_version", 0},
        {"fail_at_input_count", 4},
        {"fail_at_input_prev_hash", 5},
        // ... test each serialization step
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            fw := &failWriter{failAfter: tt.failAfter}
            err := tx.Serialize(fw)
            assert.Error(t, err)
        })
    }
}
```

## Genesis Block Coinbase Transaction

Let's dissect the very first Bitcoin transaction ever created:

### Raw Transaction Hex

```
01000000 01 0000000000000000000000000000000000000000000000000000000000000000
ffffffff 4d 04ffff001d0104455468652054696d65732030332f4a616e2f32303039
204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261
696c6f757420666f722062616e6b73 ffffffff 01 00f2052a01000000 43 410467
8afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6
bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac
00000000
```

### Breakdown

**Version (4 bytes):**
```
01000000  →  0x00000001 (little-endian)  →  Version 1
```

**Input Count (VarInt):**
```
01  →  1 input
```

**Input (Coinbase):**

```
Previous TX Hash (32 bytes):
0000000000000000000000000000000000000000000000000000000000000000
↑ All zeros = coinbase transaction

Previous Output Index (4 bytes):
ffffffff  →  0xffffffff  →  4,294,967,295 (max uint32)
↑ Special value for coinbase

Script Length (VarInt):
4d  →  77 bytes

ScriptSig (77 bytes):
04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e
63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f75742
0666f722062616e6b73

Decoded ASCII:
"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"
↑ Satoshi's famous message proving the block was created after this date

Sequence (4 bytes):
ffffffff  →  0xffffffff (final)
```

**Output Count (VarInt):**
```
01  →  1 output
```

**Output:**

```
Value (8 bytes, little-endian):
00f2052a01000000  →  0x000000012a05f200  →  5,000,000,000 satoshis  →  50 BTC

Script Length (VarInt):
43  →  67 bytes

ScriptPubKey (67 bytes):
04678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb6
49f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5f ac

Format: <pubkey> OP_CHECKSIG
↑ Locks 50 BTC to Satoshi's public key
```

**LockTime (4 bytes):**
```
00000000  →  0 (no time lock)
```

### TXID Calculation

1. **Serialize** the transaction to bytes (hex above)
2. **Hash** with DoubleSHA256:
   ```
   Internal: 3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a
   ```
3. **Reverse** bytes for display:
   ```
   TXID: 4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b
   ```

You can verify this TXID on any block explorer:
- https://blockstream.info/tx/4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b

Our test verifies this:
```go
expectedTXID := "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"
gotTXID := tx.TXID()
assert.Equal(t, expectedTXID, gotTXID)  // ✓ PASSES!
```

## Serialization Format

### Why Binary Serialization?

Bitcoin could have used JSON or XML for transactions, but binary serialization offers:

1. **Compactness**: Binary is ~60% smaller than JSON
2. **Deterministic**: Same data always produces same bytes (critical for hashing)
3. **Efficient Parsing**: No need to parse text, convert strings to numbers, etc.
4. **Network Efficiency**: Less bandwidth for P2P propagation

### Size Comparison Example

**JSON Format (hypothetical):**
```json
{
  "version": 1,
  "inputs": [{
    "prevTxHash": "0000000000000000000000000000000000000000000000000000000000000000",
    "prevOutIndex": 4294967295,
    "scriptSig": "04ffff001d0104...",
    "sequence": 4294967295
  }],
  "outputs": [{
    "value": 5000000000,
    "scriptPubKey": "04678afdb0fe5548..."
  }],
  "locktime": 0
}
```
Size: ~350 bytes (with formatting)

**Binary Format:**
```
01000000 01 000000...
```
Size: ~204 bytes

**Savings: ~40% smaller!**

### VarInt Encoding in Transactions

VarInt is used for:
- Input count
- Output count
- Script lengths

**Example from Genesis Transaction:**

```
Input Count:  01           → 1 byte (value: 1)
Script Len:   4d           → 1 byte (value: 77)
Output Count: 01           → 1 byte (value: 1)
Script Len:   43           → 1 byte (value: 67)
```

If we had 1,000 inputs (rare but possible), VarInt encoding:
```
Input Count:  fd e803      → 3 bytes (value: 1000)
              ↑  ↑
              │  └─ 1000 in little-endian uint16
              └─ Prefix indicating 3-byte encoding
```

Fixed 8-byte encoding would use 8 bytes for every count, even for the number "1". VarInt saves significant space across millions of transactions.

## Transaction ID (TXID) Calculation

The TXID uniquely identifies a transaction in the blockchain. It's computed as:

```
TXID = ReverseBytes(DoubleSHA256(SerializedTransaction))
```

### Step-by-Step TXID Computation

#### Step 1: Serialize the Transaction

Convert the transaction structure to binary format:
```go
var buf bytes.Buffer
tx.Serialize(&buf)
serialized := buf.Bytes()
```

#### Step 2: Double SHA-256 Hash

Apply SHA-256 twice:
```go
firstHash := SHA256(serialized)
secondHash := SHA256(firstHash)
// secondHash is now the internal hash (little-endian)
```

**Why double hashing?**
- Defense against length extension attacks on SHA-256
- Additional security layer
- Historical design decision by Satoshi

#### Step 3: Reverse Bytes for Display

Bitcoin's internal representation uses little-endian, but users expect big-endian:

```go
reversed := ReverseBytes(secondHash)
txid := hex.EncodeToString(reversed)
```

### Example: Genesis Transaction

```
Serialized Bytes:
01000000010000000000000000000000000000000000000000000000000000000000000000
ffffffff4d04ffff001d0104455468652054696d65732030332f4a616e2f323030392043
68616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f7574
20666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe5548271967
f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec1
12de5c384df7ba0b8d578a4c702b6bf11d5fac00000000

↓ First SHA-256
8b30c5ba100f6f2e5ad1e2a742e5020491240f8eb514fe97c713c31718ad7ecd

↓ Second SHA-256 (Internal Hash)
3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a

↓ Reverse Bytes (Display Format)
4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b
                                                                    ↑
                                                            This is the TXID
```

### Why Reverse?

**Internal Format (little-endian):**
```
3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a
└─┬─┘
  └─ Least significant bytes first (little-endian)
```

**Display Format (big-endian):**
```
4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b
└─┬─┘
  └─ Most significant bytes first (big-endian, more intuitive for humans)
```

The `TXID()` method handles this automatically:

```go
func (tx *Transaction) TXID() string {
    hash := tx.Hash()           // Internal format (little-endian)
    reversed := crypto.ReverseBytes(hash)  // Display format (big-endian)
    return hex.EncodeToString(reversed)
}
```

## Test Coverage and Quality

We achieved **97.7% test coverage** with comprehensive tests covering:

### 1. Happy Path Tests

✅ **Genesis Block Coinbase Parsing**
```go
func TestGenesisBlockCoinbase(t *testing.T) {
    // Parses the real Genesis Block coinbase transaction
    // Verifies version, inputs, outputs, TXID
}
```

✅ **Round-Trip Serialization**
```go
func TestTransactionSerialization(t *testing.T) {
    // Deserialize → Serialize → Compare
    // Ensures lossless conversion
}
```

✅ **Multiple Inputs/Outputs**
```go
func TestMultipleInputsOutputs(t *testing.T) {
    // Tests realistic transactions with 2 inputs, 3 outputs
    // Verifies all fields deserialize correctly
}
```

### 2. Error Path Tests

✅ **Serialization Errors**
```go
func TestSerializeErrors(t *testing.T) {
    // Tests 12 different failure points:
    // - Version write fails
    // - Input count write fails
    // - Each input field write fails
    // - Output count write fails
    // - Each output field write fails
    // - LockTime write fails
}
```

✅ **Deserialization Errors**
```go
func TestDeserializeIncompleteInput(t *testing.T) {
    // Tests 5 different incomplete input scenarios:
    // - Incomplete prev hash
    // - Incomplete prev index
    // - Incomplete script length
    // - Incomplete script
    // - Incomplete sequence
}

func TestDeserializeIncompleteOutput(t *testing.T) {
    // Tests 4 different incomplete output scenarios:
    // - Incomplete value
    // - Incomplete script length
    // - Incomplete script
    // - Incomplete locktime
}
```

### 3. Edge Cases

✅ **Empty Transaction**
```go
func TestEmptyTransaction(t *testing.T) {
    // Transaction with no inputs and no outputs
    // Should serialize and hash without error
}
```

✅ **Coinbase Detection**
```go
func TestTxInput(t *testing.T) {
    // Tests IsCoinbase() for both coinbase and normal inputs
}
```

### 4. Integration Tests

✅ **Transaction Hashing**
```go
func TestTransactionHash(t *testing.T) {
    // Verifies internal hash (little-endian)
    // Verifies TXID (big-endian, display format)
}
```

### Coverage Report

```
btcnode/pkg/transaction/transaction.go:63:  IsCoinbase   100.0%
btcnode/pkg/transaction/transaction.go:167: Serialize     93.5%
btcnode/pkg/transaction/transaction.go:246: Deserialize   95.8%
btcnode/pkg/transaction/transaction.go:353: Hash         100.0%
btcnode/pkg/transaction/transaction.go:378: TXID         100.0%
────────────────────────────────────────────────────────────────
total:                                                    97.7%
```

**What's not covered?**
- A few unreachable error paths (e.g., Serialize failing on an empty transaction)
- Some defensive error handling that should never trigger in practice

**97.7% coverage ensures:**
- Every major code path is tested
- Error handling works correctly
- Integration with other packages (encoding, crypto) is verified
- Real Bitcoin data validates our implementation

## Key Takeaways

### 1. Transactions Are State Transitions

Bitcoin doesn't have "accounts with balances"—it has a set of unspent outputs (UTXOs). Each transaction consumes some UTXOs (inputs) and creates new UTXOs (outputs). This forms an immutable chain of ownership.

### 2. Binary Encoding Matters

Bitcoin uses compact binary serialization with VarInt encoding to minimize blockchain size. This seemingly small optimization saves gigabytes of storage across millions of transactions.

### 3. Double Hashing for Security

Bitcoin applies SHA-256 twice (DoubleSHA256) to all critical data:
- Transaction IDs
- Block hashes
- Merkle tree nodes

This provides defense-in-depth against potential weaknesses in SHA-256.

### 4. Little-Endian Internally, Big-Endian for Display

Bitcoin's protocol uses little-endian byte order (x86 compatibility), but all user-facing tools reverse hashes to big-endian for intuitive reading.

### 5. TDD Ensures Correctness

By testing against real Bitcoin data (Genesis Block), we guarantee our implementation matches the protocol exactly. No guessing, no assumptions—just verified correctness.

## Next Steps

Now that we have transaction serialization and deserialization working, we can build:

1. **Transaction Verification**: Validate signatures, check input/output balances
2. **UTXO Set Management**: Track unspent outputs
3. **Merkle Trees**: Efficiently commit to transaction sets in blocks
4. **Block Parsing**: Deserialize full Bitcoin blocks
5. **P2P Networking**: Exchange transactions with other nodes

Every component builds on the transaction foundation we've established here.

## References

- [Bitcoin Developer Guide - Transactions](https://developer.bitcoin.org/reference/transactions.html)
- [Bitcoin Wiki - Transaction](https://en.bitcoin.it/wiki/Transaction)
- [Mastering Bitcoin - Chapter 6: Transactions](https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch06.asciidoc)
- [Genesis Block on Blockchain.com](https://www.blockchain.com/btc/block/0)
- [Learn Me a Bitcoin - Transactions](https://learnmeabitcoin.com/technical/transaction)
