import { CHANGE_PALETTE } from "../models/change-palette";

/** Static version comparison of the same office/wing; not another experience. */
export function ArchitecturalFallback() {
  return <svg viewBox="0 0 700 520" width="100%" height="100%" aria-hidden="true" focusable="false">
    <g stroke="#69757c" strokeWidth="2" strokeLinejoin="round">
      <path d="M170 175l225-75 125 63v264l-224 75-126-64z" fill="#e7e1d5" />
      <path d="M395 100l125 63v264l-125-63z" fill="#d2ccc0" />
      {[0, 1, 2, 3, 4].map(level => <g key={level} transform={`translate(0 ${level * 51})`}>
        <path d="M185 185l197-65v32l-197 65z" fill="#7697a8" />
        <path d="M409 122l95 47v32l-95-47z" fill="#6c899a" />
        <path d="M170 219l225-75 125 63v10l-125-63-225 75z" fill="#c9c5bc" />
      </g>)}
      <path d="M170 175l225-75 125 63-225 75z" fill="#a7a7a0" />
      <path d="M410 318l144-48 82 42v153l-144 48-82-42z" fill="#e6e0d4" />
      {[0, 1, 2].map(level => <g key={level} transform={`translate(0 ${level * 49})`}>
        <path d="M421 330l123-41 78 37v34l-123 42-78-40z" fill="#f1ede6" />
        <path d="M410 360l144-48 82 42v9l-82-42-144 48z" fill="#c9c5bc" />
      </g>)}
      <path d="M410 318l144-48 82 42-144 49z" fill="#c4c1b9" />
      <path d="M288 447v-37l25-8v37z M494 511V361 M628 467V319" fill="#37434a" stroke="#37434a" strokeWidth="5" />
    </g>
    <g stroke="#8d201a" strokeWidth="2" fill={CHANGE_PALETTE.changed}>
      <path d="M286 240l55-18v34l-55 18z" />
      <path d="M277 461v-39l22-7v39z" />
      <path d="M486 384l38-13v36l-38 13z" />
    </g>
    <g stroke="#006487" strokeWidth="2" fill={CHANGE_PALETTE.added}>
      <path d="M436 169l28 14v32l-28-14z" />
      <path d="M539 338l31 15v32l-31-15z" />
    </g>
    <g stroke={CHANGE_PALETTE.removed} strokeWidth="3" strokeDasharray="7 5" fill="none">
      <path d="M196 431l65-22 38 17-65 22z M264 457v-35l22-7v35" />
      <path d="M292 240l38-13v25l-38 13z" />
    </g>
  </svg>;
}
