export type ModelModality =
  | "reasoning"
  | "multimodal"
  | "code"
  | "vision_video"
  | "audio";

export type ModelAccessType = "open_weights" | "commercial_api";

export interface AIModel {
  id: string;
  name: string;
  lab: string;
  modality: ModelModality;
  accessType: ModelAccessType;
  releaseDate: string;
  parameters: string;
  contextWindow: string;
  license: string;
  tagline: string;
  description: string;
  strengths: string[];
  architecture: string;
  officialUrl: string;
  huggingFaceUrl?: string;
  apiDocUrl?: string;
  featured?: boolean;
}

export interface ModelFilters {
  search: string;
  modality: ModelModality | "all";
  accessType: ModelAccessType | "all";
  lab: string | "all";
}
