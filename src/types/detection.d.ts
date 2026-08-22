type ContentSource = "ocr" | "text" | "hash" | "unknown";

type Result = {
  detected: boolean;
  rules?: DetectionRule[];
  className?: string;
  confidence: number;
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

type TaskResults = {
  ocr?: Result;
  text?: Result;
  image?: import("../lib/hash/utils").Match | null;
};

type Task = {
  type: "url" | "attachment" | "text";
  value: string;
  filePath?: string;
  confidence?: number;
  detected?: boolean;
  results?: TaskResults;
};

type OverallResult = {
  detected: boolean;
  overallConfidence: number;
  threshold: number;
  tasks: Task[];
};
