import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Separator } from '@/app/components/ui/separator';
import {
  ArrowLeft,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Code,
  Sparkles,
  FileText,
  TrendingUp
} from 'lucide-react';

interface ViewSubmissionsProps {
  assignment: any;
  onBack: () => void;
}

const mockSubmissions = [
  {
    id: '1',
    studentName: 'Nguyễn Văn A',
    studentId: '20210001',
    email: 'student1@edu.vn',
    submittedAt: '2026-01-28T14:30:00',
    score: 85,
    testsPassed: 8,
    totalTests: 10,
    codeQuality: 78,
    status: 'passed',
    code: `function sortArray(arr) {
  return arr.sort((a, b) => a - b);
}`
  },
  {
    id: '2',
    studentName: 'Trần Thị B',
    studentId: '20210002',
    email: 'student2@edu.vn',
    submittedAt: '2026-01-27T16:45:00',
    score: 95,
    testsPassed: 10,
    totalTests: 10,
    codeQuality: 92,
    status: 'passed',
    code: `function sortArray(arr) {
  // Quick sort implementation
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...sortArray(left), ...middle, ...sortArray(right)];
}`
  },
  {
    id: '3',
    studentName: 'Lê Văn C',
    studentId: '20210003',
    email: 'student3@edu.vn',
    submittedAt: '2026-01-29T09:15:00',
    score: 45,
    testsPassed: 4,
    totalTests: 10,
    codeQuality: 55,
    status: 'failed',
    code: `function sortArray(arr) {
  // Bubble sort với bug
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`
  }
];

export function ViewSubmissions({ assignment, onBack }: ViewSubmissionsProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState('');

  const filteredSubmissions = mockSubmissions.filter(s =>
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.includes(searchTerm)
  );

  const averageScore = mockSubmissions.reduce((sum, s) => sum + s.score, 0) / mockSubmissions.length;
  const passedCount = mockSubmissions.filter(s => s.status === 'passed').length;

  if (selectedSubmission) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{selectedSubmission.studentName}</h1>
            <p className="text-gray-600 mt-1">MSSV: {selectedSubmission.studentId}</p>
          </div>
          <Badge variant={selectedSubmission.status === 'passed' ? 'default' : 'destructive'}>
            {selectedSubmission.score} điểm
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code and Results */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code đã nộp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono">{selectedSubmission.code}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kết quả test</CardTitle>
                <CardDescription>
                  Đạt {selectedSubmission.testsPassed}/{selectedSubmission.totalTests} test cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress
                  value={(selectedSubmission.testsPassed / selectedSubmission.totalTests) * 100}
                  className="mb-4"
                />
                <div className="space-y-2">
                  {Array.from({ length: selectedSubmission.totalTests }, (_, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {i < selectedSubmission.testsPassed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Test case #{i + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Đánh giá từ AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Chất lượng code</span>
                    <span className="text-sm font-bold">{selectedSubmission.codeQuality}/100</span>
                  </div>
                  <Progress value={selectedSubmission.codeQuality} />
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm text-gray-700">
                  <p>✓ Code có cấu trúc tốt và dễ đọc</p>
                  <p>⚠ Nên xử lý edge cases như mảng rỗng</p>
                  <p>💡 Có thể cải thiện hiệu suất bằng thuật toán tốt hơn</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback của giảng viên</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Nhập feedback cho sinh viên..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Gửi feedback
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Submission Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin nộp bài</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Sinh viên</div>
                  <div className="font-medium">{selectedSubmission.studentName}</div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">MSSV</div>
                  <div className="font-medium">{selectedSubmission.studentId}</div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <div className="font-medium text-sm">{selectedSubmission.email}</div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Thời gian nộp</div>
                  <div className="font-medium">
                    {new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
                  <Badge variant={selectedSubmission.status === 'passed' ? 'default' : 'destructive'}>
                    {selectedSubmission.status === 'passed' ? 'Đạt' : 'Không đạt'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chi tiết điểm số</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Test cases ({selectedSubmission.testsPassed}/{selectedSubmission.totalTests})</span>
                  <span className="font-medium">{Math.round(selectedSubmission.testsPassed / selectedSubmission.totalTests * 70)}/70</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Chất lượng code</span>
                  <span className="font-medium">{Math.round(selectedSubmission.codeQuality * 0.2)}/20</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Độ phức tạp</span>
                  <span className="font-medium">8/10</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Tổng điểm</span>
                  <span>{selectedSubmission.score}/100</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <p className="text-gray-600 mt-1">Danh sách bài nộp</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài nộp</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSubmissions.length}</div>
            <p className="text-xs text-gray-600 mt-1">/ {assignment.totalStudents} sinh viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <p className="text-xs text-gray-600 mt-1">Trên 100 điểm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ đạt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(passedCount / mockSubmissions.length * 100)}%</div>
            <p className="text-xs text-gray-600 mt-1">{passedCount}/{mockSubmissions.length} sinh viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa nộp</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignment.totalStudents - mockSubmissions.length}</div>
            <p className="text-xs text-gray-600 mt-1">Sinh viên</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc MSSV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.map((submission) => (
          <Card
            key={submission.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedSubmission(submission)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{submission.studentName}</h3>
                    <p className="text-sm text-gray-600">MSSV: {submission.studentId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Tests</div>
                    <div className="font-semibold">
                      {submission.testsPassed}/{submission.totalTests}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Code Quality</div>
                    <div className="font-semibold">{submission.codeQuality}/100</div>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <Badge
                      variant={submission.status === 'passed' ? 'default' : 'destructive'}
                      className="text-lg px-4 py-1"
                    >
                      {submission.score}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
