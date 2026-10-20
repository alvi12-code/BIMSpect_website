import type { StoryChangeKind, StoryElement, StoryEvent, StoryLocale } from "./story-data";

// Display copy for the design story. story-data.ts stays the single source of
// counts and geometry; this file only names things in each language.

type Chapter = { label: string; kicker: string; title: string; body: string; takeaway: string };

type StoryCopy = {
  chapters: readonly Chapter[];
  changeLabels: Record<StoryChangeKind, string>;
  tablist: string;
  projectSubtitle: string;
  sceneDescription: (release: string, changedNow: number, repeated: number) => string;
  legend: string;
  buildingContext: string;
  selectedElement: string;
  repeatedChange: string;
  changedInRelease: string;
  timeline: string;
  exploreReleases: string;
  trackedElements: string;
  releaseButton: (id: string, label: string, baseline: boolean, count: number) => string;
  evidence: string;
  baselineBody: string;
  releasesShown: string;
  disciplinesInSample: string;
  initialBaseline: string;
  ofTracked: string;
  eventsThrough: (release: string) => string;
  changedRepeatedly: string;
  noTrackedChanges: string;
  initialRoute: string;
  firstAppearance: string;
  reviewBrief: string;
  reviewTitle: string;
  reviewText: (count: number, release: string) => string;
  reviewInitial: string;
  sourceHistory: string;
  reviewScope: string;
  questionLabel: string;
  question: string;
  next: (label: string) => string;
  seeProduct: string;
  footnote: string;
  staticModel: string;
  continuousHistory: string;
  liveRegion: (release: string, changedNow: number, repeated: number, total: number) => string;
  inspectBody: (label: string) => string;
  initialState: string;
  chooseElement: string;
  orbitHint: string;
  tapHint: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;
  viewControls: string;
  recordedChanges: (count: number) => string;
  context: { overline: string; titleOne: string; titleTwo: string; changes: (count: number) => string; note: string };
  report: {
    badge: string; titleOne: string; titleTwo: string; releases: string; events: string; repeated: string;
    chart: (counts: string) => string; focus: string; focusTitle: string; focusBody: (count: number) => string; caption: string;
  };
};

const en: StoryCopy = {
  chapters: [
    { label: "Build the history", kicker: "A design, across time", title: "One building.\nA developing story.", body: "Each IFC release adds another moment to the design history. Explore six releases of this illustrative project.", takeaway: "Start with the sequence, then look for the pattern." },
    { label: "Follow the changes", kicker: "From revision to revision", title: "See what moved.\nAnd what changed within.", body: "Geometry, movement and information changes all matter. Purple highlights show the tracked elements changed in the selected release.", takeaway: "A property update can matter even when the shape stays the same." },
    { label: "Find the pattern", kicker: "Change, in perspective", title: "Where does change\nkeep returning?", body: "The east-wing interface changes across several releases. Amber highlights the elements with more than one change in this sample history.", takeaway: "Repeated change is a reason to investigate, not an engineering risk verdict." },
    { label: "Investigate an element", kicker: "The history behind a highlight", title: "Follow one element.\nKeep the context.", body: "Trace the supply route through its revisions. See its movement, section and information updates alongside the surrounding design.", takeaway: "The model locates the question. The history explains why it deserves attention." },
    { label: "Focus the review", kicker: "From model history to a discussion", title: "A clearer question.\nA better starting point.", body: "Bring the recurring route changes, related elements and source revisions into the next coordination review.", takeaway: "Evidence supports the team's decision. It does not make the decision for them." },
  ],
  changeLabels: { geometry: "Geometry", movement: "Movement", information: "Information" },
  tablist: "Explore BIMSpect's design story",
  projectSubtitle: "Illustrative design history",
  sceneDescription: (release, changedNow, repeated) => `Illustrative six-storey building with an open east wing. ${release}: ${changedNow} of 12 tracked elements changed in this release; ${repeated} have changed more than once in the history so far. Full evidence is available in the text panel and release controls.`,
  legend: "Model legend",
  buildingContext: "Building context",
  selectedElement: "Selected element",
  repeatedChange: "Repeated change",
  changedInRelease: "Changed in this release",
  timeline: "Choose an illustrative model release",
  exploreReleases: "Explore the releases",
  trackedElements: "12 tracked example elements",
  releaseButton: (id, label, baseline, count) => `${id}, ${label}, ${baseline ? "initial baseline" : `${count} tracked elements changed`}`,
  evidence: "Design story evidence",
  baselineBody: "R01 is the baseline. Move along the timeline to see whether change returns to the same elements.",
  releasesShown: "Releases shown",
  disciplinesInSample: "Disciplines in sample",
  initialBaseline: "Initial baseline",
  ofTracked: " / 12 tracked elements",
  eventsThrough: (release) => `Change events through ${release}`,
  changedRepeatedly: "Changed repeatedly",
  noTrackedChanges: "No tracked changes",
  initialRoute: "Initial route",
  firstAppearance: "First appearance in the example.",
  reviewBrief: "Illustrative review brief",
  reviewTitle: "East-wing service interface",
  reviewText: (count, release) => `The supply route has ${count} recorded ${count === 1 ? "change" : "changes"} through ${release}. Review its history with the adjacent partition and beam.`,
  reviewInitial: "This release establishes the initial route. Later releases add the history for review.",
  sourceHistory: "Source history",
  reviewScope: "Review scope",
  questionLabel: "Question for the team",
  question: "Is the current route coordinated with the latest room and structural layout?",
  next: (label) => `Next: ${label.toLowerCase()}`,
  seeProduct: "See the real product",
  footnote: "Illustrative model and sample history. Explore the releases and chapters.",
  staticModel: "Static model · All story controls available",
  continuousHistory: "Built around one continuous design history",
  liveRegion: (release, changedNow, repeated, total) => `${release}. ${changedNow} tracked elements changed in this release. ${repeated} of ${total} elements have repeated changes through this release.`,
  inspectBody: (label) => `Trace the ${label.toLowerCase()} through its revisions. See its movement, section and information updates alongside the surrounding design.`,
  initialState: "Initial state",
  chooseElement: "Element",
  orbitHint: "Drag to rotate · Click an element to inspect it",
  tapHint: "Tap an element to inspect it",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetView: "Reset view",
  viewControls: "Model view controls",
  recordedChanges: (count) => `${count} recorded ${count === 1 ? "change" : "changes"}`,
  context: {
    overline: "THE SAME STORY · A WIDER VIEW",
    titleOne: "Three disciplines.",
    titleTwo: "One review conversation.",
    changes: (count) => `${count} changes`,
    note: "Illustrative east-wing review scope from the model above. A shared location gives the team a starting point; the history alone does not establish cause or a clash."
  },
  report: {
    badge: "ILLUSTRATIVE SUMMARY",
    titleOne: "Design history.",
    titleTwo: "Ready for the conversation.",
    releases: "Model releases",
    events: "Tracked change events",
    repeated: "Repeatedly changed elements",
    chart: (counts) => `Tracked elements changed per release: ${counts}`,
    focus: "REVIEW FOCUS",
    focusTitle: "East-wing service interface.",
    focusBody: (count) => `The supply route changed in ${count} releases. Bring its history and the related partition and beam into the coordination review.`,
    caption: "Illustrative summary of the same 12-element history shown above. Not a customer report or an engineering assessment."
  }
};

