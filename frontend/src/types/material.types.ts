export type MaterialVisibility =
  | "public"
  | "private"
  | "course_enrolled"
  | "faculty_only";
export type MaterialStatus = "draft" | "published" | "archived" | "in_review";

export interface CourseWorkData {
  academicDetails: {
    course: string;
    semester: string;
    year: string;
    subjectName: string;
    subjectCode: string;
  };
  analytics: {
    downloadedBy?: {
      userId: string;
      timeOfShare: string;
    }[];
    sharedBy?: {
      userId: string;
      timeOfShare: string;
    }[];
  };
  _id: string;
  title: string;
  uploadedBy: string;
  description: string;
  type: string;
  s3Key: string;
  s3URL: string;
  status: MaterialStatus;
  visibility: MaterialVisibility;
  downloadAllowed: boolean;
  sharingAllowed: boolean;
  mimetype: string;
  size: string;
  contentType: string;
  createdAt: string;
  updatedAt: string;
}

export interface Files {
  title: string;
  type: "folder" | "file";
  children: Files[];
  key?: string;
  description?: string;
}
