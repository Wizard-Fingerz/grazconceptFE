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
  // Syllabus Progress
  async getSyllabusProgress(syllabusId: number) {
    const response = await api.get(`/progress/syllabus/${syllabusId}/`);
    return response.data;
  },

  async updateSyllabusProgress(syllabusId: number, data: Partial<SyllabusProgress>) {
    const response = await api.put(`/progress/syllabus/${syllabusId}/`, data);
    return response.data;
  },

  async getSyllabusProgressOverview(syllabusId: number) {
    const response = await api.get(`/progress/syllabus/${syllabusId}/overview/`);
    return response.data;
  },

  async getAllSyllabusProgress(): Promise<SyllabusProgress[]> {
    try {
      console.log('Fetching all syllabus progress...');
      const response = await api.get('/progress/syllabus/');
      console.log('Syllabus progress response:', response);
      
      if (!response.data) {
        console.error('No data received from server');
        return [];
      }
      
      // Handle paginated response
      const data = response.data.results || response.data;
      
      if (!Array.isArray(data)) {
        console.error('Invalid data format received:', data);
        return [];
      }
      
      // Ensure each syllabus progress has the required fields
      return data.map(progress => ({
        ...progress,
        progress_percentage: progress.progress_percentage || 0,
        completed_lessons: progress.completed_lessons || [],
        total_lessons: progress.total_lessons || 0,
        is_completed: progress.is_completed || false,
        last_accessed: progress.last_accessed || new Date().toISOString(),
        completed_at: progress.completed_at || null
      }));
    } catch (error: any) {
      console.error('Error fetching all syllabus progress:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      return [];
    }
  },

  // Lesson Progress
  async getLessonProgress(lessonId: number) {
    const response = await api.get(`/progress/lesson/${lessonId}/`);
    return response.data;
  },

  async updateLessonProgress(lessonId: number, data: Partial<LessonProgress>) {
    const response = await api.put(`/progress/lesson/${lessonId}/`, data);
    return response.data;
  },

  async completeLesson(lessonId: number) {
    const response = await api.post(`/progress/lesson/${lessonId}/complete/`);
    return response.data;
  },

  async getAllUserType() {
    const response = await api.get('/definitions/by-table-name/?table_name=user_type');
    return response.data;
  },

  // Exam Progress
  async getExamProgress(examId: number) {
    const response = await api.get(`/progress/exam/${examId}/`);
    return response.data;
  },

  async updateExamProgress(examId: number, data: Partial<ExamProgress>) {
    const response = await api.put(`/progress/exam/${examId}/`, data);
    return response.data;
  },

  async getAllExamProgress() {
    const response = await api.get('/progress/exams/');
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