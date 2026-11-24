<div align="center">
  <img src="./assets/1000278374.jpg" alt="Sikka ($SIKA) Hexagonal Emblem" width="84" />
  <br />
  <img src="./assets/1000278467.png" alt="SIKKA Wordmark" width="260" />

  <h1>SIKKA ($SIKA)</h1>
  <p><strong>A Scarce, Transparent, Peer-to-Peer Sound-Money Digital Currency</strong></p>

  <p>
    <a href="https://eth-sepolia.blockscout.com/address/0x4Ee5467857407FF4741271Bbba3F15C1e981eb0A">Verified on Sepolia Blockscout</a> ·
    <a href="https://sepolia.etherscan.io/address/0x4ee5467857407ff4741271bbba3f15c1e981eb0a">Sepolia Etherscan</a> ·
    <a href="./contracts/Sikka.sol">Smart Contract Source</a> ·
    <a href="./whitepaper.html">Whitepaper v1.0</a>
  </p>
</div>

---

## Overview

**Sikka (`$SIKA`)** is a fixed-supply, peer-to-peer digital currency engineered around verifiable monetary scarcity, deterministic divisibility, and clean, unencumbered ERC-20 / BEP-20 smart-contract minimalism.

Unlike inflationary or tax-encumbered tokens, `Sikka.sol` implements strictly standard OpenZeppelin `ERC20` and `ERC20Burnable` primitives with **zero transfer taxes, zero minting privileges, zero pause hooks, and zero blacklisting backdoors**. The entire genesis supply of **40,000,000 SIKA** (`4,000,000,000,000,000 Siki`) is fixed once at deployment.

- **Current Live Environment:** Public Ethereum Sepolia Testnet (Live & Verified)
- **Upcoming Primary Mainnet:** BNB Smart Chain (BEP-20) *(Planned)*

---

## Verified Public Testnet Proof

All contract metadata below is verified on-chain against the deployed Ethereum Sepolia instance:

