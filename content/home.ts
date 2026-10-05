import type { Metadata } from "next";
import type { Locale } from "@/lib/locale";

export type { Locale } from "@/lib/locale";

type NavigationLink = {
  href: string;
  label: string;
  external?: boolean;
};

type CopyPair = {
  title: string;
  body: string;
};

type TeamMember = {
  initials: string;
  name: string;
  role: string;
  bio: string;
  portrait: TeamPortrait;
};

type TeamPortrait = {
  src: string;
  width: number;
  height: number;
  objectPosition: string;
};

const teamPortraits = {
  EL: {
    src: "/images/bimspect/Eelon.png",
    width: 1402,
    height: 1122,
    objectPosition: "52% 26%"
  },
  HA: {
    src: "/images/bimspect/Hisham.png",
    width: 1122,
    height: 1402,
    objectPosition: "50% 35%"
  },
  AL: {
    src: "/images/bimspect/Albin.png",
    width: 1122,
    height: 1402,
    objectPosition: "50% 34%"
  },
  OS: {
    src: "/images/bimspect/Olli.png",
    width: 1122,
    height: 1402,
    objectPosition: "50% 30%"
  }
} satisfies Record<string, TeamPortrait>;

export type ModelAttributionContent = {
  ariaLabel: string;
  description: string;
  sourceLabel: string;
  sourceLinkLabel: string;
};

export type HomeDemoVideoContent = {
  ariaLabel: string;
  unsupportedBefore: string;
  downloadLabel: string;
  unsupportedAfter: string;
  caption: string;
};

export type HeroExperienceContent = {
  normalState: string;
  changeCount: string;
  version: string;
  model: string;
  compare: string;
  result: string;
  scroll: string;
  illustration: string;
  sceneDescription: string;
  finalTitle: string;
  finalEmphasis: string;
  added: string;
  removed: string;
  changed: string;
  wall: string;
  moved: string;
  window: string;
  windowDetail: string;
};

export type ModelControlsContent = {
  changed: string; added: string; previous: string;
  modelState: string; changesState: string;
  caption: string; modelUnavailable: string;
};
export type DisciplineModelContent = {
  title: string; environment: string; description: string; sceneDescription: string;
  changes: Array<{ kind: "added" | "changed" | "removed"; detail: string }>;
};

export type HomeContent = {
  locale: Locale;
  metadata: {
    title: string;
    description: string;
    openGraphLocale: string;
    alternateOpenGraphLocale: string;
  };
  structuredData: Record<string, unknown>;
  navigation: NavigationLink[];
  footerLinks: NavigationLink[];
  headerCta: string;
  pricingHeading: string;
  languageSwitcher: {
    currentLabel: string;
    targetLabel: string;
    ariaLabel: string;
  };
  languageSuggestion: {
    title: string;
    selectFinnish: string;
    continueInEnglish: string;
    dismiss: string;
  };
  accessibility: {
    skipToMain: string;
    mainNavigation: string;
    mobileNavigation: string;
    menu: string;
    home: string;
    footer: string;
    footerNavigation: string;
  };
  launch: {
    ariaLabel: string;
    label: string;
    countdownAriaLabel: string;
    countdownLabels: {
      days: string;
      hours: string;
      minutes: string;
      seconds: string;
    };
  };
  hero: {
    eyebrow: string;
    title: string;
    titleEmphasis: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    capabilityOne: string;
    capabilityTwo: string;
    experience: HeroExperienceContent;
  };
  problem: {
    eyebrow: string;
    title: string;
    description: string;
    conclusion: string;
  };
  demo: {
    eyebrow: string;
    title: string;
    description: string;
    video: HomeDemoVideoContent;
  };
  change: {
    eyebrow: string;
    title: string;
    description: string;
    labels: string[];
    caption: string;
  };
  focus: {
    eyebrow: string;
    title: string;
    description: string;
    items: string[];
  };
  context: CopyPair & { eyebrow: string };
  disciplineModels: {
    controls: ModelControlsContent;
    plumbing: DisciplineModelContent; electrical: DisciplineModelContent;
  };
  workflow: {
    eyebrow: string;
    title: string;
    steps: Array<CopyPair & { number: string }>;
  };
  analytics: CopyPair & { eyebrow: string; caption: string };
  report: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    reportName: string;
    sampleLabel: string;
    versionLabel: string;
    totalChanges: string;
    added: string;
    deleted: string;
    modified: string;
    intensityByDiscipline: string;
    caption: string;
  };
  trust: {
    eyebrow: string;
    title: string;
    points: Array<{ label: string; body: string }>;
  };
  research: {
    eyebrow: string;
    title: string;
    facts: CopyPair[];
  };
  team: {
    eyebrow: string;
    title: string;
    members: TeamMember[];
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  images: {
    heroAlt: string;
    changeAlt: string;
    focusAlt: string;
    contextAlt: string;
    analyticsAlt: string;
  };
  attribution: ModelAttributionContent;
};

