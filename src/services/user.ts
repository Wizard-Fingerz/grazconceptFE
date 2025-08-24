import api from './api';

export interface SyllabusProgress {
  id: number;
  customer: number;
  syllabus: any;
  completed_lessons: number[];
  total_lessons: number;
  progress_percentage: number;
  last_accessed: string;
  is_completed: boolean;
  completed_at: string | null;
}

export interface LessonProgress {
  id: number;
  customer: number;
  lesson: number;
  is_completed: boolean;
  completed_at: string | null;
  time_spent: number;
  last_position: number;
}

export interface ExamProgress {
  id: number;
  customer: number;
  exam: number;
  attempts: number[];
  best_score: number | null;
  last_attempt: string | null;
}

export interface SyllabusProgressOverview {
  syllabus: any;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed_lesson: any;
  is_completed: boolean;
  completed_at: string | null;
}

const userServices = {
 

  async getAllUserType() {
    const response = await api.get('/definitions/by-table-name/?table_name=user_type');
    return response.data;
  },


  async getAllClientType() {
    const response = await api.get('/definitions/by-table-name/?table_name=client_type');
    return response.data;
  },

  async getAllServiceOfInterestType() {
    const response = await api.get('/definitions/by-table-name/?table_name=service_of_interest');
    return response.data;
  },


  async updateExamProgress(examId: number, data: Partial<ExamProgress>) {
    const response = await api.put(`/progress/exam/${examId}/`, data);
    return response.data;
  },

  async getAllClient() {
    const response = await api.get('/clients/');
    return response.data;
  },

  // Learning Journey Analytics
  async getLearningJourneyStats() {
    const response = await api.get('/progress/learning-journey/stats/');
    return response.data;
  },

  async getRecentActivity() {
    const response = await api.get('/progress/learning-journey/recent-activity/');
    return response.data;
  },

  async getLearningPath(syllabusId: number) {
    const response = await api.get(`/progress/learning-journey/path/${syllabusId}/`);
    return response.data;
  }
};

export default userServices; 