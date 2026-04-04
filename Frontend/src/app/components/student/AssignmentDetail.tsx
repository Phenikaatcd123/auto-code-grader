import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';
import { Separator } from '@/app/components/ui/separator';
import {
  ArrowLeft,
  Upload,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Code,
  FileText,
  Sparkles,
  Clock,
  Loader2
} from 'lucide-react';
import { submissionService } from '../../../services/submissionService';
import { examService, Question } from '../../../services/examService';
import { useAuth } from '@/app/contexts/AuthContext';

interface AssignmentDetailProps {
  exam: any;
  onBack: () => void;
}

export function AssignmentDetail({ exam, onBack }: AssignmentDetailProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  // Fetch questions when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await examService.getQuestions(exam.id);
        setQuestions(data);
        if (data.length > 0) {
          setCurrentQuestion(data[0]);
          setLanguage(data[0].language || 'javascript');
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setError('Không thể tải câu hỏi');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [exam.id]);

  // Polling for job status
  useEffect(() => {
    if (!submissionId) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await submissionService.getSubmissionResult(submissionId!);
        if (result.status === 'graded') {
          setTestResults(result.test_results);
          setAiFeedback({
            codeQuality: result.score || 75,
            feedback: result.feedback || 'Đang xử lý...',
            suggestions: []
          });
          setShowResults(true);
          setJobStatus('completed');
          clearInterval(pollInterval);
        } else if (result.status === 'submitted') {
          setJobStatus('processing');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [submissionId]);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      // Tạm thời simulate kết quả
      setTimeout(() => {
        setIsRunning(false);
        setShowResults(true);
        setTestResults({
          passed: 3,
          total: 4,
          details: [
            { id: 1, name: 'Test case 1', status: 'passed', time: '0.1s', memory: '2.3MB' },
            { id: 2, name: 'Test case 2', status: 'passed', time: '0.2s', memory: '2.5MB' },
            { id: 3, name: 'Test case 3', status: 'failed', time: '0.3s', memory: '2.8MB', error: 'Expected: [1,2,3], Got: [1,3,2]' },
            { id: 4, name: 'Test case 4', status: 'passed', time: '0.15s', memory: '2.4MB' }
          ]
        });
      }, 2000);
    } catch (err) {
      console.error('Run error:', err);
      setError('Lỗi khi chạy code');
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;
    
    if (!confirm('Bạn có chắc muốn nộp bài? Bạn sẽ không thể chỉnh sửa sau khi nộp.')) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await submissionService.submitCode({
        exam_id: exam.id,
        question_id: currentQuestion.id,
        code: code
      });
      
      setSubmissionId(response.submissionId);
      setJobStatus('queued');
      
      // Bắt đầu polling
      const pollTimer = setInterval(async () => {
        try {
          const result = await submissionService.getSubmissionResult(response.submissionId);
          if (result.status === 'graded') {
            setTestResults(result.test_results);
            setAiFeedback({
              codeQuality: result.score || 75,
              feedback: result.feedback,
              suggestions: []
            });
            setShowResults(true);
            setJobStatus('completed');
            clearInterval(pollTimer);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
      
    } catch (err) {
      console.error('Submit error:', err);
      setError('Lỗi khi nộp bài. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Đang tải bài tập...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  const passedTests = testResults?.details?.filter((t: any) => t.status === 'passed').length || 0;
  const totalTests = testResults?.details?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{currentQuestion?.title || exam.title}</h1>
          <p className="text-gray-600 mt-1">{exam.title}</p>
        </div>
        <Badge variant={exam.duration_minutes <= 30 ? 'default' : 'secondary'}>
          {exam.duration_minutes} phút
        </Badge>
      </div>

      {/* Job Status */}
      {jobStatus === 'queued' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
              <span>Đang xếp hàng chờ chấm điểm...</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {jobStatus === 'processing' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Đang chấm điểm bài làm của bạn...</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Code editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code Editor
                </CardTitle>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full font-mono text-sm min-h-[400px] p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập code của bạn..."
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleRun} disabled={isRunning}>
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Đang chạy...' : 'Chạy thử'}
                </Button>
                <Button onClick={handleSubmit} variant="default" disabled={isSubmitting}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {showResults && testResults && (
            <Card>
              <CardHeader>
                <CardTitle>Kết quả test</CardTitle>
                <CardDescription>
                  Đạt {passedTests}/{totalTests} test cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 mb-4">
                  <Progress value={totalTests ? (passedTests / totalTests) * 100 : 0} className="flex-1" />
                  <span className="text-sm font-medium">
                    {totalTests ? Math.round((passedTests / totalTests) * 100) : 0}%
                  </span>
                </div>
                
                {testResults.details?.map((test: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {test.status === 'passed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{test.name}</div>
                          {test.error && (
                            <div className="text-sm text-red-600 mt-1 font-mono bg-red-50 p-2 rounded">
                              {test.error}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 text-right">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {test.time}
                        </div>
                        <div>{test.memory}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Feedback */}
          {showResults && aiFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Đánh giá từ AI (Gemini)
                </CardTitle>
                <CardDescription>Phân tích chất lượng code và đề xuất cải thiện</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Chất lượng code</span>
                    <span className="text-sm font-bold">{aiFeedback.codeQuality}/100</span>
                  </div>
                  <Progress value={aiFeedback.codeQuality} />
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-700">{aiFeedback.feedback}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right side - Assignment info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Thông tin bài tập
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Deadline</div>
                <div className="font-medium">
                  {new Date(exam.end_time).toLocaleString('vi-VN')}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Thời gian làm bài</div>
                <div className="font-medium">{exam.duration_minutes} phút</div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-2">Mô tả</div>
                <p className="text-sm">{currentQuestion?.description || exam.description}</p>
              </div>
            </CardContent>
          </Card>

          {currentQuestion && (
            <Card>
              <CardHeader>
                <CardTitle>Yêu cầu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Ngôn ngữ: {currentQuestion.language?.toUpperCase() || 'JavaScript'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Điểm tối đa: {currentQuestion.max_score}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}