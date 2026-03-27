import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
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
  Clock
} from 'lucide-react';

interface AssignmentDetailProps {
  assignment: any;
  onBack: () => void;
}

const mockTestResults = [
  { id: 1, name: 'Test case 1', status: 'passed', time: '0.1s', memory: '2.3MB' },
  { id: 2, name: 'Test case 2', status: 'passed', time: '0.2s', memory: '2.5MB' },
  { id: 3, name: 'Test case 3', status: 'failed', time: '0.3s', memory: '2.8MB', error: 'Expected: [1,2,3], Got: [1,3,2]' },
  { id: 4, name: 'Test case 4', status: 'passed', time: '0.15s', memory: '2.4MB' },
];

const mockAIFeedback = {
  codeQuality: 75,
  feedback: [
    {
      type: 'positive',
      message: 'Code có cấu trúc tốt và dễ đọc'
    },
    {
      type: 'warning',
      message: 'Nên thêm validation cho input để tránh lỗi runtime'
    },
    {
      type: 'suggestion',
      message: 'Có thể tối ưu độ phức tạp từ O(n²) xuống O(n log n) bằng cách sử dụng thuật toán merge sort'
    }
  ],
  suggestions: [
    'Thêm comments để giải thích logic phức tạp',
    'Xử lý các edge cases như mảng rỗng hoặc mảng có 1 phần tử',
    'Cân nhắc sử dụng thuật toán hiệu quả hơn cho bài toán này'
  ]
};

export function AssignmentDetail({ assignment, onBack }: AssignmentDetailProps) {
  const [code, setCode] = useState(`// Viết code của bạn ở đây
function sortArray(arr) {
  // Bubble sort implementation
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
`);
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(assignment.status === 'submitted');

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setShowResults(true);
    }, 2000);
  };

  const handleSubmit = () => {
    if (confirm('Bạn có chắc muốn nộp bài? Bạn sẽ không thể chỉnh sửa sau khi nộp.')) {
      handleRun();
    }
  };

  const passedTests = mockTestResults.filter(t => t.status === 'passed').length;
  const totalTests = mockTestResults.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <p className="text-gray-600 mt-1">{assignment.course}</p>
        </div>
        <Badge variant={
          assignment.difficulty === 'easy' ? 'default' :
          assignment.difficulty === 'medium' ? 'secondary' : 'destructive'
        }>
          {assignment.difficulty === 'easy' ? 'Dễ' :
           assignment.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
        </Badge>
      </div>

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
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm min-h-[400px] resize-none"
                placeholder="Nhập code của bạn..."
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleRun} disabled={isRunning}>
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Đang chạy...' : 'Chạy thử'}
                </Button>
                <Button onClick={handleSubmit} variant="default" disabled={isRunning}>
                  <Upload className="w-4 h-4 mr-2" />
                  Nộp bài
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {showResults && (
            <Card>
              <CardHeader>
                <CardTitle>Kết quả test</CardTitle>
                <CardDescription>
                  Đạt {passedTests}/{totalTests} test cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 mb-4">
                  <Progress value={(passedTests / totalTests) * 100} className="flex-1" />
                  <span className="text-sm font-medium">{Math.round((passedTests / totalTests) * 100)}%</span>
                </div>
                
                {mockTestResults.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
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
          {showResults && (
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
                    <span className="text-sm font-bold">{mockAIFeedback.codeQuality}/100</span>
                  </div>
                  <Progress value={mockAIFeedback.codeQuality} />
                </div>

                <Separator />

                <div className="space-y-3">
                  {mockAIFeedback.feedback.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {item.type === 'positive' && (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      )}
                      {item.type === 'warning' && (
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      )}
                      {item.type === 'suggestion' && (
                        <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-gray-700">{item.message}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Đề xuất cải thiện:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {mockAIFeedback.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
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
                  {new Date(assignment.deadline).toLocaleString('vi-VN')}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Điểm tối đa</div>
                <div className="font-medium">{assignment.maxScore} điểm</div>
              </div>

              {assignment.status === 'submitted' && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Điểm của bạn</div>
                    <div className="text-2xl font-bold text-green-600">
                      {assignment.score}/{assignment.maxScore}
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-2">Mô tả</div>
                <p className="text-sm">{assignment.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Input: Một mảng số nguyên chưa sắp xếp</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Output: Mảng đã được sắp xếp tăng dần</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Độ phức tạp tối đa: O(n²)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Thời gian chạy tối đa: 1s/test case</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
