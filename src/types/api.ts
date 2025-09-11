import { ApiResponse, PaginatedResponse } from './common';

// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'admin' | 'sub_admin' | 'teacher' | 'student';

export interface UserProfile extends User {
  avatar?: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showProgress: boolean;
  };
}

export interface UserStatistics {
  totalQuizzes: number;
  totalPractice: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experiencePoints: number;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse extends ApiResponse<{
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}> {}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Student types
export interface Student extends User {
  batchId: number;
  batch?: Batch;
  level: number;
  progress: StudentProgress;
  achievements: Achievement[];
}

export interface StudentProgress {
  currentLevel: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
  timeSpent: number;
  lastActivity: string;
  streak: number;
  experiencePoints: number;
}

export interface StudentDashboard {
  user: Student;
  recentActivity: Activity[];
  upcomingQuizzes: Quiz[];
  progress: StudentProgress;
  leaderboard: LeaderboardEntry[];
  achievements: Achievement[];
}

// Teacher types
export interface Teacher extends User {
  batches: Batch[];
  students: Student[];
  statistics: TeacherStatistics;
}

export interface TeacherStatistics {
  totalStudents: number;
  totalBatches: number;
  averageStudentScore: number;
  totalQuizzesCreated: number;
  activeStudents: number;
}

export interface TeacherDashboard {
  user: Teacher;
  batches: Batch[];
  recentActivity: Activity[];
  studentProgress: StudentProgress[];
  upcomingEvents: Event[];
}

// Admin types
export interface Admin extends User {
  permissions: AdminPermission[];
  statistics: AdminStatistics;
}

export interface AdminPermission {
  resource: string;
  actions: string[];
}

export interface AdminStatistics {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalBatches: number;
  totalQuizzes: number;
  activeUsers: number;
  systemHealth: SystemHealth;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  lastBackup: string;
}

// Batch types
export interface Batch {
  id: number;
  name: string;
  description?: string;
  teacherId: number;
  teacher?: Teacher;
  students: Student[];
  level: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBatchRequest {
  name: string;
  description?: string;
  teacherId: number;
  level: number;
  startDate: string;
  endDate?: string;
}

export interface UpdateBatchRequest extends Partial<CreateBatchRequest> {
  id: number;
}

// Quiz types
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  levelId: number;
  classId: number;
  topicId: number;
  quizType: QuizType;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type QuizType = 'practice' | 'test' | 'oral_test' | 'final_test' | 'pvp';

export interface Question {
  id: number;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty: Difficulty;
  timeLimit?: number;
  points: number;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'calculation';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizAttempt {
  id: number;
  studentId: number;
  quizId: number;
  answers: QuizAnswer[];
  score: number;
  timeSpent: number;
  completedAt: string;
  isPassed: boolean;
}

export interface QuizAnswer {
  questionId: number;
  answer: string | number;
  isCorrect: boolean;
  timeSpent: number;
}

// Practice types
export interface PracticeSession {
  id: number;
  studentId: number;
  practiceType: PracticeType;
  operation: Operation;
  numberOfDigits: number;
  numberOfQuestions: number;
  numberOfRows: number;
  zigZag: boolean;
  includeSubtraction: boolean;
  persistNumberOfDigits: boolean;
  includeDecimals: boolean;
  score: number;
  totalTime: number;
  averageTime: number;
  completedAt: string;
}

export type PracticeType = 'timed' | 'untimed' | 'flashcards' | 'set';
export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  level: number;
  experiencePoints: number;
  streak: number;
  avatar?: string;
}

export interface LeaderboardResponse extends ApiResponse<{
  leaderboard: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
  totalPlayers: number;
}> {}

// Activity types
export interface Activity {
  id: number;
  userId: number;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export type ActivityType = 
  | 'quiz_completed'
  | 'practice_completed'
  | 'level_up'
  | 'achievement_unlocked'
  | 'login'
  | 'logout'
  | 'profile_updated';

// Achievement types
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  criteria: AchievementCriteria;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export type AchievementCategory = 'quiz' | 'practice' | 'streak' | 'level' | 'social';

export interface AchievementCriteria {
  type: string;
  value: number;
  description: string;
}

// Event types
export interface Event {
  id: number;
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  isAllDay: boolean;
  location?: string;
  attendees: number[];
  createdBy: number;
  createdAt: string;
}

export type EventType = 'quiz' | 'practice' | 'meeting' | 'announcement' | 'deadline';

// Report types
export interface Report {
  id: number;
  title: string;
  type: ReportType;
  data: ReportData;
  filters: ReportFilters;
  generatedAt: string;
  generatedBy: number;
}

export type ReportType = 'student_progress' | 'batch_performance' | 'quiz_analytics' | 'system_usage';

export interface ReportData {
  summary: Record<string, any>;
  charts: ChartData[];
  tables: TableData[];
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  title: string;
  data: any;
  options?: any;
}

export interface TableData {
  title: string;
  headers: string[];
  rows: any[][];
}

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  batchIds?: number[];
  studentIds?: number[];
  quizIds?: number[];
  levelIds?: number[];
}

// API endpoint types
export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    forgotPassword: string;
    resetPassword: string;
  };
  users: {
    profile: string;
    update: string;
    delete: string;
    list: string;
  };
  students: {
    dashboard: string;
    progress: string;
    leaderboard: string;
    practice: string;
    quiz: string;
  };
  teachers: {
    dashboard: string;
    batches: string;
    students: string;
    reports: string;
  };
  admin: {
    dashboard: string;
    users: string;
    batches: string;
    system: string;
  };
}
