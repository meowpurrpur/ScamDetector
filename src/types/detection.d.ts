type ContentSource = "ocr" | "text" | "hash" | "unknown";

type Result = {
  detected: boolean;
  rules?: DetectionRule[];
  className?: string;
  confidence?: number;
  source: ContentSource;
  originalContent?: string;
};

type DetectionClass = {
  name: string;
  detectionVectors: DetectionRule[];
};

type DetectionRule = {
  pattern: RegExp;
  score: number;
  appliesTo: ContentSource[];
};
