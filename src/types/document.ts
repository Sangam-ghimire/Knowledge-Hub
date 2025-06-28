// src/types/document.ts

export type Share = {
  userId: string;
  canEdit: boolean;
};

export type Author = {
  id: string;
  email: string;
};

export type Document = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  isPublic: boolean;
  author: Author;
  shares?: Share[];
};

export type FetchedDocumentData = {
  document: Document;
  currentUserId: string;
};
