type ContentSource = "ocr" | "unknown";

type Result = {
  detected: boolean;
  match?: RegExp | string;
  confidence?: number;
  source: ContentSource;
  originalContent?: string;
};
