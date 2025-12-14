export interface FaqCategory {
  id: number;
  categoryName: string;
  parentCategoryId?: number;
  sortOrder?: number;
  children?: FaqCategory[]; // 前端自己組樹用
}

export interface FaqList {
  FaqId: number;
  question: string;
}

export interface FaqBlock {
  blockType: string;
  content: string;
  imageUrl: string;
  sortOrder: number;
}

export interface FaqDetail {
  faqid: number;
  question: string;
  answer: string;
  blocks: FaqBlock[];
}
