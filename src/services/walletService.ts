import api from './api';

// ── Existing endpoints ────────────────────────────────────────────────────────

export async function getAllWallets(params?: Record<string, any>) {
  const response = await api.get('/app/wallet-offer', { params });
  return response.data;
}

export async function getMyRecentWalletTransactions(params?: Record<string, any>) {
  const response = await api.get('/wallet/wallet-transactions/my-recent/', { params });
  return response.data;
}

export async function getWalletBanners() {
  const response = await api.get('/app/wallet-ad-banner/?limit=3');
  return response.data;
}

export async function getMyWalletbalance() {
  const response = await api.get('/wallet/wallets/my-balance/');
  return response.data;
}

// ── Flutterwave ──────────────────────────────────────────────────────────────

export interface InitiatePaymentPayload {
  amount: number;
  currency?: string;
  transaction_type?: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'savings_funding';
  description?: string;
  savings_plan_id?: number | null;
}

export interface InitiatePaymentResponse {
  reference: string;
  public_key: string;
  amount: number;
  currency: string;
  email: string;
  name: string;
  phone: string;
  transaction_type: string;
  description: string;
}

/** Step 1 — ask backend to create a pending transaction and get a reference. */
export async function flwInitiatePayment(payload: InitiatePaymentPayload): Promise<InitiatePaymentResponse> {
  const response = await api.post('/wallet/flutterwave/initiate/', payload);
  return response.data;
}

export interface VerifyPaymentPayload {
  transaction_id: number | string;
  reference: string;
}

export interface VerifyPaymentResponse {
  detail: string;
  status: 'successful' | 'failed' | string;
  reference: string;
  amount: number;
  currency: string;
  new_balance: number;
}

/** Step 2 — after Flutterwave inline checkout succeeds, verify with our backend. */
export async function flwVerifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
  const response = await api.post('/wallet/flutterwave/verify/', payload);
  return response.data;
}

export interface WithdrawPayload {
  amount: number;
  account_bank: string;    // bank code, e.g. "044"
  account_number: string;
  beneficiary_name?: string;
  narration?: string;
  currency?: string;
  pin?: string;            // required by backend PIN gate
}

export interface WithdrawResponse {
  detail: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
}

/** Initiate bank transfer withdrawal via Flutterwave. */
export async function flwWithdraw(payload: WithdrawPayload): Promise<WithdrawResponse> {
  const response = await api.post('/wallet/flutterwave/withdraw/', payload);
  return response.data;
}

export interface BankOption {
  id: number;
  code: string;
  name: string;
}

/** Fetch list of banks (for withdrawal form). */
export async function flwGetBanks(country = 'NG'): Promise<BankOption[]> {
  const response = await api.get('/wallet/flutterwave/banks/', { params: { country } });
  return response.data.banks ?? [];
}

export interface ResolveAccountPayload {
  account_number: string;
  account_bank: string;   // bank code e.g. "044"
}

export interface ResolveAccountResponse {
  account_name: string;
  account_number: string;
}

/** Resolve a 10-digit NUBAN account number to the holder's name. */
export async function flwResolveAccount(payload: ResolveAccountPayload): Promise<ResolveAccountResponse> {
  const response = await api.post('/wallet/flutterwave/resolve-account/', payload);
  return response.data;
}

// ── Wallet PIN ────────────────────────────────────────────────────────────────

/** Returns whether the authenticated user has a wallet PIN set. */
export async function walletPinStatus(): Promise<{ has_pin: boolean }> {
  const response = await api.get('/wallet/pin/status/');
  return response.data;
}

export interface SetPinPayload {
  pin: string;
  confirm_pin: string;
  current_pin?: string;  // required only when changing an existing PIN
}

/** Create or change the 4-digit wallet PIN. */
export async function walletSetPin(payload: SetPinPayload): Promise<{ detail: string }> {
  const response = await api.post('/wallet/pin/setup/', payload);
  return response.data;
}

/** Verify the PIN (used by bill pages before deducting from wallet). */
export async function walletVerifyPin(pin: string): Promise<{ detail: string }> {
  const response = await api.post('/wallet/pin/verify/', { pin });
  return response.data;
}

// ── Inline checkout loader (shared across wallet + bill pages) ────────────────
/**
 * Opens the Flutterwave inline checkout modal.
 * Lazy-loads v3.js the first time; subsequent calls re-use the cached script.
 */
export function openFlwCheckout(config: Record<string, any>): void {
  const win = window as any;
  const fire = () => win.FlutterwaveCheckout(config);
  if (typeof win.FlutterwaveCheckout === 'function') { fire(); return; }
  let script = document.getElementById('flw-script') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id  = 'flw-script';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    document.head.appendChild(script);
  }
  script.addEventListener('load', fire, { once: true });
}
