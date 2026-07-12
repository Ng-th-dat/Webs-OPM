const TOKEN_SPLIT = /(\[[^\]]+\]|\d+(?:\.\d+)?%?)/g;
const NUMBER_PATTERN = /^\d+(?:\.\d+)?%?$/;

interface HighlightedTextProps {
  text: string;
  /** Same description from the previous tier — when given, numbers that increased are highlighted with a delta badge. */
  previousText?: string;
}

function isBracket(token: string): boolean {
  return token.startsWith('[') && token.endsWith(']');
}

function parseNumber(token: string): { value: number; isPercent: boolean } {
  return { value: parseFloat(token), isPercent: token.endsWith('%') };
}

export function HighlightedText({ text, previousText }: HighlightedTextProps) {
  const tokens = text.split(TOKEN_SPLIT).filter((part) => part !== '');
  const previousNumbers = previousText
    ? previousText.split(TOKEN_SPLIT).filter((part) => part !== '' && NUMBER_PATTERN.test(part))
    : [];

  let numberIndex = -1;

  return (
    <>
      {tokens.map((token, index) => {
        if (isBracket(token)) {
          return (
            <span key={index} className="font-semibold text-foreground">
              {token}
            </span>
          );
        }

        if (NUMBER_PATTERN.test(token)) {
          numberIndex += 1;
          const previous = previousNumbers[numberIndex];

          if (previous !== undefined) {
            const current = parseNumber(token);
            const before = parseNumber(previous);
            const delta = Math.round((current.value - before.value) * 100) / 100;

            if (delta !== 0) {
              const sign = delta > 0 ? '+' : '';
              return (
                <span key={index} className="font-bold text-rarity-r">
                  {token}
                  <span className="ml-1 inline-block rounded bg-rarity-r/15 px-1 py-0.5 align-middle text-[9px] font-bold leading-none text-rarity-r">
                    {sign}
                    {delta}
                    {current.isPercent ? '%' : ''}
                  </span>
                </span>
              );
            }
          }

          return (
            <span key={index} className="font-semibold text-accent-secondary">
              {token}
            </span>
          );
        }

        return <span key={index}>{token}</span>;
      })}
    </>
  );
}
