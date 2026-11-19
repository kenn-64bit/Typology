// Evidence notes for each system. `lead` shows in the Overview table, `ev` on the References page.
import type { BadgeKey } from "./shared.ts";

export const EVIDENCE: { sys: string; href: string; key: BadgeKey; lead: string; ev: string }[] = [
    { sys: "Big Five / SLOAN", href: "/bigfive", key: "strong", lead: "Five broad traits. SLOAN writes each trait as one letter.",
      ev: "Many independent studies support the Big Five. Short tests of 10 to 30 items keep most of the accuracy of long tests. Studies link the traits to health habits, work style and relationships. These links are real but small. They describe groups better than they predict one person. The SLOAN letters come from SimilarMinds. Each letter divides a continuous score into two halves. Thus a score near 50% can change letter when you do the test again." },
    { sys: "MOTIVES", href: "/motives", key: "little", lead: "Seven traits about what drives you. SimilarMinds built it from the Big Five.",
      ev: "SimilarMinds published one factor study of its own, with 6,675 people. No independent study has tested MOTIVES. The author's own data shows overlap with the Big Five. Thus some MOTIVES traits may be Big Five traits with new names." },
    { sys: "Four Temperaments", href: "/temperament", key: "some", lead: "Four old names for energy and reaction to stress, placed on two Big Five traits.",
      ev: "The original theory said that four body fluids (\"humors\") control mood. Medicine rejected this theory long ago. Hans Eysenck kept the four names for the four corners of a grid. The grid uses two Big Five traits: Extraversion and Neuroticism. Strong evidence supports these two traits. Thus your temperament is as reliable as these two Big Five scores. The name adds no new measurement." },
    { sys: "Jungian Functions", href: "/jung", key: "some", lead: "Jung's eight ways of taking in information and deciding. The result names your top two.",
      ev: "Jung published Psychological Types in 1921. The four MBTI-style scales measure real differences. They match four of the Big Five traits. But the scores do not divide people into separate groups. About half of people get a different four-letter type when they do the test again. Few studies measure the eight functions as separate scores. Read your function result as a description of habits, not as a fixed type." },
    { sys: "Enneagram", href: "/enneagram", key: "mixed", lead: "Nine types, each built on one core want and one core fear. Adds wing, instincts and tritype.",
      ev: "A systematic review from 2021 examined 104 samples. It found mixed evidence for the reliability and validity of Enneagram tests. It found few studies of wings. No independent study has tested instincts or tritype. Some evidence supports the core type. No evidence supports the other parts yet." },
    { sys: "Attitudinal Psyche", href: "/ap", key: "little", lead: "Your attitude to will, logic, emotion and the body, as an order of four.",
      ev: "Attitudinal Psyche comes from Psychosophy. Alexander Afanasyev wrote this theory in his book Syntax of Love. No validated test exists. No study has examined whether a person keeps the same order over time." },
    { sys: "Temporistics", href: "/temporistics", key: "little", lead: "The order in which you give attention to past, present, future and eternity.",
      ev: "Alexander Latyshev and Veronica Shelman built Temporistics on the Psychosophy of Afanasyev. No validated test exists, and no study has examined the theory. The test on this site is a first draft. Its result shows the statements that you chose. Thus you can check the order yourself." },
  ];
