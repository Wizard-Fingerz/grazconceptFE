
import api from './api';

// Get all wallet packages
export async function getAllWallets(params?: Record<string, any
  // Get all wallet packages
  >) {
  try {
    const response = await api.get(`/app/wallet-offer`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get recent wallet bookings for the current user (limit 5)
export async function getMyRecentWalletTransactions() {
  try {
    const response = await api.get(`/wallet/wallet-transactions/my-recent/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get wallet ad banners (limit 3)
export async function getWalletBanners() {
  try {
    const response = await api.get(`/app/wallet-ad-banner/?limit=3`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getMyWalletbalance() {
  try {
    const response = await api.get(`/wallet/wallets/my-balance/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}