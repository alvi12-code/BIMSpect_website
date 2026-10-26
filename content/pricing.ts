// Finnish display copy for the shared PricingSection. English stays in
// components/data.ts. This is a translation of that source only: amounts,
// billing units, entitlements and conditions must stay identical to it.

type PlanCopy = {
  description: string;
  priceSuffix?: string;
  price?: string;
  featuredLabel?: string;
  features: Array<{ label: string; note?: string }>;
};

export type PricingTranslation = {
  eyebrow: string;
  copy: string;
  footnote: string;
  comparisonInterest: string;
  actionLabels: Record<string, string>;
  plans: Record<"Individual" | "Project" | "Enterprise", PlanCopy>;
  comparison: Array<{ title: string; items: string[]; cta?: string }>;
  adoption: { eyebrow: string; title: string; body: string };
  adoptionSteps: Array<{ title: string; body: string }>;
};

export const finnishPricing: PricingTranslation = {
  eyebrow: "Hinnoittelu ja käyttöoikeudet",
  copy: "Valitse käyttömalli, joka vastaa tapaa, jolla organisaatiosi työskentelee IFC-malliversioiden kanssa.",
  footnote:
    "Hinnat koskevat yritysasiakkaita, eivätkä ne sisällä arvonlisäveroa tai muita mahdollisia veroja. Mahdolliset verot määräytyvät asiakkaan sijainnin ja verotuksellisen aseman perusteella. Project- ja Enterprise-käyttö edellyttävät sovittua laajuutta, tietojenkäsittelyehtoja ja teknistä toteutettavuutta. Asiakaskohtaiset väliohjelmistot, laajat tietojen siirrot ja tavanomaisesta poikkeava räätälöity kehitys voidaan hinnoitella erikseen.",
  comparisonInterest: "projektianalyysistä",
  actionLabels: {
    "Buy now": "Osta nyt",
    "Contact us": "Ota yhteyttä",
    "Discuss project access": "Keskustele projektikäytöstä",
    "Request a quote": "Pyydä tarjous",
    "Contact sales": "Ota yhteyttä myyntiin",
    "Get started": "Aloita",
    "Purchase Individual": "Osta Individual"
  },
  plans: {
    Individual: {
      description:
        "Yksittäiselle BIM-koordinaattorille, konsultille tai suunnittelupäällikölle, joka työskentelee useissa hankkeissa.",
      priceSuffix: "/kk",
      features: [
        { label: "Yksi käyttäjä" },
        { label: "Enintään 5 aktiivista projektia" },
        { label: "IFC-tiedostojen manuaalinen lataus" },
        { label: "IFC-versiovertailut" },
        { label: "Prosessianalytiikka" },
        { label: "Vietävät raportit" }
      ]
    },
    Project: {
      price: "Tarjouksen mukaan",
      description:
        "Yhdelle aktiiviselle projektille ja tiimille, joka vastaa BIM- ja suunnittelukoordinoinnista.",
      featuredLabel: "Paras projektitiimeille",
      features: [
        { label: "Yksi aktiivinen projekti" },
        { label: "Enintään 10 käyttäjää" },
        { label: "Jaetut projektinäkymät" },
        { label: "IFC-malliversioiden automaattinen seuranta" },
        {
          label: "Yksi vakiomuotoinen CDE-integraatio sisältyy",
          note: "Dokumentoidulle rajapinnalle ja vakiomuotoiselle tunnistautumiselle."
        },
        {
          label: "Lisäkäyttäjiä saatavilla",
          note: "Suuremmille projektitiimeille etuhintaan."
        }
      ]
    },
    Enterprise: {
      price: "Räätälöity hinnoittelu",
      description:
        "Organisaatioille, jotka hallinnoivat useita projekteja, ohjelmia tai BIM-portfolioita.",
      features: [
        { label: "Useita aktiivisia projekteja" },
        { label: "Portfoliotason näkymät" },
        { label: "Organisaation laajuinen analytiikka" },
        { label: "Jatkuva mallien seuranta" },
        { label: "Räätälöidyt CDE- ja dataintegraatiot" },
        { label: "Räätälöity käyttöönotto ja tuki" },
        { label: "Joustava portfolion konfigurointi" }
      ]
    }
  },
  comparison: [
    {
      title: "Manuaalinen IFC-muutosten tarkastelu",
      items: [
        "Yksittäiset vertailut eivät näytä prosessia",
        "Suunnittelumuutosten kehitystä on vaikea seurata ajan mittaan",
        "Lämpökartat ja yhteenvedot on koottava käsin uudelleen",
        "Muutosten tulkinta riippuu yksittäisistä asiantuntijoista",
        "Koordinointipalaverit nojaavat hajanaiseen näyttöön",
        "Malliversioiden välillä ei ole yhtenäistä projektihistoriaa"
      ]
    },
    {
      title: "BIMSpect",
      items: [
        "IFC-versiohistoria",
        "Muutosten lämpökartat ajan mittaan",
        "Suodata muutokset suunnittelualan, vyöhykkeen tai objektityypin mukaan",
        "Muutosten keskittymien kartoitus",
        "Selkokieliset muutoshavainnot",
        "Jaetut koordinointiraportit"
      ],
      cta: "Ota yhteyttä BIMSpectiin"
    }
  ],
  adoption: {
    eyebrow: "Käyttöönoton polku",
    title: "Aloita yksin. Laajenna, kun projekti tarvitsee yhteisen näkymän.",
    body: "BIMSpectin käyttö voi alkaa yksittäisestä BIM-koordinaattorista ja laajentua jaettuun projekti- tai portfoliotason työnkulkuun, kun hyöty on osoitettu."
  },
  adoptionSteps: [
    { title: "Tutustu", body: "Analysoi IFC-versiohistoriaa yksittäisenä asiantuntijakäyttäjänä." },
    { title: "Jaa", body: "Ota BIMSpect Project käyttöön yhteistä projektinäkymää varten." },
    { title: "Vakioi", body: "Hyödynnä toistuvia muutostarkasteluja ja raporttipohjia." },
    { title: "Skaalaa", body: "Luo portfolionäkyvyys useiden projektien yli." }
  ]
};

// "€1,490" → "1 490 €" (non-breaking space), the Finnish convention.
export function finnishPrice(price: string) {
  const match = /^€([\d,]+)$/.exec(price.trim());
  return match ? `${match[1].replace(/,/g, " ")} €` : price;
}
