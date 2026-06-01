export interface PageData {
  id: number;
  title: string;
  subtitle?: string;
  category?: string;
  description: string;
  bullets?: string[];
  imageText?: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  ctaText?: string;
}

export interface BookConfig {
  width: number;
  height: number;
  thickness: number;
  spineWidth: number;
  pagesCount: number;
}
