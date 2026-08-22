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

type Task = {
  type: "url" | "attachment" | "text";
  value: string;
  filePath?: string;
  results?: {
    ocr: Result;
    image: Awaited<Match | null>;
  };
};
