// Evidence notes for each system. `lead` shows in the Overview table, `ev` on the References page.
import type { BadgeKey } from "./shared.ts";

export const EVIDENCE: { sys: string; href: string; key: BadgeKey; lead: string; ev: string }[] = [
    { sys: "Big Five / SLOAN", href: "/bigfive", key: "strong", lead: "Five broad traits. SLOAN writes each trait as one letter.",
      ev: "Many independent studies support the Big Five. Short tests of 10 to 30 items keep most of the accuracy of long tests. The traits are linked to health habits, work style and relationships. These links are real but small: they describe groups better than they predict one person. The SLOAN letters come from SimilarMinds. Each letter cuts a continuous score in two, so a score near 50% can change letter on a retake." },
    { sys: "MOTIVES", href: "/motives", key: "little", lead: "Seven traits about what drives you. SimilarMinds built it from the Big Five.",
      ev: "SimilarMinds published one factor study of its own, with 6,675 people. No independent study has tested MOTIVES. The author's own data shows overlap with the Big Five, so some MOTIVES traits may be Big Five traits with new names." },
    { sys: "Four Temperaments", href: "/temperament", key: "some", lead: "Four old names for energy and reaction to stress, placed on two Big Five traits.",
      ev: "The original theory said four body fluids (\"humors\") control mood. Medicine rejected it long ago. Hans Eysenck kept the four names for the four corners of a grid made from Extraversion and Neuroticism. Those two traits have strong evidence. So your temperament is as reliable as those two Big Five scores, but the name adds no new measurement." },
    { sys: "Jungian Functions", href: "/jung", key: "some", lead: "Jung's eight ways of taking in information and deciding. The result names your top two.",
      ev: "Jung published Psychological Types in 1921. The four MBTI-style scales measure real differences, and they match four of the Big Five traits. But scores do not fall into separate groups: about half of people get a different four-letter type on a retake. Few studies measure the eight functions as separate scores. Read your function result as a description of habits, not a fixed type." },
    { sys: "Enneagram", href: "/enneagram", key: "mixed", lead: "Nine types, each built on one core want and one core fear. Adds wing, instincts and tritype.",
      ev: "A 2021 systematic review covered 104 samples. It found mixed evidence for the reliability and validity of Enneagram tests, and few studies of wings. No independent study has tested instincts or tritype. The core type has some support. The other parts have none yet." },
    { sys: "Attitudinal Psyche", href: "/ap", key: "little", lead: "Your attitude to will, logic, emotion and the body, as an order of four.",
      ev: "Attitudinal Psyche comes from Psychosophy, a theory by Alexander Afanasyev in his book Syntax of Love. There is no validated test. No study has checked whether a person keeps the same order over time." },
    { sys: "Temporistics", href: "/temporistics", key: "little", lead: "The order in which you give attention to past, present, future and eternity.",
      ev: "Alexander Latyshev and Veronica Shelman built Temporistics on Afanasyev's Psychosophy. There is no validated test and no study of the theory. The test on this site is a first draft. Its result lists the statements you chose, so you can check the order yourself." },
  ];
