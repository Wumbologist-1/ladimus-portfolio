// Unedited standalone D009 Android emulator captures. All saved content is synthetic.
export const recallScreens = [
  {id: "home", file: "final-home.png", title: "A little easier to remember.", caption: "A redesigned home for your memories, with capture and local intelligence close at hand.", alt: "Recall v0.6 Home with Ladimus branding, local intelligence, Save a memory and a synthetic QA note."},
  {id: "save", file: "final-save-methods.png", title: "Keep a good find.", caption: "A thought, a useful link or a supported PNG screenshot. Choose how to keep it.", alt: "Recall v0.6 Save screen offering Write a memory, Save a link and Save a screenshot."},
  {id: "find", file: "final-find-library.png", title: "Find what matters.", caption: "A clearer library, readable memory cards and source-type filters. Use Ask for related ideas.", alt: "Recall v0.6 Find library with search, memory filters and a Luminance synthetic screenshot card."},
  {id: "ask", file: "final-follow-up.png", title: "Ask. Then open the evidence.", caption: "A real local-model follow-up returns saved source context, with its factual limits visible.", alt: "Recall v0.6 Ask follow-up showing a synthetic cafe recommendation, source context and Open original source."},
  {id: "original", file: "final-png-original.png", title: "Return to the original.", caption: "Open the screenshot you saved. OCR stays separate; the original is there to inspect.", alt: "Recall v0.6 original-memory view displaying a clearly labelled synthetic restaurant screenshot and OCR status."},
  {id: "security", file: "final-settings-security.png", title: "Your vault has a door.", caption: "Optional authentication-bound access protects the existing vault key on compatible secured devices.", alt: "Recall v0.6 Settings showing local vault information, device authentication and app-lock controls."},
  {id: "locked", file: "final-locked.png", title: "For your eyes.", caption: "An explicit locked state. App lock requires Android 11 or later and a secure device screen lock.", alt: "Recall v0.6 locked vault showing Unlock Recall and a warning that recovery or key reset is unavailable."},
] as const;

export const recallScreenPath = (file: string) => `/images/recall/luminance/${file}` as const;
