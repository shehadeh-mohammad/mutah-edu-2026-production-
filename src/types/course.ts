// src/types/course.ts

export interface Chapter {
  id: string;
  number: number;
  titleArabic: string;
  titleEnglish: string;
  youtubeUrl: string | null;
  localVideoPath: string | null;
  pdfDriveUrl: string | null;
  aiContextSummary: string;
  transcript: string;
}

export interface Course {
  id: string;
  nameArabic: string;
  nameEnglish: string;
  globalDriveFolderUrl: string | null;
  chapters: Chapter[];
  majorId?: string;
}

export interface CoursesDatabase {
  courses: Course[];
}
