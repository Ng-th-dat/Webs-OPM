const TOKEN_SPLIT = /(\[[^\]]+\]|\d+(?:\.\d+)?%?)/g;
const NUMBER_PATTERN = /^\d+(?:\.\d+)?%?$/;
/** Authors use a run of dashes ("———") in admin to mark "what follows explains a bracketed mechanic" — render it on its own line instead of running into the paragraph. */
const SEPARATOR_SPLIT = /(—{2,}|–{2,}|-{3,})/g;
const SEPARATOR_PATTERN = /^(—{2,}|–{2,}|-{3,})$/;
/**
 * Marks a new clause that should break to a new line: a single dash — an em dash
 * ("Gây sát thương — Hồi phục HP"), an en dash (often produced by autocorrect when typing
 * "[Term] - Vietnamese name: ..."), or a plain hyphen with whitespace after it and either
 * whitespace or the very start of the text before it (". - Ignores 45%", or a leading
 * "- Attacks a single enemy...") but not a hyphen inside a word/number range (e.g.
 * "well-known", "45%-50%") — or a literal newline the author typed in the admin textarea
 * (browsers collapse raw "\n" by default, so this is what actually makes Enter-separated
 * clauses break on screen instead of running together).
 */
const LINE_BREAK_SPLIT = /((?:^|\s)-\s|—|–|\n+)/g;

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

        const lines = segment.split(LINE_BREAK_SPLIT).filter((part) => part !== '');
        const previousSegment = segmentIndex > 0 ? segments[segmentIndex - 1] : undefined;
        const followsSeparatorLine = previousSegment !== undefined && SEPARATOR_PATTERN.test(previousSegment);

        return lines.map((line, lineIndex) => {
          const trimmedLine = line.trim();

          if (trimmedLine === '—' || trimmedLine === '–' || trimmedLine === '-' || trimmedLine === '') {
            const isVeryStart = segmentIndex === 0 && lineIndex === 0;
            const isRightAfterSeparator = lineIndex === 0 && followsSeparatorLine;
            if (isVeryStart || isRightAfterSeparator) return null;
            return <span key={`${segmentIndex}-${lineIndex}`} aria-hidden="true" className="block h-2.5" />;
          }

          const tokens = line.trim().split(TOKEN_SPLIT).filter((part) => part !== '');

          return tokens.map((token, tokenIndex) => {
            const key = `${segmentIndex}-${lineIndex}-${tokenIndex}`;

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
        });
      })}
    </>
  );
}
