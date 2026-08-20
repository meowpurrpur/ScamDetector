const rules: DetectionClass[] = [
  {
    name: "mrbeast",
    detectionVectors: [
      {
        pattern: /\bcryptocurrency casino\b/i,
        score: 40,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bclaim your reward\b/i,
        score: 40,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\breward received\b/i,
        score: 50,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bgiving away \$?/i,
        score: 40,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\byour withdrawal of\b/i,
        score: 75,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\breceive your .{0,8} bonus\b/i,
        score: 75,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bfree gift\b/i,
        score: 75,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bactivate code\b/i,
        score: 40,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bspecial promo code\b/i,
        score: 75,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bwithdraw the bonus\b/i,
        score: 75,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bselect a withdraw method\b/i,
        score: 40,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bwithdraw the funds\b/i,
        score: 75,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\benter the promo code\b/i,
        score: 75,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\byour reward\b/i,
        score: 40,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bwill be transferred\b/i,
        score: 30,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bselect crypto to withdraw\b/i,
        score: 30,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bredeem your promo codeb/i,
        score: 40,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bapply your code\b/i,
        score: 20,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bunlock a special reward\b/i,
        score: 35,
        appliesTo: ["text", "ocr"],
      },
      {
        pattern: /\bbonus event\b/i,
        score: 75,
        appliesTo: ["text", "ocr"],
      },
    ],
  },
];

export function checkContent(content: string, source: ContentSource): Result {
  let score = 0;
  const matches: DetectionRule[] = [];

  for (const detectionClass of rules) {
    for (const rule of detectionClass.detectionVectors) {
      if (!rule.appliesTo.includes(source)) continue;

      rule.pattern.lastIndex = 0;

      if (!rule.pattern.test(content)) continue;

      score += rule.score;
      matches.push(rule);
    }
  }

  return {
    detected: score >= 50,
    rules: matches,
    confidence: Math.min(score, 100),
    source,
    originalContent: content,
  };
}
