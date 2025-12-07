import api from './api';

export interface LandingSection {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  order: number;
  config: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface LandingPageConfig {
  id?: string;
  sections: LandingSection[];
  colorScheme?: Record<string, string>;
  typography?: Record<string, any>;
  layout?: string;
  headerStyle?: string;
  footerStyle?: string;
  animations?: boolean;
  parallax?: boolean;
  status: 'draft' | 'published';
  version?: number;
  created_at?: string;
  updated_at?: string;
}

// Get current landing page configuration (published or draft)
export const getLandingPageConfig = async (status: 'draft' | 'published' = 'published'): Promise<LandingPageConfig> => {
  try {
    const response = await api.get(`/landing-page/config/?status=${status}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Return default config if none exists
      return getDefaultConfig();
    }
    throw error;
  }
};

// Save landing page configuration (as draft)
export const saveLandingPageConfig = async (config: LandingPageConfig): Promise<LandingPageConfig> => {
  try {
    const response = await api.post('/landing-page/config/', {
      ...config,
      status: 'draft',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update landing page configuration
export const updateLandingPageConfig = async (id: string, config: Partial<LandingPageConfig>): Promise<LandingPageConfig> => {
  try {
    const response = await api.put(`/landing-page/config/${id}/`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Publish landing page configuration
export const publishLandingPageConfig = async (config: LandingPageConfig): Promise<LandingPageConfig> => {
  try {
    const response = await api.post('/landing-page/config/publish/', {
      ...config,
      status: 'published',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get landing page section by ID
export const getLandingPageSection = async (id: string): Promise<LandingSection> => {
  try {
    const response = await api.get(`/landing-page/sections/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create landing page section
export const createLandingPageSection = async (section: Omit<LandingSection, 'id' | 'created_at' | 'updated_at'>): Promise<LandingSection> => {
  try {
    const response = await api.post('/landing-page/sections/', section);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update landing page section
export const updateLandingPageSection = async (id: string, section: Partial<LandingSection>): Promise<LandingSection> => {
  try {
    const response = await api.put(`/landing-page/sections/${id}/`, section);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete landing page section
export const deleteLandingPageSection = async (id: string): Promise<void> => {
  try {
    await api.delete(`/landing-page/sections/${id}/`);
  } catch (error) {
    throw error;
  }
};

// Reorder sections
export const reorderLandingPageSections = async (sectionIds: string[]): Promise<void> => {
  try {
    await api.post('/landing-page/sections/reorder/', { section_ids: sectionIds });
  } catch (error) {
    throw error;
  }
};

// Upload image for landing page
export const uploadLandingPageImage = async (file: File, sectionId?: string): Promise<{ url: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    if (sectionId) {
      formData.append('section_id', sectionId);
    }
    const response = await api.post('/landing-page/upload-image/', formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get default configuration
export const getDefaultConfig = (): LandingPageConfig => {
  return {
    sections: [],
    colorScheme: {},
    typography: {},
    layout: 'boxed',
    headerStyle: 'sticky',
    footerStyle: 'standard',
    animations: true,
    parallax: false,
    status: 'draft',
    version: 1,
  };
};

