import api from './api';

export interface Exam {
    id: string;
    title: string;
    description: string;
    teacher_id: string;
    teacher_name?: string;
    duration_minutes: number;
    start_time: string;
    end_time: string;
    status: 'draft' | 'published' | 'in_progress' | 'completed';
    created_at: string;
}

export interface Question {
    id: string;
    exam_id: string;
    title: string;
    description: string;
    language: string;
    max_score: number;
    order_index: number;
}

export const examService = {
    async getExams(): Promise<Exam[]> {
        const response = await api.get('/exams');
        return response.exams || response;
    },

    async getExamById(id: string): Promise<Exam> {
        return api.get(`/exams/${id}`);
    },

    async getQuestions(examId: string): Promise<Question[]> {
        return api.get(`/exams/${examId}/questions`);
    }
};