export interface Note {
  id: string;
  title: string;
  content: { value: number; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export type SortByOption = 'createdAt' | 'updatedAt' | 'title';

export interface Settings {
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  sortBy: SortByOption;
  maxImages: number;
  transitionSpeed: number; // in seconds
}