| Parameter | Verified Value |
| :--- | :--- |
| **Network** | Ethereum Sepolia Testnet |
| **Chain ID** | `11155111` (`0xaa36a7`) |
| **Contract Name** | `Sikka` |
| **Token Symbol** | `SIKA` |
| **Verified Contract Address** | `0x4Ee5467857407FF4741271Bbba3F15C1e981eb0A` (`0x4ee5467857407ff4741271bbba3f15c1e981eb0a`) |
| **Deployment Block** | `12197105` |
| **Creation Transaction** | [`0x222296c09fa4d60cb444f2d4e37564292695f1658cc75c2234153bc25819d2eb`](https://eth-sepolia.blockscout.com/tx/0x222296c09fa4d60cb444f2d4e37564292695f1658cc75c2234153bc25819d2eb) |
| **Deployer Address** | `0x29AE486F4e94ACCD2DA11F8d4E7c2e1b5f031236` |
| **Compiler Version** | `v0.8.34+commit.80d5c536` |
| **EVM Version** | `default` |
| **Optimization** | Disabled (`optimization_enabled: false`) |
| **OpenZeppelin Base** | `ERC20` + `ERC20Burnable` (v5.5.0) |
| **Hard Cap / Max Supply** | `40,000,000 SIKA` (`4,000,000,000,000,000 Siki`) |
| **Decimals** | `8` |
| **Transfer / Buy / Sell Tax** | `0%` (None in contract) |
| **Admin / Owner Privileges** | None (No `Ownable`, no `mint()`, no `pause()`, no blacklist) |
| **License** | MIT (`SPDX-License-Identifier: MIT`) |
| **Verification Timestamp** | `2026-11-23T17:24:07Z` (Full Verification on Blockscout) |

---

## Monetary Architecture & Unit System

Sikka uses **8 decimal places** (`10^8` indivisible base units per SIKA), balancing global scarcity with everyday retail precision through a three-tier denomination hierarchy:

| Denomination | SIKA Equivalent | Base Units (`Siki`) | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **1 Sikka (`SIKA`)** | `1.00000000` | `100,000,000 Siki` | Treasury accounting, savings & institutional settlement |
| **1 Sikk** | `0.01000000` | `1,000,000 Siki` | Everyday retail pricing & peer-to-peer payments (`100 Sikk = 1 Sikka`) |
| **1 Siki** | `0.00000001` | `1 Siki` | Smallest indivisible unit for micro-transactions |

---

## Tokenomics

### Verified Supply Mechanics
- **Maximum Supply:** `40,000,000 SIKA` (`4,000,000,000,000,000 Siki`)
- **Inflation Rate:** `0%` permanent (no `mint()` function exists after constructor execution)
- **Deflation Mechanism:** Voluntary holder-initiated burning via `ERC20Burnable` (`burn` and `burnFrom`), permanently reducing `totalSupply`
- **Current Sepolia State:** Testnet deployment minted 100% of test supply to the deployer address (`1` holder on-chain) for public contract verification and wallet integration testing.

### Mainnet Allocation Framework *(Editable Draft Template)*

> **Note:** The breakdown below is an **editable draft template** prepared for the upcoming BNB Smart Chain (BEP-20) mainnet launch. Update these percentages, vesting schedules, and multisig custody addresses in `README.md`, `index.html`, and `whitepaper.html` prior to mainnet genesis.

| Allocation Bucket | Share | Amount (`SIKA`) | Target Purpose & Vesting *(Editable)* |
| :--- | :--- | :--- | :--- |
| **Public Liquidity & Circulation** | `50%` | `20,000,000 SIKA` | Open-market liquidity provisioning and P2P distribution |
| **Ecosystem & Merchant Adoption** | `20%` | `8,000,000 SIKA` | Payment integrations, merchant tooling, and developer grants |
| **Protocol Treasury Reserve** | `15%` | `6,000,000 SIKA` | Multi-sig reserve locked with transparent on-chain disclosure |
| **Core Engineering & Audits** | `10%` | `4,000,000 SIKA` | Infrastructure maintenance and third-party security audits |
| **Early Contributors** | `5%` | `2,000,000 SIKA` | Time-locked contributor allocation |
| **Total Hard Cap** | **`100%`** | **`40,000,000 SIKA`** | **Immutable at Genesis** |

---

## Roadmap *(Editable Milestones)*

- **Phase 1 — Protocol Specification & Sepolia Verification (`Completed`)**
  - Finalize minimal immutable `Sikka.sol` contract (`ERC20` + `ERC20Burnable`, `8` decimals, `40M` cap).
  - Deploy and publicly verify source code on Ethereum Sepolia at block `12197105`.
  - Release open-source website, interactive `Siki / Sikk / Sikka` converter, MetaMask integration, and Whitepaper v1.0.
- **Phase 2 — Independent Review & Mainnet Preparation (`In Progress — Editable`)**
  - Conduct formal pre-mainnet code review and invariant verification.
  - Finalize BNB Smart Chain (BEP-20) genesis allocation table and multisig custody structure.
  - Run public Sepolia wallet & MetaMask `wallet_watchAsset` compatibility testing.
- **Phase 3 — Primary Mainnet Launch on BNB Smart Chain (`Upcoming — Target Q1 2027, Editable`)**
  - Deploy identical `Sikka.sol` contract onto BNB Smart Chain (BEP-20) and verify source on BscScan.
  - Publish mainnet contract address, initial liquidity locks, and treasury wallet addresses.
- **Phase 4 — Payment & Merchant Tooling (`Planned — Target Q2+ 2027, Editable`)**
  - Release open-source retail checkout snippets denominated in `Sikk` and `SIKA`.
  - Submit token metadata and verified iconography to major wallets and block explorers.

---

## Repository Structure

```text
.
├── assets/
│   ├── 1000278374.jpg        # Gold hexagonal 'S' emblem (1024x1024)
│   └── 1000278467.png        # White/gold SIKKA wordmark (1006x221)
├── contracts/
│   └── Sikka.sol             # Verified ERC-20 + ERC20Burnable Solidity source
├── css/
│   └── styles.css            # Design system, layout, responsive UI & @media print PDF styles
├── js/
│   └── app.js                # MetaMask Web3, BigInt unit converter, clipboard, modal & nav
├── .nojekyll                 # Ensures GitHub Pages serves static files cleanly without Jekyll
├── index.html                # Official institutional landing page
├── LICENSE                   # MIT License
├── README.md                 # Project & repository documentation
└── whitepaper.html           # Standalone Whitepaper v1.0 with print-to-PDF support
```

---

## GitHub Pages Deployment Guide

This repository uses **zero build steps** (pure HTML5, CSS3, and Vanilla ES6+ JavaScript) with **strictly relative paths** (`./css/styles.css`, `./js/app.js`, `./assets/...`, `./whitepaper.html`).

### Deploy on GitHub Pages
1. Push this repository to GitHub (e.g., `https://github.com/<your-username>/sikka`).
2. Open **Settings → Pages** in your GitHub repository.
3. Under **Build and deployment**, set:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` / `/ (root)`
4. Click **Save**. Because `.nojekyll` is present and all links are relative, your site will work immediately at both:
   - `https://<your-username>.github.io/<repo-name>/`
   - Any custom domain configured in GitHub Pages.

### Local Preview
Serve the directory with any static HTTP server (needed for `fetch` or MetaMask injection):

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080/`.

### Pre-Publish Customization Checklist
Before announcing publicly, review and replace the placeholder items in `index.html`, `whitepaper.html`, `README.md`, and `LICENSE`:
- [ ] Replace `https://github.com/your-org/sikka` and contact email `contact@sikka-protocol.example` with your official links.
- [ ] Update the **Draft Mainnet Allocation** percentages/vesting terms if finalizing a different distribution before BNB Smart Chain launch.
- [ ] Update **Roadmap** target quarters if desired.
- [ ] Update the copyright holder name in `LICENSE` if publishing under a specific legal entity or individual name.
