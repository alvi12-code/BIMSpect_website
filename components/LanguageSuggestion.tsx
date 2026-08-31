"use client";

import { useState } from "react";
import {
  dismissLanguageSuggestionForSession,
  preserveHash,
  setLocalePreference
} from "@/lib/locale";

type LanguageSuggestionProps = {
  destinationHref: string;
  title: string;
  selectFinnish: string;
  continueInEnglish: string;
  dismiss: string;
};

/**
 * A compact, opt-in prompt. Server-side logic decides whether it is rendered;
 * this component only persists a deliberate choice or session dismissal.
 */
export function LanguageSuggestion({
  destinationHref,
  title,
  selectFinnish,
  continueInEnglish,
  dismiss
}: LanguageSuggestionProps) {
  const [dismissedLocally, setDismissedLocally] = useState(false);

  const dismissForSession = () => {
    dismissLanguageSuggestionForSession();
    setDismissedLocally(true);
  };

  if (dismissedLocally) {
    return null;
  }

  return (
    <aside className="language-suggestion" aria-label={title}>
      <p>{title}</p>
      <div className="language-suggestion-actions">
        <a
          className="btn btn-primary"
          href={destinationHref}
          onClick={(event) => {
            setLocalePreference("fi");
            const hrefWithHash = preserveHash(destinationHref, window.location.hash);

            if (hrefWithHash !== destinationHref) {
              event.preventDefault();
              window.location.assign(hrefWithHash);
            }
          }}
        >
          {selectFinnish}
        </a>
        <button
          className="language-suggestion-continue"
          type="button"
          onClick={() => {
            setLocalePreference("en");
            dismissForSession();
          }}
        >
          {continueInEnglish}
        </button>
      </div>
      <button
        className="language-suggestion-dismiss"
        type="button"
        onClick={dismissForSession}
        aria-label={dismiss}
      >
        <span aria-hidden="true">×</span>
      </button>
    </aside>
  );
}
