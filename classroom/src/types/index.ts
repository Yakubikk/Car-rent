// Type definitions for our application

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  coverImage?: string;
  enrollmentCode: string;
  isActive: boolean;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
  }
}

export interface Enrollment {
  id: string;
  userId: string;
  classId: string;
  role: Role;
  user?: User;
  class?: Class;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  totalPoints: number;
  isPublished: boolean;
  classId: string;
  creatorId: string;
  creator?: User;
  class?: Class;
  attachments?: AssignmentAttachment[];
  submissions?: Submission[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentAttachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  assignmentId: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  content?: string;
  grade?: number;
  feedback?: string;
  isLate: boolean;
  assignmentId: string;
  studentId: string;
  student?: User;
  attachments?: SubmissionAttachment[];
  submittedAt: string;
  gradedAt?: string;
}

export interface SubmissionAttachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  submissionId: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title?: string;
  content: string;
  classId: string;
  authorId: string;
  author?: User;
  attachments?: PostAttachment[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
  }
}

export interface PostAttachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  postId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}
