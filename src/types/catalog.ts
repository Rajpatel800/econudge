export interface CatalogItem {
  id: string;
  name: string;
  tag: string;
  tagVariant: "error" | "warning" | "neutral";
  footprint: string;
  footprintDetail: string;
  alternative: string;
  alternativeDetail: string;
  impact: string;
  imageUrl: string;
  imageAlt: string;
}
