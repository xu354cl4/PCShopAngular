// blocks = 我們要存什麼資料
// children = 我們要怎麼顯示資料


export interface FaqCategory {
  id: number;
  categoryName: string;
  parentCategoryId?: number;
  sortOrder?: number;
  children?: FaqCategory[]; // 前端自己組樹用
}


export interface FaqList {
  faQid: number;   // ⚠️ 一模一樣
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

export type FaqBlockType = 'TEXT' | 'IMAGE';

//後台編輯中的 FAQ model

export interface FaqBackBlock {
  blockType: FaqBlockType;
  content?: string;
  imageUrl?: string;
}

export interface FaqAdminModel {
  faqId?: number;
  categoryId: number;
  question: string;
  blocks: FaqBackBlock[];
}
//送 API 用的 DTO
export interface FaqBackBlockDto {
  blockType: 'TEXT' | 'IMAGE';
  content?: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface FaqUpsertDto {
  faqId?: number;
  categoryId: number;
  question: string;
  blocks: FaqBackBlockDto[];
}
