// All citations shown on the site, from research/notation.md, research/dossier.md and CONTENT.md §12.
// Titles are quoted exactly as published.
export type Ref = { text: string; title?: string; rest?: string; link: string; label: string };
export type RefGroup = { id: string; title: string; refs: Ref[] };

export const REFERENCES: RefGroup[] = [
  { id: "papers", title: "Psychology papers and books", refs: [
    { text: "Arnau, R. C., Rosen, D. H., & Thompson, B. (2000).", title: "Reliability and validity of scores from the Singer-Loomis Type Deployment Inventory.", rest: "Journal of Analytical Psychology, 45(3), 409–426.", link: "https://zendy.io/title/10.1111/1465-5922.00173", label: "Record" },
    { text: "Brown, A., & Maydeu-Olivares, A. (2011).", title: "Item response modeling of forced-choice questionnaires.", rest: "Educational and Psychological Measurement, 71(3), 460–502.", link: "https://kar.kent.ac.uk/id/document/11772", label: "Kent repository" },
    { text: "Colledani, D., Anselmi, P., & Robusto, E. (2018).", title: "Using item response theory for the development of a new short form of the EPQ-R.", rest: "Frontiers in Psychology, 9, 1834.", link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6190847/", label: "PMC" },
    { text: "Donnellan, M. B., et al. (2006).", title: "The Mini-IPIP scales: Tiny-yet-effective measures of the Big Five factors of personality.", rest: "Psychological Assessment, 18(2), 192–203.", link: "https://casrai.org/guides/ipip", label: "IPIP guide" },
    { text: "Forer, B. R. (1949).", title: "The fallacy of personal validation.", rest: "Journal of Abnormal and Social Psychology, 44(1), 118–123.", link: "https://en.wikipedia.org/wiki/Barnum_effect", label: "Overview" },
    { text: "Gosling, S. D., Rentfrow, P. J., & Swann, W. B. (2003).", title: "A very brief measure of the Big-Five personality domains.", rest: "Journal of Research in Personality, 37(6), 504–528.", link: "https://gosling.psy.utexas.edu/?p=98", label: "TIPI page" },
    { text: "Hol, A. M., Vorst, H. C. M., & Mellenbergh, G. J. (2008).", title: "Computerized adaptive testing of personality traits.", rest: "Zeitschrift für Psychologie, 216(1), 12–21.", link: "https://dare.uva.nl/id/68d478f4-0b1e-4acb-806c-1fb5e461b0d0", label: "Record" },
    { text: "Hook, J. N., et al. (2021).", title: "The Enneagram: A systematic review of the literature and directions for future research.", rest: "Journal of Clinical Psychology, 77(4), 865–883.", link: "https://pubmed.ncbi.nlm.nih.gov/33332604/", label: "PubMed" },
    { text: "Johnson, J. A. (2014).", title: "Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120.", rest: "Journal of Research in Personality, 51, 78–89.", link: "https://ejop.psychopen.eu/index.php/ejop/article/download/1671/1671.html?inline=1", label: "Related study" },
    { text: "Jung, C. G. (1921/1971).", title: "Psychological Types.", rest: "Collected Works of C. G. Jung, Vol. 6. Princeton University Press.", link: "https://en.wikipedia.org/wiki/Psychological_Types", label: "Overview" },
    { text: "McCrae, R. R., & Costa, P. T. (1989).", title: "Reinterpreting the Myers-Briggs Type Indicator from the perspective of the five-factor model of personality.", rest: "Journal of Personality, 57(1), 17–40.", link: "https://pubmed.ncbi.nlm.nih.gov/2709300/", label: "PubMed" },
    { text: "Newgent, R. A., et al. (2004).", title: "The RHETI: Estimates of reliability and validity.", rest: "Measurement and Evaluation in Counseling and Development, 36(4), 226–237.", link: "https://www.statisticssolutions.com/free-resources/directory-of-survey-instruments/the-riso-hudson-enneagram-type-indicator-rheti/", label: "Summary" },
    { text: "Nieto, M. D., et al. (2017).", title: "Calibrating a new item pool to adaptively assess the Big Five.", rest: "Psicothema, 29(3), 390–395.", link: "https://www.psicothema.com/pi?pii=4411", label: "Psicothema" },
    { text: "Pittenger, D. J. (2005).", title: "Cautionary comments regarding the Myers-Briggs Type Indicator.", rest: "Consulting Psychology Journal: Practice and Research, 57(3), 210–221.", link: "https://atticusli.com/replication-crisis/myers-briggs-mbti", label: "Summary" },
    { text: "Soto, C. J., & John, O. P. (2017).", title: "Short and extra-short forms of the Big Five Inventory–2.", rest: "Journal of Research in Personality, 68, 69–81.", link: "https://peeref.com/works/47033882", label: "Record" },
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