const organization = {
  "@type": "Organization",
  "@id": "https://bimspect.com/#organization",
  name: "BIMSpect",
  url: "https://bimspect.com",
  logo: "https://bimspect.com/icon.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "A Grid, Otakaari 5",
    postalCode: "02150",
    addressLocality: "Espoo",
    addressCountry: "FI"
  },
  sameAs: ["https://www.linkedin.com/company/bimspect"]
};

function createStructuredData(
  softwareDescription: string,
  videoName: string,
  videoDescription: string
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "SoftwareApplication",
        "@id": "https://bimspect.com/#software",
        name: "BIMSpect",
        url: "https://bimspect.com",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: softwareDescription,
        image: "https://bimspect.com/brand/bimspect-og-image.jpg",
        publisher: { "@id": "https://bimspect.com/#organization" }
      },
      {
        "@type": "VideoObject",
        "@id": "https://bimspect.com/#product-demo",
        name: videoName,
        description: videoDescription,
        thumbnailUrl:
          "https://bimspect.com/images/bimspect/bimspect-model-change-intensity.webp",
        contentUrl:
          "https://bimspect.com/videos/bimspect-design-change-demo-attributed.mp4",
        duration: "PT2M20S",
        publisher: { "@id": "https://bimspect.com/#organization" }
      }
    ]
  };
}

const navigation = [
  { href: "#workflow", label: "How it works" },
  { href: "#analytics", label: "Analytics" },
  { href: "#sample-report", label: "Sample report" },
  { href: "#pricing", label: "Pricing" },
  { href: "#security", label: "Data handling" },
  { href: "#about", label: "Team" }
];

const enDescription =
  "BIMSpect compares IFC model versions and makes design changes visible for BIM coordinators, design managers and construction teams.";
const enDemoDescription =
  "See how BIMSpect turns IFC model changes into visual information that can be explored, filtered and reviewed in the browser.";

