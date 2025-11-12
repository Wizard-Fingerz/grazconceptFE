
import api from './api';

export async function getEuropeanCitizenshipPrograms() {
  try {
    const response = await api.get(`/app/european-citizenship-offer`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getEuropeanCitizenshipProgramsById(id: string | number) {
  try {
    const response = await api.get(`/app/european-citizenship-offer/${id}/`);
    if (!response.data) throw new Error("Failed to fetch offer details");
    return response.data;
  } catch (error) {
    throw error;
  }
}

// API service for investment plans (/app/investment-plans/)
export async function getInvestmentPlans() {
  try {
    const response = await api.get(`/app/investment-plans/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getInvestmentPlanById(id: string | number) {
  try {
    const response = await api.get(`/app/investment-plans/${id}/`);
    if (!response.data) throw new Error("Failed to fetch investment plan details");
    return response.data;
  } catch (error) {
    throw error;
  }
}

// API service for /app/investments/
export async function getInvestments() {
  try {
    const response = await api.get(`/app/investments/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getInvestmentById(id: string | number) {
  try {
    const response = await api.get(`/app/investments/${id}/`);
    if (!response.data) throw new Error("Failed to fetch investment details");
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Create a new investment: expects { plan, amount }
// Extended to support date fields per new requirements (plan_id, amount, start_date, maturity_date, next_withdraw_date)
export async function createInvestment(data: {
  plan_id: string | number,
  amount: number,
  start_date: string,
  maturity_date: string,
  next_withdraw_date: string
}) {
  try {
    const response = await api.post('/app/investments/', data);
    return response.data;
  } catch (error: any) {
    // Try to extract a more useful message from server error response
    if (error.response && error.response.data) {
      let errMsg = "Failed to create investment.";
      if (typeof error.response.data === "string") {
        errMsg = error.response.data;
      } else if (error.response.data.detail) {
        errMsg = error.response.data.detail;
      } else if (error.response.data.non_field_errors) {
        errMsg = error.response.data.non_field_errors.join(" ");
      }
      throw new Error(errMsg);
    }
    throw error;
  }
}

