// All citations shown on the site, from research/notation.md, research/dossier.md and CONTENT.md §12.
// Titles are quoted exactly as published.
export type Ref = { text: string; title?: string; rest?: string; link: string; label: string };
export type RefGroup = { id: string; title: string; refs: Ref[] };

export const REFERENCES: RefGroup[] = [
  { id: "papers", title: "Psychology papers and books", refs: [
    { text: "Brown, A., & Maydeu-Olivares, A. (2011).", title: "Item response modeling of forced-choice questionnaires.", rest: "Educational and Psychological Measurement, 71(3), 460–502.", link: "https://kar.kent.ac.uk/id/document/11772", label: "Kent repository" },
    { text: "Colledani, D., Anselmi, P., & Robusto, E. (2018).", title: "Using item response theory for the development of a new short form of the EPQ-R.", rest: "Frontiers in Psychology, 9, 1834.", link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6190847/", label: "PMC" },
    { text: "Gosling, S. D., Rentfrow, P. J., & Swann, W. B. (2003).", title: "A very brief measure of the Big-Five personality domains.", rest: "Journal of Research in Personality, 37(6), 504–528.", link: "https://gosling.psy.utexas.edu/wp-content/uploads/2014/09/JRP-03-tipi.pdf", label: "Author PDF" },
    { text: "Lee, S., & Kim, J. (2024).", title: "Testing the bipolar assumption of Singer-Loomis Type Deployment Inventory for Korean adults using classification and multidimensional scaling.", rest: "Frontiers in Psychology, 14, 1249185.", link: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1249185/full", label: "Frontiers" },
    { text: "Nieto, M. D., et al. (2017).", title: "Calibrating a new item pool to adaptively assess the Big Five.", rest: "Psicothema, 29(3), 390–395.", link: "https://www.psicothema.com/pi?pii=4411", label: "Psicothema" },
    { text: "Tiwari, T., Singh, A. L., & Singh, I. L. (2009).", title: "The short-form revised Eysenck personality questionnaire: A Hindi edition (EPQRS-H).", rest: "Industrial Psychiatry Journal, 18(1), 27–31.", link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3016694/", label: "PMC" },
  ] },
  { id: "websites", title: "Typology websites", refs: [
    { text: "Big Five results: SLOAN codes.", rest: "Personality Database wiki.", link: "https://wiki.personality-database.com/books/big-5-personality-traits/page/big-5-results-sloan-codes", label: "PDB wiki" },
    { text: "Are SLOAN and OCEAN different systems?", rest: "Personality Database wiki.", link: "https://wiki.personality-database.com/books/big-5-personality-traits/page/are-sloan-and-ocean-different-systems", label: "PDB wiki" },
    { text: "MOTIVES traits and the factor study.", rest: "SimilarMinds.", link: "https://research.similarminds.com/personality-research.html", label: "SimilarMinds" },
    { text: "Four temperaments.", rest: "Wikipedia.", link: "https://en.wikipedia.org/wiki/Four_temperaments", label: "Wikipedia" },
    { text: "Eysenck personality dimensions.", rest: "Lumen Learning, Introduction to Psychology.", link: "https://content.one.lumenlearning.com/introductiontopsychology/chapter/learn-it-eysenck-personality-dimensions/", label: "Lumen" },
    { text: "Enneagram instinctual variants.", rest: "Enneagram User Guide.", link: "https://enneagramuserguide.com/quick-guide/enneagram-instinctual-variants", label: "Guide" },
    { text: "Instinctual Variant Questionnaire (IVQ).", rest: "The Enneagram Institute.", link: "https://www.enneagraminstitute.com/ivq", label: "Enneagram Institute" },
    { text: "What is the accurate description of tritype?", rest: "Katherine Fauvre, blog.", link: "https://katherine-fauvre.squarespace.com/blog/what-is-the-accurate-description-of-tritype", label: "Blog" },
    { text: "Enneagram wings.", rest: "Sociotype.", link: "https://sociotype.com/enneagram/wings", label: "Sociotype" },
    { text: "Psychosophy (Attitudinal Psyche): core theory.", rest: "Personality Database wiki.", link: "https://wiki.personality-database.com/books/psychosophy-attitudinal-psyche/page/core-theory", label: "PDB wiki" },
    { text: "What is Psychosophy?", rest: "Psychosophy site.", link: "https://sites.google.com/view/psychosophy/main-theory-official/what-is-psychosophy", label: "Site" },
    { text: "Introduction to Temporistics.", rest: "Personality Database wiki.", link: "https://wiki.personality-database.com/books/temporistics-hdF/page/introduction-to-temporistics", label: "PDB wiki" },
    { text: "Difference between Psychosophy and Temporistics.", rest: "Personality Database wiki.", link: "https://wiki.personality-database.com/books/temporistics-hdF/page/difference-between-psychosophy-and-temporistics", label: "PDB wiki" },
    { text: "BFI-2 forms (free for personal use).", rest: "Colby Personality Lab.", link: "https://www.colby.edu/academics/departments-and-programs/psychology/research-opportunities/personality-lab/the-bfi-2/", label: "Colby" },
    { text: "How accurate are popular personality test frameworks at predicting life outcomes?", rest: "ClearerThinking.", link: "https://www.clearerthinking.org/post/how-accurate-are-popular-personality-test-frameworks-at-predicting-life-outcomes-a-detailed-investi", label: "ClearerThinking" },
  ] },
];

// Open-access policy. references.test.ts enforces it.

/** Hosts that give free full text without a login. Every paper link must use one of these hosts. Do not cite a paywalled or abstract-only page. */
export const OPEN_HOSTS = [
  "pmc.ncbi.nlm.nih.gov", "www.ncbi.nlm.nih.gov", "europepmc.org", "arxiv.org", "osf.io", "psyarxiv.com", "zenodo.org",
  "kar.kent.ac.uk","www.psicothema.com", "gosling.psy.utexas.edu", "escholarship.org", "www.frontiersin.org",
];

/** Typology websites that open without a login (checked 2026-11-19). Check a new website before you add it here. */
export const OPEN_SITES = [
  "wiki.personality-database.com", "research.similarminds.com", "en.wikipedia.org", "content.one.lumenlearning.com",
  "enneagramuserguide.com", "www.enneagraminstitute.com", "katherine-fauvre.squarespace.com", "sociotype.com",
  "sites.google.com", "www.colby.edu", "www.clearerthinking.org",
];
