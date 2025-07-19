export interface ContentBlock {
  type: 'h3' | 'p' | 'ol' | 'ul' | 'img';
  content: string | string[];
}

export interface InfoContent {
  slug: string;
  title: string;
  body: ContentBlock[];
}
