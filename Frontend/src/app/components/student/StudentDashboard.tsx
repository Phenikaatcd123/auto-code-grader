import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy,
  FileCode,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { AssignmentDetail } from './AssignmentDetail';
import { useAuth } from '@/app/contexts/AuthContext';
import { examService, Exam } from '../../../services/examService';

export function StudentDashboard() {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const data = await examService.getExams();
        // Chỉ hiển thị bài thi đã publish
        const publishedExams = data.filter(e => e.status === 'published');
        setExams(publishedExams);
      } catch (err) {
        console.error('Failed to fetch exams:', err);
        setError('Không thể tải danh sách bài thi');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (selectedExam) {
    return (
      <AssignmentDetail
        exam={selectedExam}
        onBack={() => setSelectedExam(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Đang tải bài thi...</span>
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

  const submittedCount = exams.filter(e => {
    // Cần có logic kiểm tra đã nộp hay chưa
    // Tạm thời dùng status
    return e.status === 'completed';
  }).length;

  const averageScore = 0; // Sẽ tính từ API submissions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Xin chào, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Chào mừng bạn quay trở lại hệ thống nộp bài</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài tập</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
            <p className="text-xs text-gray-600 mt-1">Trong học kỳ này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã nộp</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedCount}</div>
            <Progress value={exams.length ? (submittedCount / exams.length) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <p className="text-xs text-gray-600 mt-1">Trên 100 điểm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp đến hạn</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.filter(e => e.status === 'in_progress').length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Bài tập cần nộp</p>
          </CardContent>
        </Card>
      </div>

      {/* Exams List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Chưa nộp</TabsTrigger>
          <TabsTrigger value="submitted">Đã nộp</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onClick={() => setSelectedExam(exam)}
            />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {exams
            .filter(e => e.status === 'in_progress' || e.status === 'published')
            .map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onClick={() => setSelectedExam(exam)}
              />
            ))}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4 mt-4">
          {exams
            .filter(e => e.status === 'completed')
            .map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onClick={() => setSelectedExam(exam)}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component hiển thị bài thi
function ExamCard({ exam, onClick }: { exam: Exam; onClick: () => void }) {
  const isOverdue = new Date(exam.end_time) < new Date() && exam.status !== 'completed';
  const daysLeft = Math.ceil((new Date(exam.end_time).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Xác định độ khó dựa trên duration hoặc title (tạm thời)
  const getDifficulty = () => {
    if (exam.duration_minutes <= 30) return 'easy';
    if (exam.duration_minutes <= 60) return 'medium';
    return 'hard';
  };
  
  const difficulty = getDifficulty();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-lg">{exam.title}</h3>
              <Badge variant={
                difficulty === 'easy' ? 'default' :
                difficulty === 'medium' ? 'secondary' : 'destructive'
              }>
                {difficulty === 'easy' ? 'Dễ' :
                 difficulty === 'medium' ? 'Trung bình' : 'Khó'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{exam.teacher_name || 'Giảng viên'}</p>
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{exam.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {isOverdue ? (
                    <span className="text-red-600 font-medium">Quá hạn</span>
                  ) : exam.status === 'completed' ? (
                    <span className="text-green-600">Đã nộp</span>
                  ) : (
                    <span>Còn {daysLeft} ngày</span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{exam.duration_minutes} phút</span>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm">
            {exam.status === 'completed' ? 'Xem chi tiết' : 'Nộp bài'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}