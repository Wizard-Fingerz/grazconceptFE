import api from './api';

export interface Syllabus {
  id: number;
  title: string;
  description: string;
  category: string;
  instructor: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
  customers?: any[];
}

export interface Module {
  id: number;
  title: string;
  description: string;
  syllabus: number;
  order: number;
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  module: number;
  order: number;
  duration: number;
}

const syllabuservice = {
  async getSyllabus(params?: { search?: string; category?: string }) {
    const response = await api.get('/syllabus/', { params });
    return response.data;
  },

  async getSyllabusById(id: number) {
    const response = await api.get(`/syllabus/${id}/`);
    return response.data;
  },

  async createSyllabus(data: Partial<Syllabus>) {
    const response = await api.post('/syllabus/create/', data);
    return response.data;
  },

  async updateSyllabus(id: number, data: Partial<Syllabus>) {
    const response = await api.patch(`/syllabus/${id}/update/`, data);
    return response.data;
  },

  async deleteSyllabus(id: number) {
    await api.delete(`/syllabus/${id}/delete/`);
  },

  async enrollInSyllabus(id: number) {
    const response = await api.post(`/syllabus/${id}/enroll/`);
    return response.data;
  },

  async unenrollFromSyllabus(id: number) {
    const response = await api.delete(`/syllabus/${id}/enroll/`);
    return response.data;
  },

  async getModules(syllabusId: number) {
    const response = await api.get(`/syllabus/${syllabusId}/modules/`);
    return response.data;
  },

  async getModule(id: number) {
    const response = await api.get(`/syllabus/modules/${id}/`);
    return response.data;
  },

  async getLessons(moduleId: number) {
    const response = await api.get(`/syllabus/modules/${moduleId}/lessons/`);
    return response.data;
  },

  async getLesson(id: number) {
    const response = await api.get(`/syllabus/lessons/${id}/`);
    return response.data;
  },
};

export default syllabuservice; 