const fi: StoryCopy = {
  chapters: [
    { label: "Kokoa historia", kicker: "Suunnitelma ajan kuluessa", title: "Yksi rakennus.\nKehittyvä tarina.", body: "Jokainen IFC-julkaisu lisää suunnitteluhistoriaan uuden hetken. Tutustu tämän havainnollistavan hankkeen kuuteen julkaisuun.", takeaway: "Aloita järjestyksestä ja etsi sitten kuvio." },
    { label: "Seuraa muutoksia", kicker: "Revisiosta toiseen", title: "Näe, mikä siirtyi.\nJa mikä muuttui sisällä.", body: "Geometria-, sijainti- ja tietomuutokset ovat kaikki tärkeitä. Violetit korostukset näyttävät valitussa julkaisussa muuttuneet seuratut elementit.", takeaway: "Ominaisuuden päivitys voi olla merkittävä, vaikka muoto pysyy samana." },
    { label: "Löydä kuvio", kicker: "Muutos mittasuhteissaan", title: "Mihin muutos\npalaa yhä uudelleen?", body: "Itäsiiven rajapinta muuttuu useissa julkaisuissa. Oranssi korostaa elementtejä, jotka ovat muuttuneet tässä esimerkkihistoriassa useammin kuin kerran.", takeaway: "Toistuva muutos on syy selvittää asiaa, ei teknisen riskin arvio." },
    { label: "Tutki elementtiä", kicker: "Korostuksen taustalla oleva historia", title: "Seuraa yhtä elementtiä.\nSäilytä konteksti.", body: "Jäljitä tuloilmareitti sen revisioiden läpi. Näe sen sijainti-, poikkileikkaus- ja tietomuutokset ympäröivän suunnitelman rinnalla.", takeaway: "Malli paikantaa kysymyksen. Historia kertoo, miksi se ansaitsee huomiota." },
    { label: "Kohdenna tarkastelu", kicker: "Mallihistoriasta keskusteluun", title: "Selkeämpi kysymys.\nParempi lähtökohta.", body: "Tuo toistuvat reittimuutokset, niihin liittyvät elementit ja lähderevisiot seuraavaan koordinointitarkasteluun.", takeaway: "Näyttö tukee tiimin päätöstä. Se ei tee päätöstä tiimin puolesta." },
  ],
  changeLabels: { geometry: "Geometria", movement: "Sijainti", information: "Tieto" },
  tablist: "Tutustu BIMSpectin suunnittelutarinaan",
  projectSubtitle: "Havainnollistava suunnitteluhistoria",
  sceneDescription: (release, changedNow, repeated) => `Havainnollistava kuusikerroksinen rakennus, jossa on avoin itäsiipi. ${release}: ${changedNow}/12 seuratusta elementistä muuttui tässä julkaisussa; ${repeated} on muuttunut historiassa tähän mennessä useammin kuin kerran. Kaikki tiedot löytyvät tekstipaneelista ja julkaisujen valitsimista.`,
  legend: "Mallin selite",
  buildingContext: "Rakennuskonteksti",
  selectedElement: "Valittu elementti",
  repeatedChange: "Toistuva muutos",
  changedInRelease: "Muuttunut tässä julkaisussa",
  timeline: "Valitse havainnollistava mallijulkaisu",
  exploreReleases: "Tutustu julkaisuihin",
  trackedElements: "12 seurattua esimerkkielementtiä",
  releaseButton: (id, label, baseline, count) => `${id}, ${label}, ${baseline ? "lähtötaso" : `${count} seurattua elementtiä muuttui`}`,
  evidence: "Suunnittelutarinan näyttö",
  baselineBody: "R01 on lähtötaso. Liiku aikajanalla nähdäksesi, palaako muutos samoihin elementteihin.",
  releasesShown: "Näytetyt julkaisut",
  disciplinesInSample: "Suunnittelualoja esimerkissä",
  initialBaseline: "Lähtötaso",
  ofTracked: " / 12 seurattua elementtiä",
  eventsThrough: (release) => `Muutostapahtumat julkaisuun ${release} asti`,
  changedRepeatedly: "Muuttunut toistuvasti",
  noTrackedChanges: "Ei seurattuja muutoksia",
  initialRoute: "Alkuperäinen reitti",
  firstAppearance: "Ensimmäinen esiintyminen esimerkissä.",
  reviewBrief: "Havainnollistava tarkastelumuistio",
  reviewTitle: "Itäsiiven talotekniikan rajapinta",
  reviewText: (count, release) => `Tuloilmareitillä on ${count} ${count === 1 ? "kirjattu muutos" : "kirjattua muutosta"} julkaisuun ${release} asti. Tarkastele sen historiaa viereisen väliseinän ja palkin kanssa.`,
  reviewInitial: "Tämä julkaisu määrittää alkuperäisen reitin. Myöhemmät julkaisut tuovat historian tarkasteltavaksi.",
  sourceHistory: "Lähdehistoria",
  reviewScope: "Tarkastelun laajuus",
  questionLabel: "Kysymys tiimille",
  question: "Onko nykyinen reitti yhteensovitettu viimeisimmän tila- ja rakennejärjestelyn kanssa?",
  next: (label) => `Seuraavaksi: ${label.toLowerCase()}`,
  seeProduct: "Katso todellinen tuote",
  footnote: "Havainnollistava malli ja esimerkkihistoria. Tutustu julkaisuihin ja lukuihin.",
  staticModel: "Staattinen malli · Kaikki tarinan ohjaimet käytettävissä",
  continuousHistory: "Rakennettu yhden yhtenäisen suunnitteluhistorian ympärille",
  liveRegion: (release, changedNow, repeated, total) => `${release}. ${changedNow} seurattua elementtiä muuttui tässä julkaisussa. ${repeated}/${total} elementistä on muuttunut toistuvasti tähän julkaisuun mennessä.`,
  inspectBody: (label) => `Jäljitä elementin ”${label}” historia revisio revisiolta. Näe sen sijainti-, poikkileikkaus- ja tietomuutokset ympäröivän suunnitelman rinnalla.`,
  initialState: "Alkutila",
  chooseElement: "Elementti",
  orbitHint: "Pyöritä vetämällä · Napsauta elementtiä tarkastellaksesi sitä",
  tapHint: "Napauta elementtiä tarkastellaksesi sitä",
  zoomIn: "Lähennä",
  zoomOut: "Loitonna",
  resetView: "Palauta näkymä",
  viewControls: "Mallinäkymän ohjaimet",
  recordedChanges: (count) => count === 1 ? "1 kirjattu muutos" : `${count} kirjattua muutosta`,
  context: {
    overline: "SAMA TARINA · LAAJEMPI NÄKYMÄ",
    titleOne: "Kolme suunnittelualaa.",
    titleTwo: "Yksi tarkastelukeskustelu.",
    changes: (count) => `${count} muutosta`,
    note: "Havainnollistava itäsiiven tarkastelualue yllä olevasta mallista. Yhteinen sijainti antaa tiimille lähtökohdan; historia ei yksinään osoita syytä tai törmäystä."
  },
  report: {
    badge: "HAVAINNOLLISTAVA YHTEENVETO",
    titleOne: "Suunnitteluhistoria.",
    titleTwo: "Valmiina keskusteluun.",
    releases: "Mallijulkaisut",
    events: "Seuratut muutostapahtumat",
    repeated: "Toistuvasti muuttuneet elementit",
    chart: (counts) => `Muuttuneet seuratut elementit julkaisuittain: ${counts}`,
    focus: "TARKASTELUN PAINOPISTE",
    focusTitle: "Itäsiiven talotekniikan rajapinta.",
    focusBody: (count) => `Tuloilmareitti muuttui ${count} julkaisussa. Tuo sen historia sekä siihen liittyvä väliseinä ja palkki koordinointitarkasteluun.`,
    caption: "Havainnollistava yhteenveto samasta yllä näytetystä 12 elementin historiasta. Ei asiakasraportti eikä tekninen arvio."
  }
};

