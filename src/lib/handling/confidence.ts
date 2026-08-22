import type { Match } from "../hash/utils";

export const defaultConfidence = 75;

export function combineConfidences(
  confidences: (number | undefined | null)[],
): number {
  const valid = confidences
    .filter((c): c is number => typeof c === "number" && !isNaN(c) && c > 0)
    .map((c) => Math.min(100, Math.max(0, c)));

  if (valid.length === 0) return 0;
  if (valid.length === 1) return Math.round(valid[0]);

  const complementProduct = valid.reduce((acc, c) => acc * (1 - c / 100), 1);
  const combined = (1 - complementProduct) * 100;
  const maxVal = Math.max(...valid);

  return Math.min(100, Math.max(Math.round(maxVal), Math.round(combined)));
}

export function getDetectionConfidence(
  detection: Result | Match | null | undefined,
): number {
  if (!detection) return 0;

  if ("similarity" in detection) {
    return Math.min(100, Math.max(0, Math.round(detection.similarity * 100)));
  }

  if (typeof detection.confidence === "number") {
    return Math.min(100, Math.max(0, Math.round(detection.confidence)));
  }

  return 0;
}

export function calculateTaskConfidence(results?: TaskResults): number {
  if (!results) return 0;
  const confidences: number[] = [];

  if (results.ocr) confidences.push(getDetectionConfidence(results.ocr));
  if (results.text) confidences.push(getDetectionConfidence(results.text));
  if (results.image) confidences.push(getDetectionConfidence(results.image));

  return combineConfidences(confidences);
}

export function calculateOverallConfidence(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;

  const taskConfidences = tasks.map(
    (t) => t.confidence ?? calculateTaskConfidence(t.results),
  );
  return combineConfidences(taskConfidences);
}

export function evaluateMessage(
  tasks: Task[],
  threshold: number = defaultConfidence,
): OverallResult {
  for (const task of tasks) {
    if (task.confidence === undefined)
      task.confidence = calculateTaskConfidence(task.results);

    task.detected = task.confidence >= threshold;
  }

  const overallConfidence = calculateOverallConfidence(tasks);
  const detected = overallConfidence >= threshold;
  return {
    detected,
    overallConfidence,
    threshold,
    tasks,
  };
}