const en: HomeContent = {
  locale: "en",
  metadata: {
    title: "BIMSpect | IFC Model Change Analysis for BIM Coordination",
    description: enDescription,
    openGraphLocale: "en_US",
    alternateOpenGraphLocale: "fi_FI"
  },
  structuredData: createStructuredData(
    enDescription,
    "BIMSpect product walkthrough",
    enDemoDescription
  ),
  navigation,
  footerLinks: [
    ...navigation,
    { href: "#research", label: "Research" },
    { href: "https://www.linkedin.com/company/bimspect", label: "LinkedIn", external: true }
  ],
  headerCta: "Talk to BIMSpect",
  pricingHeading: "Individual. Project. Portfolio.",
  languageSwitcher: {
    currentLabel: "EN",
    targetLabel: "FI",
    ariaLabel: "Switch language to Finnish"
  },
  languageSuggestion: {
    title: "Haluatko käyttää BIMSpect-sivustoa suomeksi?",
    selectFinnish: "Suomeksi",
    continueInEnglish: "Continue in English",
    dismiss: "Dismiss language suggestion"
  },
  accessibility: {
    skipToMain: "Skip to main content",
    mainNavigation: "Main navigation",
    mobileNavigation: "Mobile navigation",
    menu: "Menu",
    home: "BIMSpect home",
    footer: "Site footer",
    footerNavigation: "Footer navigation"
  },
  launch: {
    ariaLabel: "BIMSpect launch status",
    label: "Commercial launch",
    countdownAriaLabel: "Time remaining until launch",
    countdownLabels: { days: "days", hours: "hours", minutes: "minutes", seconds: "seconds" }
  },
  hero: {
    eyebrow: "IFC model change intelligence",
    title: "Know",
    titleEmphasis: "what changed.",
    description:
      "BIMSpect compares BIM model versions and makes every design change immediately understandable.",
    primaryCta: "See BIMSpect in action",
    secondaryCta: "Talk to BIMSpect",
    capabilityOne: "Browser-based",
    capabilityTwo: "No installation",
    experience: {
      normalState: "Architectural model", changeCount: "6 changes detected",
      version: "Version", model: "Version A", compare: "Version B", result: "The changes",
      scroll: "Scroll to compare", illustration: "Illustrative model · Sample changes",
      sceneDescription: "A five-storey office with a three-storey connected wing. Version A becomes Version B: a wall moves 300 mm, a window enlarges and an entrance door relocates. A partition and facade panel are added; an old entrance canopy is removed and ghosted. Six illustrative changes: 2 added, 3 changed, 1 removed. Not project data.",
      finalTitle: "Every change.", finalEmphasis: "Clearly visible.",
      added: "Added", removed: "Removed", changed: "Changed",
      wall: "Wall", moved: "Moved 300 mm",
      window: "Window", windowDetail: "Resized"
    }
  },
  problem: {
    eyebrow: "A new IFC version arrives",
    title: "What actually changed?",
    description:
      "Design teams receive revised IFC models continuously. Finding the meaningful difference means comparing complex versions and deciding what deserves attention before the next coordination conversation.",
    conclusion:
      "BIMSpect makes the change visible first, so the review can become focused and useful."
  },
  demo: {
    eyebrow: "Product demo",
    title: "See BIMSpect in action",
    description: enDemoDescription,
    video: {
      ariaLabel: "BIMSpect product walkthrough showing IFC model change analysis",
      unsupportedBefore: "Your browser does not support HTML video. You can",
      downloadLabel: "download the BIMSpect product walkthrough",
      unsupportedAfter: ".",
      caption: "2 min 20 sec product walkthrough"
    }
  },
  change: {
    eyebrow: "Change visibility",
    title: "See the difference.",
    description:
      "BIMSpect identifies added, deleted and modified IFC objects between versions. Colour-coded model views make concentrated change areas easier to find before the detailed review begins.",
    labels: ["Added", "Deleted", "Modified", "Change intensity"],
    caption: "Change intensity can guide where to start the review."
  },
  focus: {
    eyebrow: "Relevant elements",
    title: "Focus on what matters.",
    description:
      "Use model categories to focus the viewer on a meaningful set of elements. Isolate object types and levels so review time stays with the parts of the building that need it.",
    items: [
      "Walls, doors, slabs and other IFC object categories",
      "Levels and project-relevant groups",
      "A focused starting point for coordination review"
    ]
  },
  context: {
    eyebrow: "Model context",
    title: "Change, in context.",
    body:
      "Keep the surrounding building in view while you inspect a change. Its location and connections give the revision context."
  },
  disciplineModels: {
    controls: { changed: "Changed", added: "Added", previous: "Previous route", modelState: "Version A", changesState: "Version B",
      caption: "Illustrative comparison · 3 service changes", modelUnavailable: "Static comparison shown. The example changes are described above." },
    plumbing: {
      title: "A new route. Same context.", environment: "Plumbing / service room",
      description: "A riser moves 400 mm. The pipework takes a new route and a branch is added. See the revision in the room it serves.",
      sceneDescription: "A service-room cutaway with a floor slab and open shaft, two walls, columns, drainage and domestic-water risers, supported pipework, valves and a pump manifold. Three illustrative revisions: a riser moves 400 mm, a pipe reroutes 420 mm and a new branch connects to a valve. Old routes are ghosted; new routes are highlighted.",
      changes: [{ kind: "changed", detail: "Pipe rerouted · 420 mm" }, { kind: "added", detail: "New branch connection" }, { kind: "changed", detail: "Riser moved · 400 mm" }]
    },
    electrical: {
      title: "Follow the new route.", environment: "Electrical / ceiling & riser",
      description: "A new wall changes the cable-tray route. A branch is added and the riser moves 400 mm. The surrounding floor stays in view.",
      sceneDescription: "An office electrical zone with a floor slab, open service shaft, walls and columns, partial ceiling and suspended cable trays connected to a distribution board. Three illustrative revisions: a tray reroutes around a new partition, a branch connects to a junction box and the riser moves 400 mm. Old routes are ghosted alongside their highlighted replacements.",
      changes: [{ kind: "changed", detail: "Tray rerouted around new wall" }, { kind: "added", detail: "New tray branch" }, { kind: "changed", detail: "Riser moved · 400 mm" }]
    }
  },
  workflow: {
    eyebrow: "A clear review path",
    title: "Compare. Understand. Act.",
    steps: [
      { number: "01", title: "Compare", body: "Upload IFC model versions for a structured comparison." },
      { number: "02", title: "Understand", body: "See added, deleted and modified objects between versions." },
      { number: "03", title: "Focus", body: "Inspect the relevant objects alongside their model context." },
      { number: "04", title: "Communicate", body: "Use change information in coordination and reporting." }
    ]
  },
  analytics: {
    eyebrow: "Analytics and management view",
    title: "See the bigger picture.",
    body:
      "The same model-version information can be reviewed at a higher level: helping teams discuss design status, review priorities and the evidence behind the next coordination step.",
    caption: "Genuine BIMSpect analytics view."
  },
  report: {
    eyebrow: "Sample report",
    title: "Share the change.",
    description:
      "BIMSpect Change Reports turn a version comparison into a concise basis for design coordination meetings and management review.",
    cta: "Request sample report",
    reportName: "BIMSpect Change Report",
    sampleLabel: "Sample",
    versionLabel: "Project X · IFC v4 → v5",
    totalChanges: "Total changes",
    added: "Added",
    deleted: "Deleted",
    modified: "Modified",
    intensityByDiscipline: "Change intensity by discipline",
    caption: "An anonymised example of the existing report output."
  },
  trust: {
    eyebrow: "Data handling",
    title: "Your data. Handled with care.",
    points: [
      { label: "Open IFC formats", body: "IFC2x3 and IFC4 model files; no proprietary-format lock-in." },
      { label: "EU-based processing", body: "Project-file processing takes place within the EU." },
      { label: "NDA and DPA support", body: "Data-handling terms can be arranged before sensitive-file access." },
      { label: "Your data stays yours", body: "Customer project files are not used for AI training without written permission." }
    ]
  },
  research: {
    eyebrow: "Research origin",
    title: "Research, put to work.",
    facts: [
      {
        title: "Aalto University Research to Business",
        body: "BIMSpect originated from an Aalto University Research to Business project focused on making IFC model change analysis practically useful for construction project management."
      },
      {
        title: "Construction management research",
        body: "The product direction is grounded in construction project management, design management and BIM coordination research."
      },
      {
        title: "Technical development",
        body: "Current development focuses on IFC comparison, model version history, change classification, visual analytics and management-level reporting."
      }
    ]
  },
  team: {
    eyebrow: "The team",
    title: "Construction insight meets BIM technology.",
    members: [
      { initials: "EL", name: "Dr. Eelon Lappalainen", role: "Co-Founder", bio: "Construction and BIM researcher. Background in work study methodology and digital construction systems. Leads business development and product strategy.", portrait: teamPortraits.EL },
      { initials: "HA", name: "Dr. Hisham Abou-Ibrahim", role: "Co-Founder", bio: "BIM and construction informatics specialist. Research background in building information modelling and design management.", portrait: teamPortraits.HA },
      { initials: "AL", name: "Albin Lamichhane", role: "Co-Founder", bio: "Software engineer leading technical development. Responsible for BIMSpect's IFC processing engine and report generation pipeline.", portrait: teamPortraits.AL },
      { initials: "OS", name: "Prof. Olli Seppänen", role: "Scientific Advisor", bio: "Professor of construction management at Aalto University. Scientific advisor on construction project management and lean construction research.", portrait: teamPortraits.OS }
    ]
  },
  contact: {
    eyebrow: "Next model version",
    title: "Talk to BIMSpect",
    description: "Tell us about your project, access needs or questions.",
    primaryCta: "Request project analysis",
    secondaryCta: "Book a product walkthrough"
  },
  images: {
    heroAlt: "Colour-coded BIM model overview showing areas of different change intensity",
    changeAlt: "BIMSpect viewer showing a building model colour-coded by change intensity",
    focusAlt: "BIMSpect classifier panel for isolating model categories beside a colour-coded building model",
    contextAlt: "BIMSpect background-model view showing transparent surrounding building context",
    analyticsAlt: "BIMSpect Architectural Analytics dashboard showing design-status review information"
  },
  attribution: {
    ariaLabel: "Medical-Dental Clinic model attribution",
    description:
      "Based on BSI (2020), “Medical-Dental Test Files,” buildingSMART International, licensed under Creative Commons Attribution 4.0 (CC BY 4.0). The original IFC models have been modified to simulate design development, including changes to object presence, geometry, location and parameters.",
    sourceLabel: "Source:",
    sourceLinkLabel: "buildingSMART Community Sample Test Files"
  }
};