export const storyCopy: Record<StoryLocale, StoryCopy> = { en, fi };

const finnishElementLabels: Record<string, string> = {
  "MEP-041": "Itäsiiven tuloilmareitti",
  "ARC-112": "Neuvotteluhuoneen väliseinä",
  "STR-028": "Itäsiiven siirtopalkki",
  "ARC-056": "Atriumin reunan väliseinä",
  "ARC-087": "Eteläjulkisivun paneeli",
  "ARC-091": "Yläosan julkisivupaneeli",
  "STR-014": "Länsisiiven reunapalkki",
  "STR-063": "Yläkerran palkki",
  "MEP-022": "Länsisiiven paluureitti",
  "MEP-063": "Pohjoissiiven talotekniikkareitti",
  "ARC-024": "Sisäänkäynnin seinäke",
  "STR-009": "Sisäänkäynnin reunapalkki"
};

const finnishZoneWords: Array<[string, string]> = [
  ["East wing", "Itäsiipi"],
  ["West wing", "Länsisiipi"],
  ["North wing", "Pohjoissiipi"],
  ["South elevation", "Eteläjulkisivu"],
  ["Entrance", "Sisäänkäynti"],
  ["Atrium", "Atrium"]
];

const finnishEventDetails: Record<string, string> = {
  "1:MEP-041": "Reitti siirtyi kohti julkisivua.",
  "1:ARC-112": "Neuvotteluhuoneen layout siirtyi itään.",
  "1:ARC-056": "Atriumin väliseinää jatkettiin.",
  "1:STR-014": "Reunapalkin korkeutta muutettiin.",
  "1:MEP-022": "Paluureitin siirtymää muutettiin.",
  "2:MEP-041": "Kanavan poikkileikkausta suurennettiin.",
  "2:ARC-112": "Väliseinän pituutta säädettiin.",
  "2:STR-028": "Siirtopalkin korkeutta muutettiin.",
  "2:ARC-087": "Julkisivupaneelin tyyppi päivitettiin.",
  "2:STR-063": "Rakenteellinen luokitus päivitettiin.",
  "3:MEP-041": "Reittiä laskettiin palkin kohdalla.",
  "3:ARC-112": "Huoneen rajaa säädettiin uudelleen.",
  "3:STR-028": "Palkin linjausta säädettiin.",
  "3:MEP-063": "Talotekniikkareitti siirtyi pohjoiseen.",
  "4:MEP-041": "Järjestelmätunnus päivitettiin.",
  "4:ARC-091": "Julkisivun materiaalitietoja tarkennettiin.",
  "5:MEP-041": "Reitin siirtymää muutettiin viimeisintä tarkastelua varten.",
  "5:STR-028": "Palkin spesifikaatio päivitettiin."
};

const finnishReleaseLabels = [
  "Alustava koordinointi",
  "Layoutin kehitys",
  "Suunnittelualojen koordinointi",
  "Talotekniikkareittien tarkastelu",
  "Koordinointipäivitys",
  "Viimeisin tarkasteluversio"
];

export function storyElementText(element: Pick<StoryElement, "id" | "label" | "zone">, locale: StoryLocale) {
  if (locale === "en") return { label: element.label, zone: element.zone };
  const zone = finnishZoneWords.reduce((text, [from, to]) => text.replace(from, to), element.zone);
  return { label: finnishElementLabels[element.id] ?? element.label, zone };
}

export function storyEventDetail(event: StoryEvent, locale: StoryLocale) {
  return locale === "fi" ? finnishEventDetails[`${event.revision}:${event.elementId}`] ?? event.detail : event.detail;
}

export function storyReleaseLabel(index: number, label: string, locale: StoryLocale) {
  return locale === "fi" ? finnishReleaseLabels[index] ?? label : label;
}
