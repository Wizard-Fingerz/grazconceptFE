
import type {
  VideoTutorial,
  TrainingProgress,
  Template,
  DigitalCatalog,
  SalesScript,
  AgentPlaybook,
  TrainingFilter,
  TrainingSort} from '../types/training';
import api from './api';

// Training & Resource Center API
export const trainingApi = {
  // Video Tutorials
  getTutorials: async (filter?: TrainingFilter, sort?: TrainingSort, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filter && Object.entries(filter).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = value.toString();
          }
        }
        return acc;
      }, {} as Record<string, string>)),
      ...(sort && { sort_by: sort.field, sort_order: sort.direction })
    });

    const response = await api.get(`/training/tutorials?${params}`);
    return response.data;
  },

  getTutorial: async (id: string) => {
    const response = await api.get(`/training/tutorials/${id}`);
    return response.data;
  },

  updateProgress: async (tutorialId: string, progress: Partial<TrainingProgress>) => {
    const response = await api.put(`/training/tutorials/${tutorialId}/progress`, progress);
    return response.data;
  },

  getProgress: async (tutorialId: string) => {
    const response = await api.get(`/training/tutorials/${tutorialId}/progress`);
    return response.data;
  },

  // Templates
  getTemplates: async (filter?: TrainingFilter, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filter && Object.entries(filter).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = value.toString();
          }
        }
        return acc;
      }, {} as Record<string, string>))
    });

    const response = await api.get(`/training/templates?${params}`);
    return response.data;
  },

  getTemplate: async (id: string) => {
    const response = await api.get(`/training/templates/${id}`);
    return response.data;
  },

  createTemplate: async (template: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
    const response = await api.post('/training/templates', template);
    return response.data;
  },

  updateTemplate: async (id: string, template: Partial<Template>) => {
    const response = await api.put(`/training/templates/${id}`, template);
    return response.data;
  },

  deleteTemplate: async (id: string) => {
    const response = await api.delete(`/training/templates/${id}`);
    return response.data;
  },

  useTemplate: async (id: string, variables: Record<string, any>) => {
    const response = await api.post(`/training/templates/${id}/use`, { variables });
    return response.data;
  },

  // Digital Catalogs
  getCatalogs: async (filter?: TrainingFilter, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filter && Object.entries(filter).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = value.toString();
          }
        }
        return acc;
      }, {} as Record<string, string>))
    });

    const response = await api.get(`/training/catalogs?${params}`);
    return response.data;
  },

  getCatalog: async (id: string) => {
    const response = await api.get(`/training/catalogs/${id}`);
    return response.data;
  },

  downloadCatalog: async (id: string) => {
    const response = await api.get(`/training/catalogs/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Sales Scripts
  getScripts: async (filter?: TrainingFilter, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filter && Object.entries(filter).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = value.toString();
          }
        }
        return acc;
      }, {} as Record<string, string>))
    });

    const response = await api.get(`/training/scripts?${params}`);
    return response.data;
  },

  getScript: async (id: string) => {
    const response = await api.get(`/training/scripts/${id}`);
    return response.data;
  },

  useScript: async (id: string, context: Record<string, any>) => {
    const response = await api.post(`/training/scripts/${id}/use`, { context });
    return response.data;
  },

  // Agent Playbooks
  getPlaybooks: async (filter?: TrainingFilter, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filter && Object.entries(filter).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = value.toString();
          }
        }
        return acc;
      }, {} as Record<string, string>))
    });

    const response = await api.get(`/training/playbooks?${params}`);
    return response.data;
  },

  getPlaybook: async (id: string) => {
    const response = await api.get(`/training/playbooks/${id}`);
    return response.data;
  },

  // Learning Paths
  getLearningPaths: async () => {
    const response = await api.get('/training/learning-paths');
    return response.data;
  },

  getLearningPath: async (id: string) => {
    const response = await api.get(`/training/learning-paths/${id}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/training/categories');
    return response.data;
  },

  // Stats & Analytics
  getStats: async () => {
    const response = await api.get('/training/stats');
    return response.data;
  },

  // getProgress: async () => {
  //   const response = await api.get('/training/progress');
  //   return response.data;
  // },

  // File Upload
  uploadFile: async (file: File, type: 'template' | 'catalog' | 'tutorial') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post('/training/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

// Mock data for development
export const mockTrainingData = {
  tutorials: [
    {
      id: '1',
      title: 'Introduction to Visa Processing',
      description: 'Learn the fundamentals of visa processing and documentation requirements',
      video_url: '/videos/visa-intro.mp4',
      thumbnail_url: '/thumbnails/visa-intro.jpg',
      duration: 1800, // 30 minutes
      category: { id: '1', name: 'Visa Services', description: 'Visa processing tutorials' },
      difficulty: 'beginner',
      tags: ['visa', 'documentation', 'basics'],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      instructor: 'Sarah Johnson',
      views: 1250,
      likes: 89,
      is_featured: true,
      is_required: true,
      prerequisites: [],
      learning_objectives: [
        'Understand visa types and requirements',
        'Learn documentation process',
        'Master client communication'
      ],
      resources: [
        { id: '1', name: 'Visa Checklist', type: 'document', url: '/docs/visa-checklist.pdf' },
        { id: '2', name: 'Sample Application', type: 'document', url: '/docs/sample-application.pdf' }
      ]
    },
    {
      id: '2',
      title: 'Advanced Sales Techniques',
      description: 'Master advanced sales techniques for closing deals and handling objections',
      video_url: '/videos/sales-advanced.mp4',
      thumbnail_url: '/thumbnails/sales-advanced.jpg',
      duration: 2400, // 40 minutes
      category: { id: '2', name: 'Sales Training', description: 'Sales and communication skills' },
      difficulty: 'advanced',
      tags: ['sales', 'closing', 'objections'],
      created_at: '2024-01-14T15:30:00Z',
      updated_at: '2024-01-14T15:30:00Z',
      instructor: 'Michael Chen',
      views: 890,
      likes: 67,
      is_featured: false,
      is_required: false,
      prerequisites: ['Introduction to Sales'],
      learning_objectives: [
        'Master objection handling',
        'Learn closing techniques',
        'Improve conversion rates'
      ]
    }
  ] as VideoTutorial[],

  templates: [
    {
      id: '1',
      name: 'Visa Application Email Template',
      description: 'Professional email template for visa application follow-ups',
      type: 'email',
      category: 'Visa Services',
      content: 'Dear {{client_name}},\n\nThank you for choosing our visa services. Your application for {{visa_type}} is currently being processed.\n\nNext steps:\n1. {{step_one}}\n2. {{step_two}}\n\nPlease don\'t hesitate to contact us if you have any questions.\n\nBest regards,\n{{agent_name}}',
      variables: [
        { name: 'client_name', type: 'text', required: true, description: 'Client full name' },
        { name: 'visa_type', type: 'select', required: true, options: ['Tourist', 'Student', 'Work', 'Business'], description: 'Type of visa' },
        { name: 'step_one', type: 'text', required: true, description: 'First next step' },
        { name: 'step_two', type: 'text', required: true, description: 'Second next step' },
        { name: 'agent_name', type: 'text', required: true, description: 'Agent name' }
      ],
      created_at: '2024-01-15T09:00:00Z',
      updated_at: '2024-01-15T09:00:00Z',
      created_by: 1,
      is_public: true,
      usage_count: 45,
      tags: ['email', 'visa', 'follow-up']
    },
    {
      id: '2',
      name: 'Client Onboarding Checklist',
      description: 'Comprehensive checklist for new client onboarding process',
      type: 'checklist',
      category: 'Client Management',
      content: 'Client Onboarding Checklist\n\n□ Initial consultation completed\n□ Required documents collected\n□ Application submitted\n□ Payment processed\n□ Follow-up scheduled\n□ Welcome package sent',
      variables: [],
      created_at: '2024-01-14T14:00:00Z',
      updated_at: '2024-01-14T14:00:00Z',
      created_by: 1,
      is_public: true,
      usage_count: 23,
      tags: ['checklist', 'onboarding', 'process']
    }
  ] as Template[],

  catalogs: [
    {
      id: '1',
      title: 'Study Abroad Programs Catalog 2024',
      description: 'Comprehensive catalog of study abroad programs and universities',
      category: 'Education',
      subcategory: 'Study Abroad',
      file_url: '/catalogs/study-abroad-2024.pdf',
      file_type: 'pdf',
      file_size: 2500000, // 2.5MB
      thumbnail_url: '/thumbnails/study-abroad-catalog.jpg',
      version: '1.0',
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-01-15T08:00:00Z',
      created_by: 1,
      is_active: true,
      download_count: 156,
      tags: ['education', 'universities', 'programs'],
      pages: 45,
      language: 'English',
      target_audience: 'both'
    }
  ] as DigitalCatalog[],

  scripts: [
    {
      id: '1',
      title: 'Cold Call Introduction Script',
      description: 'Professional script for initial cold calls to potential clients',
      category: 'cold_calling',
      scenario: 'Initial contact with potential visa service client',
      script_content: 'Hello {{client_name}}, this is {{agent_name}} from Graz Concept. I\'m calling because I noticed you might be interested in our visa services. Do you have a few minutes to discuss how we can help you with your travel or study plans?',
      key_points: [
        'Introduce yourself and company',
        'Mention specific benefit',
        'Ask for permission to continue',
        'Keep it brief and professional'
      ],
      objections: [
        {
          objection: 'I\'m not interested',
          response: 'I understand. Many people feel that way initially. May I ask what specifically concerns you about visa services?',
          tips: ['Listen actively', 'Acknowledge their concern', 'Ask clarifying questions']
        }
      ],
      follow_up_actions: [
        'Send follow-up email with more information',
        'Schedule a consultation call',
        'Add to CRM for future contact'
      ],
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-01-15T11:00:00Z',
      created_by: 1,
      is_active: true,
      usage_count: 78,
      success_rate: 0.35,
      tags: ['cold-calling', 'introduction', 'sales'],
      difficulty: 'beginner',
      estimated_duration: 5
    }
  ] as SalesScript[],

  playbooks: [
    {
      id: '1',
      title: 'Client Onboarding Playbook',
      description: 'Complete guide for onboarding new clients',
      category: 'onboarding',
      content: 'This playbook covers the complete client onboarding process from initial contact to first service delivery.',
      sections: [
        {
          id: '1',
          title: 'Initial Contact',
          content: 'How to handle the first client interaction',
          order: 1,
          subsections: [
            {
              id: '1-1',
              title: 'Phone Call Protocol',
              content: 'Step-by-step phone call guidelines',
              order: 1
            }
          ]
        },
        {
          id: '2',
          title: 'Document Collection',
          content: 'Process for collecting required documents',
          order: 2
        }
      ],
      created_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-01-15T12:00:00Z',
      created_by: 1,
      is_active: true,
      version: '1.0',
      tags: ['onboarding', 'process', 'clients'],
      target_roles: ['agent', 'manager'],
      priority: 'high'
    }
  ] as AgentPlaybook[]
};