const fiDescription =
  "BIMSpect vertailee IFC-malliversioita ja tekee suunnittelumuutokset näkyviksi BIM-koordinaattoreille, suunnittelupäälliköille ja rakentamisen tiimeille.";
const fiDemoDescription =
  "Katso, miten BIMSpect muuttaa IFC-mallien muutokset selaimessa tutkittavaksi, suodatettavaksi ja tarkasteltavaksi visuaaliseksi tiedoksi.";

const fi: HomeContent = {
  locale: "fi",
  metadata: {
    title: "BIMSpect | BIM- ja IFC-mallimuutosten tunnistaminen",
    description: fiDescription,
    openGraphLocale: "fi_FI",
    alternateOpenGraphLocale: "en_US"
  },
  structuredData: createStructuredData(fiDescription, "BIMSpect-tuote-esittely", fiDemoDescription),
  navigation: [
    { href: "#workflow", label: "Näin se toimii" },
    { href: "#analytics", label: "Analytiikka" },
    { href: "#sample-report", label: "Esimerkkiraportti" },
    { href: "#security", label: "Tietojen käsittely" },
    { href: "#about", label: "Tiimi" }
  ],
  footerLinks: [
    { href: "#workflow", label: "Näin se toimii" },
    { href: "#analytics", label: "Analytiikka" },
    { href: "#sample-report", label: "Esimerkkiraportti" },
    { href: "#security", label: "Tietojen käsittely" },
    { href: "#about", label: "Tiimi" },
    { href: "#research", label: "Tutkimustausta" },
    { href: "https://www.linkedin.com/company/bimspect", label: "LinkedIn", external: true }
  ],
  headerCta: "Pyydä analyysi",
  pricingHeading: "Yksilö. Projekti. Portfolio.",
  languageSwitcher: {
    currentLabel: "FI",
    targetLabel: "EN",
    ariaLabel: "Vaihda kieli englanniksi"
  },
  languageSuggestion: {
    title: "Haluatko käyttää BIMSpect-sivustoa suomeksi?",
    selectFinnish: "Suomeksi",
    continueInEnglish: "Jatka englanniksi",
    dismiss: "Sulje kieliehdotus"
  },
  accessibility: {
    skipToMain: "Siirry pääsisältöön",
    mainNavigation: "Päänavigointi",
    mobileNavigation: "Mobiilinavigointi",
    menu: "Valikko",
    home: "BIMSpectin etusivu",
    footer: "Sivuston alatunniste",
    footerNavigation: "Alatunnisteen navigointi"
  },
  launch: {
    ariaLabel: "BIMSpectin julkaisutilanne",
    label: "Kaupallinen julkaisu",
    countdownAriaLabel: "Aikaa julkaisuun jäljellä",
    countdownLabels: { days: "päivää", hours: "tuntia", minutes: "minuuttia", seconds: "sekuntia" }
  },
  hero: {
    eyebrow: "IFC-mallimuutosten hallinta",
    title: "Näe muutos.",
    titleEmphasis: "Ymmärrä ero.",
    description:
      "BIMSpect vertailee IFC-malliversioita ja muuttaa suunnittelumuutokset selkeäksi visuaaliseksi tiedoksi BIM-koordinointia ja suunnittelun hallintaa varten.",
    primaryCta: "Katso, miten se toimii",
    secondaryCta: "Katso esimerkkiraportti",
    capabilityOne: "Selainpohjainen",
    capabilityTwo: "Ei asennusta",
    experience: {
      normalState: "Arkkitehtimalli", changeCount: "6 muutosta havaittu",
      version: "Versio", model: "Versio A", compare: "Versio B", result: "Muutokset",
      scroll: "Vieritä ja vertaile", illustration: "Havainnollistava malli · Esimerkkimuutokset",
      sceneDescription: "Viisikerroksinen toimistorakennus ja kolmikerroksinen siipi. Versio A vaihtuu versioon B: seinä siirtyy 300 mm, ikkuna suurenee ja sisäänkäynnin ovi siirtyy. Väliseinä ja julkisivupaneeli lisätään; vanha sisäänkäyntikatos poistetaan ja näytetään haamukuvana. Kuusi esimerkkimuutosta: 2 lisättyä, 3 muokattua, 1 poistettu. Ei projektidataa.",
      finalTitle: "Jokainen muutos.", finalEmphasis: "Selvästi näkyviin.",
      added: "Lisätty", removed: "Poistettu", changed: "Muokattu",
      wall: "Seinä", moved: "Siirretty 300 mm",
      window: "Ikkuna", windowDetail: "Kokoa muutettu"
    }
  },
  problem: {
    eyebrow: "Uusi IFC-versio saapuu",
    title: "Mikä oikeastaan muuttui?",
    description:
      "Suunnittelutiimit saavat jatkuvasti uusia IFC-malliversioita. Olennaisten muutosten löytäminen edellyttää monimutkaisten versioiden vertailua ja sen arviointia, mikä vaatii huomiota ennen seuraavaa koordinointikeskustelua.",
    conclusion:
      "BIMSpect tekee muutokset näkyviksi ensin, jotta tarkastelu voidaan kohdistaa olennaiseen."
  },
  demo: {
    eyebrow: "Tuote-esittely",
    title: "Katso BIMSpect käytännössä",
    description: fiDemoDescription,
    video: {
      ariaLabel: "BIMSpect-tuote-esittely IFC-mallimuutosten analysoinnista",
      unsupportedBefore: "Selaimesi ei tue HTML-videota. Voit",
      downloadLabel: "ladata BIMSpect-tuote-esittelyn",
      unsupportedAfter: ".",
      caption: "2 min 20 s tuote-esittely"
    }
  },
  change: {
    eyebrow: "Muutosten näkyvyys",
    title: "Näe mallien erot.",
    description:
      "BIMSpect tunnistaa malliversioiden välillä lisätyt, poistetut ja muokatut IFC-objektit. Värikoodatut mallinäkymät helpottavat muutosten keskittymien löytämistä ennen yksityiskohtaista tarkastelua.",
    labels: ["Lisätty", "Poistettu", "Muokattu", "Muutoksen voimakkuus"],
    caption: "Muutoksen voimakkuus auttaa valitsemaan tarkastelun aloituskohdan."
  },
  focus: {
    eyebrow: "Olennaiset kohteet",
    title: "Keskity olennaiseen.",
    description:
      "Rajaa näkymä malliluokkien avulla merkitykselliseen kohdejoukkoon. Erottele objektityypit ja tasot, jotta tarkasteluaika kohdistuu rakennuksen osiin, jotka sitä tarvitsevat.",
    items: [
      "Seinät, ovet, laatat ja muut IFC-objektiluokat",
      "Tasot ja projektin kannalta olennaiset ryhmät",
      "Kohdennettu lähtökohta koordinointitarkastelulle"
    ]
  },
  context: {
    eyebrow: "Mallikonteksti",
    title: "Muutos osana kokonaisuutta.",
    body:
      "Pidä ympäröivät rakennusosat näkyvissä, kun tarkastelet muutosta. Sijainti ja yhteydet auttavat ymmärtämään uuden version kokonaisuutta."
  },
  disciplineModels: {
    controls: { changed: "Muokattu", added: "Lisätty", previous: "Vanha reitti", modelState: "Versio A", changesState: "Versio B",
      caption: "Havainnollistava vertailu · 3 taloteknistä muutosta", modelUnavailable: "Näytetään staattinen vertailu. Esimerkkimuutokset on kuvattu yllä." },
    plumbing: {
      title: "Uusi reitti. Sama kokonaisuus.", environment: "Putkisto / tekninen tila",
      description: "Nousu siirtyy 400 mm. Putkireitti muuttuu ja uusi haara lisätään. Näe muutos siinä tilassa, jota putkisto palvelee.",
      sceneDescription: "Teknisen tilan leikkaus: lattialaatta ja avoin kuilu, kaksi seinää, pilarit, viemäri- ja käyttövesinousut, kannatetut putket, venttiilit sekä pumppu ja jakotukki. Kolme esimerkkimuutosta: nousu siirtyy 400 mm, putkireitti muuttuu 420 mm ja uusi haara liittyy venttiiliin. Vanhat reitit näkyvät haamukuvina ja uudet korostettuina.",
      changes: [{ kind: "changed", detail: "Putkireitti muutettu · 420 mm" }, { kind: "added", detail: "Uusi haaraliitäntä" }, { kind: "changed", detail: "Nousu siirretty · 400 mm" }]
    },
    electrical: {
      title: "Seuraa uutta reittiä.", environment: "Sähkö / alakatto ja nousu",
      description: "Uusi seinä muuttaa kaapelihyllyn reittiä. Uusi haara lisätään ja nousu siirtyy 400 mm. Ympäröivä kerros pysyy näkyvissä.",
      sceneDescription: "Toimistokerroksen sähköalue: lattialaatta, avoin kuilu, seinät ja pilarit, osittainen alakatto sekä jakokeskukseen liittyvät kannatetut kaapelihyllyt. Kolme esimerkkimuutosta: hylly kiertää uuden väliseinän, uusi haara liittyy jakorasiaan ja nousu siirtyy 400 mm. Vanhat reitit näkyvät haamukuvina korostettujen uusien reittien rinnalla.",
      changes: [{ kind: "changed", detail: "Hylly kiertää uuden seinän" }, { kind: "added", detail: "Uusi kaapelihyllyhaara" }, { kind: "changed", detail: "Nousu siirretty · 400 mm" }]
    }
  },
  workflow: {
    eyebrow: "Selkeä tarkastuspolku",
    title: "Vertaile. Ymmärrä. Toimi.",
    steps: [
      { number: "01", title: "Vertaile", body: "Lataa IFC-malliversiot jäsenneltyä vertailua varten." },
      { number: "02", title: "Ymmärrä", body: "Näe lisätyt, poistetut ja muokatut objektit versioiden välillä." },
      { number: "03", title: "Kohdenna", body: "Tarkastele olennaisia objekteja niiden mallikontekstissa." },
      { number: "04", title: "Viestitä", body: "Hyödynnä muutostietoa koordinoinnissa ja raportoinnissa." }
    ]
  },
  analytics: {
    eyebrow: "Analytiikan ja johdon näkymä",
    title: "Näe kokonaiskuva.",
    body:
      "Samaa malliversiotietoa voidaan tarkastella myös ylemmällä tasolla: se auttaa tiimejä keskustelemaan suunnittelun tilasta, tarkastelun painopisteistä ja seuraavan koordinointivaiheen taustalla olevasta tiedosta.",
    caption: "Aito BIMSpect-analytiikkanäkymä."
  },
  report: {
    eyebrow: "Esimerkkiraportti",
    title: "Jaa muutostieto.",
    description:
      "BIMSpect-muutosraportit tekevät malliversioiden vertailusta tiiviin pohjan suunnittelun koordinointipalavereihin ja johdon tarkasteluun.",
    cta: "Pyydä esimerkkiraportti",
    reportName: "BIMSpect-muutosraportti",
    sampleLabel: "Esimerkki",
    versionLabel: "Projekti X · IFC v4 → v5",
    totalChanges: "Muutoksia yhteensä",
    added: "Lisätty",
    deleted: "Poistettu",
    modified: "Muokattu",
    intensityByDiscipline: "Muutoksen voimakkuus suunnittelualueittain",
    caption: "Anonymisoitu esimerkki nykyisestä raporttituotoksesta."
  },
  trust: {
    eyebrow: "Tietojen käsittely",
    title: "Projektitiedot hyvissä käsissä.",
    points: [
      { label: "Avoimet IFC-formaatit", body: "IFC2x3- ja IFC4-mallitiedostot; ei riippuvuutta suljetuista tiedostomuodoista." },
      { label: "EU-pohjainen käsittely", body: "Projektitiedostot käsitellään EU:n alueella." },
      { label: "NDA- ja DPA-tuki", body: "Tietojenkäsittelyehdoista voidaan sopia ennen arkaluonteisten tiedostojen käyttöä." },
      { label: "Tietosi säilyvät omina tietoina", body: "Asiakkaiden projektitiedostoja ei käytetä tekoälyn kouluttamiseen ilman kirjallista lupaa." }
    ]
  },
  research: {
    eyebrow: "Tutkimustausta",
    title: "Rakennusalan tutkimuksesta projektityöhön.",
    facts: [
      {
        title: "Aalto University Research to Business",
        body: "BIMSpect sai alkunsa Aalto Universityn Research to Business -projektissa, jonka tavoitteena oli tehdä IFC-mallimuutosten analyysistä käytännössä hyödyllistä rakentamisen projektinhallinnassa."
      },
      {
        title: "Rakentamisen johtamisen tutkimus",
        body: "Tuotteen suunta perustuu rakentamisen projektinhallinnan, suunnittelun hallinnan ja BIM-koordinoinnin tutkimukseen."
      },
      {
        title: "Tekninen kehitys",
        body: "Nykyinen kehitys keskittyy IFC-vertailuun, malliversiohistoriaan, muutosten luokitteluun, visuaaliseen analytiikkaan ja johdon raportointiin."
      }
    ]
  },
  team: {
    eyebrow: "Tiimi",
    title: "Rakentamisen ymmärrys kohtaa BIM-teknologian.",
    members: [
      { initials: "EL", name: "Dr. Eelon Lappalainen", role: "Toinen perustaja", bio: "Rakentamisen ja BIMin tutkija. Taustana työn tutkimuksen menetelmät ja digitaalisen rakentamisen järjestelmät. Vastaa liiketoiminnan kehityksestä ja tuotestrategiasta.", portrait: teamPortraits.EL },
      { initials: "HA", name: "Dr. Hisham Abou-Ibrahim", role: "Toinen perustaja", bio: "BIMin ja rakennusinformatiikan asiantuntija. Vastaa tuotekehityksestä ja suunnittelusta. Tutkimustausta rakennusten tietomallinnuksessa ja suunnittelun hallinnassa.", portrait: teamPortraits.HA },
      { initials: "AL", name: "Albin Lamichhane", role: "Toinen perustaja", bio: "Ohjelmistoinsinööri, joka johtaa teknistä kehitystä. Vastaa BIMSpectin IFC-käsittelymoottorista ja raporttien tuotantoputkesta.", portrait: teamPortraits.AL },
      { initials: "OS", name: "Prof. Olli Seppänen", role: "Tieteellinen neuvonantaja", bio: "Aalto Universityn rakentamisen johtamisen professori. Tieteellinen neuvonantaja rakentamisen projektinhallinnan ja lean-rakentamisen tutkimuksessa.", portrait: teamPortraits.OS }
    ]
  },
  contact: {
    eyebrow: "Seuraava malliversio",
    title: "Puhutaan mallimuutoksista.",
    description:
      "Kerro IFC-mallien vertailutarpeestasi, niin näytämme, miten BIMSpect tukee tarkastelua.",
    primaryCta: "Pyydä projektianalyysi",
    secondaryCta: "Varaa tuote-esittely"
  },
  images: {
    heroAlt: "Värikoodattu BIM-mallin yleisnäkymä, joka näyttää eri voimakkuuksilla muuttuneet alueet",
    changeAlt: "BIMSpect-katselin, jossa rakennusmalli on värikoodattu muutoksen voimakkuuden mukaan",
    focusAlt: "BIMSpectin luokittelupaneeli, jolla malliluokkia rajataan värikoodatun rakennusmallin vieressä",
    contextAlt: "BIMSpectin taustamallinäkymä, jossa ympäröivä rakennuskonteksti näkyy läpinäkyvänä",
    analyticsAlt: "BIMSpectin arkkitehtisuunnittelun analytiikkanäkymä, jossa esitetään suunnittelun tilan tarkastelutietoa"
  },
  attribution: {
    ariaLabel: "Medical-Dental Clinic -mallin lähdemerkintä",
    description:
      "Perustuu BSI:n (2020) “Medical-Dental Test Files” -aineistoon, jonka buildingSMART International on lisensoinut Creative Commons Attribution 4.0 (CC BY 4.0) -lisenssillä. Alkuperäisiä IFC-malleja on muokattu suunnittelun kehityksen havainnollistamiseksi, mukaan lukien muutokset objektien olemassaoloon, geometriaan, sijaintiin ja parametreihin.",
    sourceLabel: "Lähde:",
    sourceLinkLabel: "buildingSMART Community Sample Test Files"
  }
};

export const homeContent: Record<Locale, HomeContent> = { en, fi };

export function getHomeMetadata(locale: Locale): Metadata {
  const content = homeContent[locale];
  const path = locale === "fi" ? "/fi" : "/";

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: {
      canonical: path,
      languages: {
        en: "https://bimspect.com/",
        fi: "https://bimspect.com/fi",
        "x-default": "https://bimspect.com/"
      }
    },
    openGraph: {
      title: content.metadata.title,
      description: content.metadata.description,
      url: path,
      siteName: "BIMSpect",
      type: "website",
      locale: content.metadata.openGraphLocale,
      alternateLocale: content.metadata.alternateOpenGraphLocale,
      images: [
        {
          url: "/brand/bimspect-og-image.jpg",
          width: 1200,
          height: 630,
          alt: content.images.heroAlt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: content.metadata.title,
      description: content.metadata.description,
      images: ["/brand/bimspect-og-image.jpg"]
    }
  };
}
