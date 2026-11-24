/* ==========================================================================
   SIKKA ($SIKA) — Institutional Web3, BigInt Converter & UI Controller
   Zero dependencies · Vanilla ES6+ · GitHub Pages Compatible
   ========================================================================== */

(function () {
  'use strict';

  const SIKKA_CONFIG = Object.freeze({
    name: 'Sikka',
    symbol: 'SIKA',
    decimals: 8,
    decimalsBig: 8n,
    sikiPerSika: 100_000_000n,
    sikiPerSikk: 1_000_000n,
    maxSupplySiki: 4_000_000_000_000_000n,
    contractAddress: '0x4Ee5467857407FF4741271Bbba3F15C1e981eb0A',
    creationTx: '0x222296c09fa4d60cb444f2d4e37564292695f1658cc75c2234153bc25819d2eb',
    deployerAddress: '0x29AE486F4e94ACCD2DA11F8d4E7c2e1b5f031236',
    compilerVersion: 'v0.8.34+commit.80d5c536',
    deploymentBlock: '12197105',
    sepoliaChainIdHex: '0xaa36a7',
    sepoliaChainIdDec: 11155111,
    sepoliaRpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    blockscoutUrl: 'https://eth-sepolia.blockscout.com/address/0x4Ee5467857407FF4741271Bbba3F15C1e981eb0A',
    etherscanUrl: 'https://sepolia.etherscan.io/address/0x4ee5467857407ff4741271bbba3f15c1e981eb0a',
    emblemPath: './assets/1000278374.jpg',
    soliditySource: [
      '// SPDX-License-Identifier: MIT',
      'pragma solidity ^0.8.20;',
      '',
      'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";',
      'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";',
      '',
      'contract Sikka is ERC20, ERC20Burnable {',
      '    uint256 public constant MAX_SUPPLY = 40_000_000 * 10 ** 8;',
      '',
      '    constructor() ERC20("Sikka", "SIKA") {',
      '        _mint(msg.sender, MAX_SUPPLY);',
      '    }',
      '',
      '    function decimals() public pure override returns (uint8) {',
      '        return 8;',
      '    }',
      '}',
    ].join('\n'),
  });

  const state = {
    account: null,
    chainIdHex: null,
    lastFocusedElement: null,
  };

  /* ------------------------------------------------------------------------
     Utility: Toast & Clipboard (Preserving SVG Icon Elements)
     ------------------------------------------------------------------------ */
  function showToast(message, variant) {
    const region = document.getElementById('toast-region');
    if (!region) return;
    const toast = document.createElement('div');
    toast.className = 'toast' + (variant ? ' toast--' + variant : '');
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(function () {
      toast.remove();
    }, 3400);
  }

  async function copyText(text, triggerButton) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      if (triggerButton) {
        triggerButton.classList.add('is-copied');
        const labelEl = triggerButton.querySelector('[data-copy-label]');
        if (labelEl) {
          const original = labelEl.getAttribute('data-original-label') || labelEl.textContent;
          labelEl.setAttribute('data-original-label', original);
          labelEl.textContent = 'Copied';
          window.setTimeout(function () {
            labelEl.textContent = original;
          }, 1600);
        }
        window.setTimeout(function () {
          triggerButton.classList.remove('is-copied');
        }, 1600);
      }
      showToast('Copied to clipboard.', 'success');
    } catch (err) {
      showToast('Unable to copy automatically. Please copy manually.', 'error');
    }
  }

  function initClipboardButtons() {
    document.addEventListener('click', function (event) {
      const btn = event.target.closest('[data-copy], [data-copy-source]');
      if (!btn) return;
      if (btn.hasAttribute('data-copy-source')) {
        copyText(SIKKA_CONFIG.soliditySource, btn);
        return;
      }
      const value = btn.getAttribute('data-copy');
      if (value) copyText(value, btn);
    });
  }

  /* ------------------------------------------------------------------------
     BigInt Exact Unit Converter (Siki <-> Sikk <-> Sikka)
     ------------------------------------------------------------------------ */
  function addThousandSeparators(intStr) {
    return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function formatBigIntDecimal(value, decimals, trimTrailing) {
    const scale = 10n ** BigInt(decimals);
    const whole = value / scale;
    const frac = value % scale;
    const wholeStr = addThousandSeparators(whole.toString());
    if (decimals === 0) return wholeStr;
    let fracStr = frac.toString().padStart(decimals, '0');
    if (trimTrailing) {
      fracStr = fracStr.replace(/0+$/, '');
      return fracStr.length ? wholeStr + '.' + fracStr : wholeStr;
    }
    return wholeStr + '.' + fracStr;
  }

  function formatEditableDecimal(value, decimals) {
    if (decimals === 0) return value.toString();
    const scale = 10n ** BigInt(decimals);
    const whole = value / scale;
    const frac = value % scale;
    const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
    return fracStr.length ? whole.toString() + '.' + fracStr : whole.toString();
  }

  function parseDecimalToSiki(raw, unitDecimals) {
    const cleaned = raw.trim().replace(/[,\s_]/g, '');
    if (cleaned === '') {
      return { ok: true, value: 0n, empty: true };
    }
    if (!/^\d*(\.\d*)?$/.test(cleaned) || cleaned === '.') {
      return { ok: false, error: 'Enter a valid non-negative numeric value.' };
    }
    const parts = cleaned.split('.');
    const intPart = parts[0] || '0';
    const fracPart = parts[1] || '';
    if (unitDecimals === 0 && fracPart.length > 0) {
      return { ok: false, error: '1 Siki is indivisible and cannot contain decimal fractions.' };
    }
    if (fracPart.length > unitDecimals) {
      return {
        ok: false,
        error: 'Precision limit exceeded: maximum ' + unitDecimals + ' decimal places for this unit.',
      };
    }
    const paddedFrac = fracPart.padEnd(unitDecimals, '0');
    const combined = (intPart + paddedFrac).replace(/^0+(?=\d)/, '') || '0';
    return { ok: true, value: BigInt(combined), empty: false };
  }

  function formatSupplyShare(sikiAmount) {
    if (sikiAmount <= 0n) return '0.0000%';
    const scaled = (sikiAmount * 1_000_000n) / SIKKA_CONFIG.maxSupplySiki;
    if (scaled === 0n) return '< 0.0001%';
    const wholePct = scaled / 10_000n;
    const fracPct = (scaled % 10_000n).toString().padStart(4, '0');
    return wholePct.toString() + '.' + fracPct + '%';
  }

  function computeGaugePercent(sikiAmount) {
    if (sikiAmount <= 0n) return 0;
    const pctBasis = Number((sikiAmount * 10_000n) / SIKKA_CONFIG.maxSupplySiki) / 100;
    if (sikiAmount > 0n && pctBasis < 0.8) return 0.8;
    return Math.min(100, pctBasis);
  }

  function initUnitConverter() {
    const sikkaInput = document.querySelector('[data-unit-input="sikka"]');
    const sikkInput = document.querySelector('[data-unit-input="sikk"]');
    const sikiInput = document.querySelector('[data-unit-input="siki"]');
    if (!sikkaInput || !sikkInput || !sikiInput) return;

    const exactReadout = document.getElementById('converter-exact-readout');
    const shareReadout = document.getElementById('converter-share-readout');
    const feedbackEl = document.getElementById('converter-feedback');
    const gaugeBarEl = document.getElementById('converter-cap-bar');

    const unitConfig = {
      sikka: { el: sikkaInput, decimals: 8 },
      sikk: { el: sikkInput, decimals: 6 },
      siki: { el: sikiInput, decimals: 0 },
    };

    function setFeedback(message) {
      if (!feedbackEl) return;
      if (message) {
        feedbackEl.textContent = message;
        feedbackEl.hidden = false;
      } else {
        feedbackEl.textContent = '';
        feedbackEl.hidden = true;
      }
    }

    function updateFromSiki(sikiAmount, sourceKey) {
      if (sourceKey !== 'sikka') {
        sikkaInput.value = formatEditableDecimal(sikiAmount, 8);
      }
      if (sourceKey !== 'sikk') {
        sikkInput.value = formatEditableDecimal(sikiAmount, 6);
      }
      if (sourceKey !== 'siki') {
        sikiInput.value = sikiAmount.toString();
      }

      if (exactReadout) {
        exactReadout.textContent =
          formatBigIntDecimal(sikiAmount, 8, false) +
          ' SIKA (' +
          addThousandSeparators(sikiAmount.toString()) +
          ' Siki)';
      }
      if (shareReadout) {
        shareReadout.textContent = formatSupplyShare(sikiAmount) + ' of 40M Cap';
      }
      if (gaugeBarEl) {
        gaugeBarEl.style.width = computeGaugePercent(sikiAmount) + '%';
        gaugeBarEl.classList.toggle('is-overcap', sikiAmount > SIKKA_CONFIG.maxSupplySiki);
      }

      if (sikiAmount > SIKKA_CONFIG.maxSupplySiki) {
        setFeedback(
          'Note: Entered value exceeds the immutable 40,000,000 SIKA (4,000,000,000,000,000 Siki) hard cap.'
        );
      } else {
        setFeedback('');
      }
    }

    Object.keys(unitConfig).forEach(function (key) {
      const cfg = unitConfig[key];
      cfg.el.addEventListener('input', function () {
        const parsed = parseDecimalToSiki(cfg.el.value, cfg.decimals);
        if (!parsed.ok) {
          setFeedback(parsed.error);
          return;
        }
        updateFromSiki(parsed.value, key);
      });
    });

    document.querySelectorAll('[data-unit-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const presetSiki = BigInt(btn.getAttribute('data-unit-preset') || '0');
        updateFromSiki(presetSiki, null);
      });
    });

    updateFromSiki(SIKKA_CONFIG.sikiPerSika, null);
  }

  /* ------------------------------------------------------------------------
     Interactive Tokenomics SVG Ring <-> Ledger Row Sync
     ------------------------------------------------------------------------ */
  function initTokenomicsHover() {
    const svg = document.getElementById('tokenomics-svg');
    const items = document.querySelectorAll('[data-alloc-index]');
    if (!svg || !items.length) return;

    function setActive(index) {
      const hasAny = index !== null;
      svg.classList.toggle('has-hover', hasAny);
      items.forEach(function (el) {
        const match = hasAny && el.getAttribute('data-alloc-index') === index;
        el.classList.toggle('is-active', match);
      });
    }

    items.forEach(function (el) {
      const idx = el.getAttribute('data-alloc-index');
      el.addEventListener('mouseenter', function () {
        setActive(idx);
      });
      el.addEventListener('mouseleave', function () {
        setActive(null);
      });
      el.addEventListener('focus', function () {
        setActive(idx);
      });
      el.addEventListener('blur', function () {
        setActive(null);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Smart Contract Syntax Highlighter & Modal Viewer
     ------------------------------------------------------------------------ */
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlightSolidityLine(line) {
    const tokenRegex =
      /(\/\/.*$|"(?:[^"\\]|\\.)*"|\b(?:pragma|solidity|import|contract|is|public|constant|constructor|function|pure|override|returns|return|uint256|uint8|ERC20|ERC20Burnable)\b|\b\d[\d_]*\b)/g;

    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        result += escapeHtml(line.slice(lastIndex, match.index));
      }
      const token = match[0];
      let cls = '';
      if (token.startsWith('//')) {
        cls = 'tok-cmt';
      } else if (token.startsWith('"')) {
        cls = 'tok-str';
      } else if (/^\d/.test(token)) {
        cls = 'tok-num';
      } else if (/^(uint256|uint8|ERC20|ERC20Burnable)$/.test(token)) {
        cls = 'tok-type';
      } else {
        cls = 'tok-kw';
      }
      result += '<span class="' + cls + '">' + escapeHtml(token) + '</span>';
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      result += escapeHtml(line.slice(lastIndex));
    }
    return result || '&nbsp;';
  }

  function renderCodeIntoElement(container) {
    if (!container) return;
    const lines = SIKKA_CONFIG.soliditySource.split('\n');
    const html = lines
      .map(function (line, index) {
        return (
          '<div class="code-line">' +
          '<span class="code-ln">' + (index + 1) + '</span>' +
          '<span class="code-src">' + highlightSolidityLine(line) + '</span>' +
          '</div>'
        );
      })
      .join('');
    container.innerHTML = html;
  }

  function initContractCodeViewer() {
    const inlineCodeEl = document.getElementById('inline-contract-code');
    if (inlineCodeEl) {
      renderCodeIntoElement(inlineCodeEl);
    }

    const modal = document.getElementById('contract-modal');
    const modalCodeEl = document.getElementById('modal-contract-code');
    if (!modal || !modalCodeEl) return;

    renderCodeIntoElement(modalCodeEl);

    function openModal(trigger) {
      state.lastFocusedElement = trigger || document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      const closeBtn = modal.querySelector('[data-close-modal]');
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = '';
      if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
        state.lastFocusedElement.focus();
      }
    }

    document.querySelectorAll('[data-open-contract-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openModal(btn);
      });
    });

    modal.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) {
        closeModal();
      }
    });
  }

  /* ------------------------------------------------------------------------
     MetaMask / EIP-1193 Web3 Integration & Sepolia Verification
     ------------------------------------------------------------------------ */
  function truncateAddress(address) {
    if (!address || address.length < 10) return address || '';
    return address.slice(0, 6) + '...' + address.slice(-4);
  }

  function getNetworkLabel(chainIdHex) {
    if (!chainIdHex) return 'Not Connected';
    const normalized = chainIdHex.toLowerCase();
    if (normalized === SIKKA_CONFIG.sepoliaChainIdHex) return 'Ethereum Sepolia (11155111)';
    if (normalized === '0x1') return 'Ethereum Mainnet (1)';
    if (normalized === '0x38') return 'BNB Smart Chain (56)';
    return 'Chain ' + parseInt(normalized, 16);
  }

  function encodeBalanceOfCall(address) {
    const clean = address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
    return '0x70a08231' + clean;
  }

  async function rpcCall(provider, method, params) {
    if (provider) {
      return provider.request({ method: method, params: params });
    }
    const response = await fetch(SIKKA_CONFIG.sepoliaRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: method, params: params }),
    });
    const json = await response.json();
    if (json.error) throw new Error(json.error.message || 'RPC Error');
    return json.result;
  }

  async function refreshWalletUI() {
    const walletLabelEls = document.querySelectorAll('[data-wallet-pill]');
    const connectButtons = document.querySelectorAll('[data-connect-wallet]');
    const networkStatusEl = document.getElementById('web3-network-status');
    const accountStatusEl = document.getElementById('web3-account-status');
    const balanceStatusEl = document.getElementById('web3-balance-status');

    if (state.account) {
      walletLabelEls.forEach(function (el) {
        el.textContent = truncateAddress(state.account);
        el.hidden = false;
      });
      connectButtons.forEach(function (btn) {
        btn.textContent = truncateAddress(state.account);
      });
      if (accountStatusEl) accountStatusEl.textContent = truncateAddress(state.account);
    } else {
      walletLabelEls.forEach(function (el) {
        el.hidden = true;
      });
      connectButtons.forEach(function (btn) {
        btn.textContent = 'Connect Wallet';
      });
      if (accountStatusEl) accountStatusEl.textContent = 'Not connected';
    }

    if (networkStatusEl) {
      networkStatusEl.textContent = getNetworkLabel(state.chainIdHex);
    }

    if (balanceStatusEl) {
      if (
        state.account &&
        state.chainIdHex &&
        state.chainIdHex.toLowerCase() === SIKKA_CONFIG.sepoliaChainIdHex &&
        window.ethereum
      ) {
        try {
          const hexBal = await rpcCall(window.ethereum, 'eth_call', [
            { to: SIKKA_CONFIG.contractAddress, data: encodeBalanceOfCall(state.account) },
            'latest',
          ]);
          const balSiki = BigInt(hexBal || '0x0');
          balanceStatusEl.textContent = formatBigIntDecimal(balSiki, 8, false) + ' SIKA';
        } catch (err) {
          balanceStatusEl.textContent = 'Read error';
        }
      } else if (state.account) {
        balanceStatusEl.textContent = 'Switch to Sepolia';
      } else {
        balanceStatusEl.textContent = '—';
      }
    }
  }

  async function ensureSepoliaNetwork() {
    if (!window.ethereum) {
      showToast('MetaMask or an EIP-1193 wallet extension is required.', 'error');
      return false;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SIKKA_CONFIG.sepoliaChainIdHex }],
      });
      state.chainIdHex = SIKKA_CONFIG.sepoliaChainIdHex;
      await refreshWalletUI();
      showToast('Switched to Ethereum Sepolia Testnet.', 'success');
      return true;
    } catch (switchError) {
      if (switchError && switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SIKKA_CONFIG.sepoliaChainIdHex,
                chainName: 'Ethereum Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: [SIKKA_CONFIG.sepoliaRpcUrl],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          state.chainIdHex = SIKKA_CONFIG.sepoliaChainIdHex;
          await refreshWalletUI();
          showToast('Sepolia network added and selected.', 'success');
          return true;
        } catch (addErr) {
          showToast('Adding Sepolia network was cancelled.', 'error');
          return false;
        }
      }
      showToast(switchError.message || 'Could not switch to Sepolia network.', 'error');
      return false;
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      showToast('No Web3 wallet detected. Install MetaMask to interact with Sepolia.', 'error');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      state.account = accounts && accounts[0] ? accounts[0] : null;
      state.chainIdHex = chainId || null;
      await refreshWalletUI();
      showToast('Wallet connected: ' + truncateAddress(state.account), 'success');
    } catch (err) {
      showToast(err.message || 'Wallet connection declined.', 'error');
    }
  }

  async function addSikaToMetaMask() {
    if (!window.ethereum) {
      showToast('MetaMask is not detected in this browser.', 'error');
      return;
    }
    try {
      const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
      if (!currentChain || currentChain.toLowerCase() !== SIKKA_CONFIG.sepoliaChainIdHex) {
        const switched = await ensureSepoliaNetwork();
        if (!switched) return;
      }

      const imageUrl = new URL(SIKKA_CONFIG.emblemPath, window.location.href).href;
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: SIKKA_CONFIG.contractAddress,
            symbol: SIKKA_CONFIG.symbol,
            decimals: SIKKA_CONFIG.decimals,
            image: imageUrl,
          },
        },
      });

      if (wasAdded) {
        showToast('$SIKA (Sepolia) added to MetaMask.', 'success');
      } else {
        showToast('Token addition dismissed in wallet.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add $SIKA token.', 'error');
    }
  }

  async function verifyLiveOnChainSupply(button) {
    const supplyOutEl = document.getElementById('live-supply-readout');
    if (button) button.disabled = true;
    try {
      const useInjected =
        window.ethereum &&
        state.chainIdHex &&
        state.chainIdHex.toLowerCase() === SIKKA_CONFIG.sepoliaChainIdHex;
      const resultHex = await rpcCall(useInjected ? window.ethereum : null, 'eth_call', [
        { to: SIKKA_CONFIG.contractAddress, data: '0x18160ddd' },
        'latest',
      ]);
      const supplySiki = BigInt(resultHex || '0x0');
      const formatted = formatBigIntDecimal(supplySiki, 8, false) + ' SIKA';
      if (supplyOutEl) {
        supplyOutEl.textContent = formatted + ' (Verified Live)';
      }
      showToast('Live Sepolia totalSupply() verified: ' + formatted, 'success');
    } catch (err) {
      if (supplyOutEl) {
        supplyOutEl.textContent = '40,000,000.00000000 SIKA (Block 12197105)';
      }
      showToast('Public RPC unreachable in this context; showing verified baseline.', 'error');
    } finally {
      if (button) button.disabled = false;
    }
  }

  function initWeb3() {
    document.querySelectorAll('[data-connect-wallet]').forEach(function (btn) {
      btn.addEventListener('click', connectWallet);
    });
    document.querySelectorAll('[data-switch-sepolia]').forEach(function (btn) {
      btn.addEventListener('click', ensureSepoliaNetwork);
    });
    document.querySelectorAll('[data-add-sika]').forEach(function (btn) {
      btn.addEventListener('click', addSikaToMetaMask);
    });
    document.querySelectorAll('[data-verify-supply]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        verifyLiveOnChainSupply(btn);
      });
    });

    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then(function (accounts) {
          if (accounts && accounts.length > 0) {
            state.account = accounts[0];
            return window.ethereum.request({ method: 'eth_chainId' });
          }
          return null;
        })
        .then(function (chainId) {
          if (chainId) state.chainIdHex = chainId;
          refreshWalletUI();
        })
        .catch(function () {
          refreshWalletUI();
        });

      if (typeof window.ethereum.on === 'function') {
        window.ethereum.on('accountsChanged', function (accounts) {
          state.account = accounts && accounts[0] ? accounts[0] : null;
          refreshWalletUI();
        });
        window.ethereum.on('chainChanged', function (chainId) {
          state.chainIdHex = chainId;
          refreshWalletUI();
        });
      }
    } else {
      refreshWalletUI();
    }
  }

  /* ------------------------------------------------------------------------
     Sticky Header State, Mobile Nav, Print Action & Whitepaper Scrollspy
     ------------------------------------------------------------------------ */
  function initNavigation() {
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    const toggle = document.getElementById('nav-toggle');
    const drawer = document.getElementById('mobile-nav');
    if (toggle && drawer) {
      function setDrawerOpen(open) {
        drawer.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      }

      toggle.addEventListener('click', function () {
        const isOpen = drawer.classList.contains('is-open');
        setDrawerOpen(!isOpen);
      });

      drawer.querySelectorAll('a, button').forEach(function (el) {
        el.addEventListener('click', function () {
          setDrawerOpen(false);
        });
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
          setDrawerOpen(false);
          toggle.focus();
        }
      });
    }

    document.querySelectorAll('[data-print-whitepaper]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.print();
      });
    });

    const tocLinks = Array.from(document.querySelectorAll('.wp-toc-link'));
    const sections = Array.from(document.querySelectorAll('.wp-article section[id]'));
    if (tocLinks.length && sections.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id');
              tocLinks.forEach(function (link) {
                link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
              });
            }
          });
        },
        { rootMargin: '-18% 0px -70% 0px' }
      );
      sections.forEach(function (section) {
        observer.observe(section);
      });
    }
  }

  /* ------------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initClipboardButtons();
    initUnitConverter();
    initTokenomicsHover();
    initContractCodeViewer();
    initWeb3();
    initNavigation();
  });
})();
