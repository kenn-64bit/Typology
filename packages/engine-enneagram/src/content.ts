// Original Enneagram wording (no RHETI / iEQ9 items). Three short statements and one self-check
// paragraph per type, plus instinct ranking tasks.

export const TYPE_NAMES: Record<number, string> = {
  1: "Reformer", 2: "Helper", 3: "Achiever", 4: "Individualist", 5: "Investigator",
  6: "Loyalist", 7: "Enthusiast", 8: "Challenger", 9: "Peacemaker",
};

/** statements[type] = 3 first-person statements (ids `${type}a|b|c`). */
export const STATEMENTS: Record<number, [string, string, string]> = {
  1: ["I notice what's wrong and feel I should fix it.", "I hold myself to high standards, sometimes too high.", "Doing things the right way matters more to me than doing them fast."],
  2: ["I quickly sense what others need and offer it.", "I feel best when the people around me rely on me.", "I find it easier to give help than to ask for it."],
  3: ["I'm driven to succeed and be seen as capable.", "I adapt my style to whatever will work best.", "Being productive is a big part of how I value myself."],
  4: ["I often feel different from the people around me.", "I'm drawn to what is deep, personal and authentic.", "I'm comfortable with sad or intense feelings others avoid."],
  5: ["I need plenty of time alone to think and recharge.", "I'd rather understand something fully before I act.", "I guard my energy, time and privacy closely."],
  6: ["I think ahead about what might go wrong and prepare.", "Trust has to be earned before I relax with someone.", "I feel steadier when I know who and what I can count on."],
  7: ["I keep my options open in case something better comes along.", "I bounce out of bad moods by planning something fun.", "New experiences and ideas excite me more than routine."],
  8: ["I say what I think directly, even if it causes friction.", "I take charge when no one else will.", "I protect the people close to me fiercely."],
  9: ["I go along with others to keep the peace.", "I find it hard to know what I want when others want something.", "I'm calm and easygoing, and slow to get angry."],
};

/** Self-check paragraphs, written to discriminate (what this type does that its neighbours do not). */
export const PARAGRAPHS: Record<number, string> = {
  1: "I carry an inner critic that keeps pointing out how things should be. I work hard to be fair, responsible and correct, and I get frustrated when others cut corners. Relaxing feels easier once everything is in order.",
  2: "I'm tuned in to other people's feelings and needs, and I like being the one who helps. I can lose track of my own needs, and I feel hurt when my care goes unnoticed.",
  3: "I set goals and go after them, and I know how to present myself well. I can switch off feelings to get the job done. Failing, or being seen to fail, is what I fear most.",
  4: "I search for what makes me unique and what feels true. My emotions run deep and I'm drawn to beauty and meaning. I sometimes feel something essential is missing that others seem to have.",
  5: "I watch and think before I engage. I collect knowledge and like to be competent on my own terms. Demands on my time and energy can feel draining, so I keep my needs small.",
  6: "I'm alert to risks and like having a plan B. I'm loyal and committed, but I question authority and test whether people are reliable. Doubt can keep me going back and forth.",
  7: "I'm curious, quick and upbeat, always looking for the next interesting thing. I dislike feeling trapped or bored and tend to reframe pain into something positive.",
  8: "I'm strong-willed and protective, and I don't like being controlled. I meet conflict head-on and value honesty, even when it's blunt. I show softness only to people I trust.",
  9: "I'm easygoing and want things to stay harmonious, inside and around me. I see every side of a disagreement and can put my own priorities last without noticing.",
};

/** Instinct ranking tasks (sp / so / sx), original wording. */
export const INSTINCT_TASKS: { id: string; text: string; options: { id: "sp" | "so" | "sx"; text: string }[] }[] = [
  { id: "in1", text: "On a free day, what do you naturally attend to first?", options: [
    { id: "sp", text: "Making sure the essentials are covered: food, rest, money, home" },
    { id: "so", text: "Catching up with my circle and what's happening in the group" },
    { id: "sx", text: "Spending it with the one person or passion that feels most alive" }] },
  { id: "in2", text: "Entering a party, what do you notice first?", options: [
    { id: "sp", text: "Whether it's comfortable: seats, temperature, food" },
    { id: "so", text: "Who is there and how everyone is connected" },
    { id: "sx", text: "The one person I feel a spark with" }] },
  { id: "in3", text: "What would feel most painful to lose?", options: [
    { id: "sp", text: "My security and stability" },
    { id: "so", text: "My place and role in a community" },
    { id: "sx", text: "A deep, intense bond with someone" }] },
  { id: "in4", text: "Which kind of worry keeps you up at night?", options: [
    { id: "sp", text: "Health, money or practical problems" },
    { id: "so", text: "What people think of me, or tension in the group" },
    { id: "sx", text: "Whether a key relationship is still strong" }] },
];
