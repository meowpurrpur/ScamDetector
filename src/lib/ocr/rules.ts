const blockedPatterns = [
  "cryptocurrency casino",
  "claim your reward",
  "giving away $",
  "your withdrawal of",
  "free gift",
  "activate code",
  "special promo code",
  "withdraw the bonus",
  "select a withdraw method",
  "withdraw the funds",
  "enter the promo code",
  "your reward",
];
const regexList = blockedPatterns.map((p) => new RegExp(p, "i"));

export function checkText(text: string, source: ContentSource): Result {
  for (const expression of regexList) {
    const match = text.toLowerCase().match(expression);

    if (match)
      return {
        detected: true,
        source,
        confidence: 75,
        match: expression,
        originalContent: text,
      };
  }

  return {
    detected: false,
    source,
    confidence: 75,
    originalContent: text,
  };
}
