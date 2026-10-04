import type { Discipline } from "./model-types";
import { CHANGE_PALETTE } from "./change-palette";

/** Repo-native static room comparison; no remote assets or dependence on WebGL. */
export function ModelFallback({ discipline }: { discipline: Discipline }) {
  const electrical = discipline === "electrical";
  return <svg viewBox="0 0 640 420" width="100%" height="100%" aria-hidden="true" focusable="false">
    <g stroke="#a3adb2" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M110 265l210-95 205 95-210 112z" fill="#dbdedb" />
      <path d="M110 265V115l210-95v150z" fill="#e1e3df" />
      <path d="M320 20l205 95v150l-205-95z" fill="#c9cecc" />
      <path d="M150 248l42-19 36 16-42 21z" fill="#5f6d76" />
      <path d="M488 263V115l18 8v150z" fill="#a9b0b3" />
    </g>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={electrical ? 9 : 6}>
      <path d="M174 248V105 M174 177l162-73 119 56v140" stroke={CHANGE_PALETTE.removed} strokeDasharray="7 7" opacity=".4" />
      <path d="M197 244V95 M197 167l104-46 39 36 115 55v88" stroke={CHANGE_PALETTE.changed} />
      <path d="M340 157l-47 31v87" stroke={CHANGE_PALETTE.added} />
      {!electrical ? <path d="M148 242V99 M148 209l165-75 68 32v137" stroke={CHANGE_PALETTE.normal} /> : null}
    </g>
    <g fill="#87929b" stroke="#63717f" strokeWidth="1.5">
      {electrical ? <><path d="M172 260v-65l53-24v65z" /><path d="M120 111l200-91 205 95-14 7-191-86-188 85z" fill="#b7bec1" /></> :
        <><path d="M355 305v-44l48-22 30 14v44l-48 22z" /><path d="M432 300v-32l37 16v32z" /></>}
    </g>
  </svg>;
}
