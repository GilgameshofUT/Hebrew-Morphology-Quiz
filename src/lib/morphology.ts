export const LANGUAGE_CODES: Record<string, string> = {
  H: "Hebrew",
  A: "Aramaic",
};

export const POS_CODES: Record<string, string> = {
  A: "adjective",
  C: "conjunction",
  D: "adverb",
  N: "noun",
  P: "pronoun",
  R: "preposition",
  S: "suffix",
  T: "particle",
  V: "verb",
};

export const VERB_STEMS_HEBREW: Record<string, string> = {
  q: "qal",
  N: "niphal",
  p: "piel",
  P: "pual",
  h: "hiphil",
  H: "hophal",
  t: "hithpael",
  o: "polel",
  O: "polal",
  r: "hithpolel",
  m: "poel",
  M: "poal",
  k: "palel",
  K: "pulal",
  Q: "qal passive",
  l: "pilpel",
  L: "polpal",
  f: "hithpalpel",
  D: "nithpael",
  j: "pealal",
  i: "pilel",
  u: "hothpaal",
  c: "tiphil",
  v: "hishtaphel",
  w: "nithpalel",
  y: "nithpoel",
  z: "hithpoel",
};

export const VERB_STEMS_ARAMAIC: Record<string, string> = {
  q: "peal",
  Q: "peil",
  u: "hithpeel",
  p: "pael",
  P: "ithpaal",
  M: "hithpaal",
  a: "aphel",
  h: "haphel",
  s: "saphel",
  e: "shaphel",
  H: "hophal",
  i: "ithpeel",
  t: "hishtaphel",
  v: "ishtaphel",
  w: "hithaphel",
  o: "polel",
  z: "ithpoel",
  r: "hithpolel",
  f: "hithpalpel",
  b: "hephal",
  c: "tiphel",
  m: "poel",
  l: "palpel",
  L: "ithpalpel",
  O: "ithpolel",
  G: "ittaphal",
};

export const VERB_CONJUGATION_TYPES: Record<string, string> = {
  p: "perfect",
  q: "sequential perfect",
  i: "imperfect",
  w: "sequential imperfect",
  h: "cohortative",
  j: "jussive",
  v: "imperative",
  r: "participle active",
  s: "participle passive",
  a: "infinitive absolute",
  c: "infinitive construct",
};

export const ADJECTIVE_TYPES: Record<string, string> = {
  a: "adjective",
  c: "cardinal number",
  g: "gentilic",
  o: "ordinal number",
};

export const NOUN_TYPES: Record<string, string> = {
  c: "common",
  g: "gentilic",
  p: "proper name",
};

export const PRONOUN_TYPES: Record<string, string> = {
  d: "demonstrative",
  f: "indefinite",
  i: "interrogative",
  p: "personal",
  r: "relative",
};

export const PREPOSITION_TYPES: Record<string, string> = {
  d: "definite article",
};

export const SUFFIX_TYPES: Record<string, string> = {
  d: "directional he",
  h: "paragogic he",
  n: "paragogic nun",
  p: "pronominal",
};

export const PARTICLE_TYPES: Record<string, string> = {
  a: "affirmation",
  d: "definite article",
  e: "exhortation",
  i: "interrogative",
  j: "interjection",
  m: "demonstrative",
  n: "negative",
  o: "direct object marker",
  r: "relative",
};

export const PERSON_CODES: Record<string, string> = {
  "1": "first",
  "2": "second",
  "3": "third",
};

export const GENDER_CODES: Record<string, string> = {
  b: "both",
  c: "common",
  f: "feminine",
  m: "masculine",
};

export const NUMBER_CODES: Record<string, string> = {
  d: "dual",
  p: "plural",
  s: "singular",
};

export const STATE_CODES: Record<string, string> = {
  a: "absolute",
  c: "construct",
  d: "determined",
};

export interface Morpheme {
  pos: string;
  posName: string;
  type?: string;
  typeName?: string;
  stem?: string;
  stemName?: string;
  person?: string;
  personName?: string;
  gender?: string;
  genderName?: string;
  number?: string;
  numberName?: string;
  state?: string;
  stateName?: string;
}

export interface ParsedMorph {
  language: string;
  languageName: string;
  morphemes: Morpheme[];
}

