const rules: DetectionRule[] = [
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
];

export function checkContent(content: string, source: ContentSource): Result {
  let score = 0;
  const matches: RegExp[] = [];

  for (const rule of rules) {
    if (!rule.appliesTo.includes(source)) continue;

    if (rule.pattern.test(content)) {
      score += rule.score;
      matches.push(rule.pattern);
    }
  }

  return {
    detected: score >= 50,
    source,
    confidence: Math.min(score, 100),
    matches,
    originalContent: content,
  };
}
