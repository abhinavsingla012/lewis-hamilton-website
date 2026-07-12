export const ChapterMarker = ({ number, label, className = "", testId }) => <p
  className={`chapter-kicker ${className}`.trim()}
  aria-label={`Chapter ${number}: ${label}`}
  data-testid={testId || `chapter-${number}-marker`}
>
  <span>CH. {number}</span><i aria-hidden="true">/</i><strong>{label}</strong>
</p>;