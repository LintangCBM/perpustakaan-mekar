export interface Book {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
  isFavorite?: boolean;
  categories: string[];
  description?: string;
}
