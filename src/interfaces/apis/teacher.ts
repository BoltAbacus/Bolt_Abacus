import { z } from 'zod';

// Get All Teaches API Response
export const TeacherSchema = z.object({
  userId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
});
export type Teacher = z.infer<typeof TeacherSchema>;

export const GetAllTeachersResponseSchema = z.object({
  teachers: z.array(TeacherSchema),
});

export type GetAllTeachersResponse = z.infer<
  typeof GetAllTeachersResponseSchema
>;

// Get All Teaches API V2 Response
export const TeacherSchemaV2 = z.object({
  userId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  tag: z.string(),
});
export type TeacherV2 = z.infer<typeof TeacherSchemaV2>;

export const GetAllTeachersResponseSchemaV2 = z.object({
  teachers: z.array(TeacherSchemaV2),
});

export type GetAllTeachersResponseV2 = z.infer<
  typeof GetAllTeachersResponseSchemaV2
>;

// Get Teacher Batches API Response
export const BatchSchema = z.object({
  batchId: z.number(),
  batchName: z.string(),
  timings: z.string(),
  latestLevelId: z.number(),
  latestClassId: z.number(),
});
export type Batch = z.infer<typeof BatchSchema>;

export const GetTeacherBatchesResponseSchema = z.object({
  batches: z.object({
    Monday: z.array(BatchSchema),
    Tuesday: z.array(BatchSchema),
    Wednesday: z.array(BatchSchema),
    Thursday: z.array(BatchSchema),
    Friday: z.array(BatchSchema),
    Saturday: z.array(BatchSchema),
    Sunday: z.array(BatchSchema),
  }),
});

export type GetTeacherBatchesResponse = z.infer<
  typeof GetTeacherBatchesResponseSchema
>;

// Get Teacher Batches API Response
export const UpdateClassResponseSchema = z.object({
  message: z.string(),
  class: z.number(),
  level: z.number(),
});

export type UpdateClassResponse = z.infer<typeof UpdateClassResponseSchema>;

// Get Batch Report API Response
export const StudentReportSchema = z.object({
  userId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  classwork: z.number(),
  homework: z.number(),
  test: z.number(),
});
export type StudentReport = z.infer<typeof StudentReportSchema>;

export const GetBatchReportResponseSchema = z.object({
  reports: z.array(StudentReportSchema),
});

export type GetBatchReportResponse = z.infer<
  typeof GetBatchReportResponseSchema
>;

// Get Student Progress API Response
export const TopicProgressSchema = z.object({
  topicId: z.number(),
  Classwork: z.number(),
  ClassworkTime: z.number(),
  Homework: z.number(),
  HomeworkTime: z.number(),
});

export const ClassProgressSchema = z.object({
  classId: z.number(),
  Test: z.number(),
  Time: z.number(),
  topics: z.array(TopicProgressSchema),
});
export type ClassProgress = z.infer<typeof ClassProgressSchema>;

export const LevelProgressSchema = z.object({
  levelId: z.number(),
  classes: z.array(ClassProgressSchema),
  FinalTest: z.number(),
  FinalTestTime: z.number(),
  OralTest: z.number(),
  OralTestTime: z.number(),
});
export type LevelProgress = z.infer<typeof LevelProgressSchema>;

export type PracticeSession = z.infer<typeof PracticeSessionSchema>;
export type PracticeStats = z.infer<typeof PracticeStatsSchema>;

// Practice Statistics Schema
export const PracticeSessionSchema = z.object({
  practiceQuestionId: z.number(),
  practiceType: z.string(),
  operation: z.string(),
  score: z.number(),
  totalTime: z.number(),
  averageTime: z.number(),
  created_at: z.string(),
  numberOfQuestions: z.number().optional(),
  problemTimes: z.array(z.object({
    questionId: z.string(),
    startTime: z.number(),
    endTime: z.number(),
    timeSpent: z.number(),
    isCorrect: z.boolean(),
    isSkipped: z.boolean()
  })).optional(),
});

export const PracticeStatsSchema = z.object({
  totalSessions: z.number(),
  totalPracticeTime: z.number(),
  totalProblemsSolved: z.number(),
  totalQuestionsAttempted: z.number(),
  averageTimePerSession: z.number(),
  averageProblemsPerSession: z.number(),
  recentSessions: z.number(),
  practiceSessions: z.array(PracticeSessionSchema),
  totalQuestions: z.number().optional(),
  totalCorrectAnswers: z.number().optional(),
  totalTimeSpent: z.number().optional(),
});

export const GetStudentProgressResponseSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  batchName: z.string(),
  levels: z.array(LevelProgressSchema),
  practiceStats: PracticeStatsSchema.optional(),
});

export type GetStudentProgressResponse = z.infer<
  typeof GetStudentProgressResponseSchema
>;

export const GetStudentsResponseSchema = z.object({
  students: z.array(
    z.object({
      userId: z.number(),
      firstName: z.string(),
      lastName: z.string(),
    })
  ),
});

export type GetStudentsResponse = z.infer<typeof GetStudentsResponseSchema>;

// Search Students by Name API

export const SearchStudentsResponseSchema = z.object({
  students: z.array(
    z.object({
      userId: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      phoneNumber: z.string(),
      email: z.string(),
      tag: z.string(),
      batchName: z.string(),
    })
  ),
});

export type SearchStudentsResponse = z.infer<
  typeof SearchStudentsResponseSchema
>;
