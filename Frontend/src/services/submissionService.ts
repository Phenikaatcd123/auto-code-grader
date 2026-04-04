import api from './api';

export interface SubmissionResult {
    id: string;
    score: number;
    feedback: string;
    test_results?: {
        passed: number;
        total: number;
        details: any[];
    };
    status: string;
}

export const submissionService = {
    async submitCode(data: {
        exam_id: string;
        question_id: string;
        code: string;
    }): Promise<{ submissionId: string; jobId: string }> {
        return api.post('/submissions/submit', data);
    },

    async getSubmissionResult(submissionId: string): Promise<SubmissionResult> {
        return api.get(`/submissions/${submissionId}`);
    },

    async getJobStatus(jobId: string): Promise<{ state: string; result?: any }> {
        return api.get(`/submissions/job/${jobId}`);
    },

    async getSubmissionHistory(): Promise<any[]> {
        const response = await api.get('/submissions/history');
        return response.submissions || response;
    }
};