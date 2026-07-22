type ContentSource = "ocr" | "text" | "unknown";

type Result = {
  detected: boolean;
  matches: RegExp[];
  confidence?: number;
  source: ContentSource;
  originalContent?: string;
};

type DetectionRule = {
  pattern: RegExp;
  score: number;
  appliesTo: ContentSource[];
};
