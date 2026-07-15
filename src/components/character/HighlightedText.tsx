const TOKEN_SPLIT = /(\[[^\]]+\]|\d+(?:\.\d+)?%?)/g;
const NUMBER_PATTERN = /^\d+(?:\.\d+)?%?$/;
/** Authors use a run of dashes ("———") in admin to mark "what follows explains a bracketed mechanic" — render it on its own line instead of running into the paragraph. */
const SEPARATOR_SPLIT = /(—{2,}|-{3,})/g;
const SEPARATOR_PATTERN = /^(—{2,}|-{3,})$/;

interface HighlightedTextProps {
  text: string;
  /** Same description from the previous tier — when given, numbers that changed are emphasized. */
  previousText?: string;
}

function isBracket(token: string): boolean {
  return token.startsWith('[') && token.endsWith(']');
}

export function HighlightedText({ text, previousText }: HighlightedTextProps) {
  const segments = text.split(SEPARATOR_SPLIT).filter((part) => part !== '');
  const previousNumbers = previousText
    ? previousText.split(TOKEN_SPLIT).filter((part) => part !== '' && NUMBER_PATTERN.test(part))
    : [];

  let numberIndex = -1;

  return (
    <>
      {segments.map((segment, segmentIndex) => {
        if (SEPARATOR_PATTERN.test(segment)) {
          return (
            <span key={segmentIndex} aria-hidden="true" className="my-1.5 block text-subtle/40">
              {segment}
            </span>
          );
        }

        const tokens = segment.trim().split(TOKEN_SPLIT).filter((part) => part !== '');

        return tokens.map((token, tokenIndex) => {
          const key = `${segmentIndex}-${tokenIndex}`;

          if (isBracket(token)) {
            return (
              <span key={key} className="font-semibold text-foreground">
                {token}
              </span>
            );
          }

          if (NUMBER_PATTERN.test(token)) {
            numberIndex += 1;
            const changed = previousNumbers[numberIndex] !== undefined && previousNumbers[numberIndex] !== token;

            return (
              <span
                key={key}
                className={
                  changed
                    ? 'font-black text-accent-secondary drop-shadow-[0_0_5px_rgba(255,176,32,0.7)]'
                    : 'font-semibold text-accent-secondary'
                }
              >
                {token}
              </span>
            );
          }

          return <span key={key}>{token}</span>;
        });
      })}
    </>
  );
}
