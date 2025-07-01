export interface Book {
  id: string | number;
  title: string;
  author: string;
  coverImageUrl: string;
  isFavorite?: boolean;
  categories: string[];
  description?: string;
}