export function parseMorph(morphString: string): ParsedMorph | null {
  if (!morphString || morphString.length < 2) return null;

  const language = morphString[0];
  const languageName = LANGUAGE_CODES[language] || "Unknown";

  const parts = morphString.substring(1).split("/");
  const morphemes: Morpheme[] = parts.map((part) => {
    if (!part) return { pos: "Unknown", posName: "Unknown" };

    const pos = part[0];
    const posName = POS_CODES[pos] || "Unknown";
    const morpheme: Morpheme = { pos, posName };

    let i = 1;
    const getNext = () => (i < part.length ? part[i++] : "x");

    if (pos === "A") {
      // Adjective
      const type = getNext();
      if (type !== "x") {
        morpheme.type = type;
        morpheme.typeName = ADJECTIVE_TYPES[type];
      }
      const gender = getNext();
      if (gender !== "x") {
        morpheme.gender = gender;
        morpheme.genderName = GENDER_CODES[gender];
      }
      const num = getNext();
      if (num !== "x") {
        morpheme.number = num;
        morpheme.numberName = NUMBER_CODES[num];
      }
      const state = getNext();
      if (state !== "x") {
        morpheme.state = state;
        morpheme.stateName = STATE_CODES[state];
      }
    } else if (pos === "N") {
      // Noun
      const type = getNext();
      if (type !== "x") {
        morpheme.type = type;
        morpheme.typeName = NOUN_TYPES[type];
      }
      const gender = getNext();
      if (gender !== "x") {
        morpheme.gender = gender;
        morpheme.genderName = GENDER_CODES[gender];
      }
      const num = getNext();
      if (num !== "x") {
        morpheme.number = num;
        morpheme.numberName = NUMBER_CODES[num];
      }
      const state = getNext();
      if (state !== "x") {
        morpheme.state = state;
        morpheme.stateName = STATE_CODES[state];
      }
    } else if (pos === "P") {
      // Pronoun
      const type = getNext();
      if (type !== "x") {
        morpheme.type = type;
        morpheme.typeName = PRONOUN_TYPES[type];
      }
      const person = getNext();
      if (person !== "x") {
        morpheme.person = person;
        morpheme.personName = PERSON_CODES[person];
      }
      const gender = getNext();
      if (gender !== "x") {
        morpheme.gender = gender;
        morpheme.genderName = GENDER_CODES[gender];
      }
      const num = getNext();
      if (num !== "x") {
        morpheme.number = num;
        morpheme.numberName = NUMBER_CODES[num];
      }
    } else if (pos === "R") {
      // Preposition
      const type = getNext();
      if (type !== "x") {
        morpheme.type = type;
        morpheme.typeName = PREPOSITION_TYPES[type];
      }
    } else if (pos === "S") {
      // Suffix
      const type = getNext();
      if (type !== "x") {
        morpheme.type = type;
        morpheme.typeName = SUFFIX_TYPES[type];
      }
      const person = getNext();
      if (person !== "x") {
        morpheme.person = person;
        morpheme.personName = PERSON_CODES[person];
      }
      const gender = getNext();
      if (gender !== "x") {
        morpheme.gender = gender;
        morpheme.genderName = GENDER_CODES[gender];
      }
      const num = getNext();
      if (num !== "x") {
        morpheme.number = num;
        morpheme.numberName = NUMBER_CODES[num];
      }
    } else if (pos === "T") {
      // Particle
      const type = getNext();
      if (type !== "x") {
        morpheme.type = type;
        morpheme.typeName = PARTICLE_TYPES[type];
      }
    } else if (pos === "V") {
      // Verb
      const stem = getNext();
      if (stem !== "x") {
        morpheme.stem = stem;
        morpheme.stemName =
          language === "A" ? VERB_STEMS_ARAMAIC[stem] : VERB_STEMS_HEBREW[stem];
      }
      const type = getNext();
      if (type !== "x") {
        morpheme.type = type;
        morpheme.typeName = VERB_CONJUGATION_TYPES[type];
      }
      
      if (type === "r" || type === "s") {
        // Participles have gender, number, state, but no person
        const gender = getNext();
        if (gender !== "x") {
          morpheme.gender = gender;
          morpheme.genderName = GENDER_CODES[gender];
        }
        const num = getNext();
        if (num !== "x") {
          morpheme.number = num;
          morpheme.numberName = NUMBER_CODES[num];
        }
        const state = getNext();
        if (state !== "x") {
          morpheme.state = state;
          morpheme.stateName = STATE_CODES[state];
        }
      } else if (type === "a" || type === "c") {
        // Infinitives have no person, gender, number, state
      } else {
        // Finite verbs have person, gender, number
        const person = getNext();
        if (person !== "x") {
          morpheme.person = person;
          morpheme.personName = PERSON_CODES[person];
        }
        const gender = getNext();
        if (gender !== "x") {
          morpheme.gender = gender;
          morpheme.genderName = GENDER_CODES[gender];
        }
        const num = getNext();
        if (num !== "x") {
          morpheme.number = num;
          morpheme.numberName = NUMBER_CODES[num];
        }
      }
    }

    return morpheme;
  });

  return {
    language,
    languageName,
    morphemes,
  };
}
