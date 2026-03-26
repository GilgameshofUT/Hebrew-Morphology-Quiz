import { VALID_MORPHOLOGIES } from "./validMorphologies";

export interface MorphSelections {
  pos?: string;
  type?: string;
  stem?: string;
  person?: string;
  gender?: string;
  number?: string;
  state?: string;
}

export function getValidOptions(language: string, selections: MorphSelections) {
  const validOptions = {
    pos: new Set<string>(),
    type: new Set<string>(),
    stem: new Set<string>(),
    person: new Set<string>(),
    gender: new Set<string>(),
    number: new Set<string>(),
    state: new Set<string>(),
  };

  for (const morph of VALID_MORPHOLOGIES) {
    if (morph[0] !== language) continue;

    const pos = morph[1];
    if (!pos) continue;

    let type = "x", stem = "x", person = "x", gender = "x", number = "x", state = "x";

    let i = 2;
    const getNext = () => (i < morph.length ? morph[i++] : "x");

    if (pos === "A" || pos === "N") {
      type = getNext();
      gender = getNext();
      number = getNext();
      state = getNext();
    } else if (pos === "P" || pos === "S") {
      type = getNext();
      person = getNext();
      gender = getNext();
      number = getNext();
    } else if (pos === "R" || pos === "T") {
      type = getNext();
    } else if (pos === "V") {
      stem = getNext();
      type = getNext();
      if (type === "r" || type === "s") {
        gender = getNext();
        number = getNext();
        state = getNext();
      } else if (type === "a" || type === "c") {
        // Infinitives have no person, gender, number, state
      } else {
        person = getNext();
        gender = getNext();
        number = getNext();
      }
    }

    // Check if this morph matches current selections (ignoring the field we are checking)
    const matches = (field: keyof MorphSelections, value: string) => {
      if (value === "x") return true; // Field not applicable to this morphology
      if (!selections[field]) return true;
      return selections[field] === value;
    };

    const matchPos = matches("pos", pos);
    const matchType = matches("type", type);
    const matchStem = matches("stem", stem);
    const matchPerson = matches("person", person);
    const matchGender = matches("gender", gender);
    const matchNumber = matches("number", number);
    const matchState = matches("state", state);

    if (matchType && matchStem && matchPerson && matchGender && matchNumber && matchState) validOptions.pos.add(pos);
    if (matchPos && matchStem && matchPerson && matchGender && matchNumber && matchState && type !== "x") validOptions.type.add(type);
    if (matchPos && matchType && matchPerson && matchGender && matchNumber && matchState && stem !== "x") validOptions.stem.add(stem);
    if (matchPos && matchType && matchStem && matchGender && matchNumber && matchState && person !== "x") validOptions.person.add(person);
    if (matchPos && matchType && matchStem && matchPerson && matchNumber && matchState && gender !== "x") validOptions.gender.add(gender);
    if (matchPos && matchType && matchStem && matchPerson && matchGender && matchState && number !== "x") validOptions.number.add(number);
    if (matchPos && matchType && matchStem && matchPerson && matchGender && matchNumber && state !== "x") validOptions.state.add(state);
  }

  return {
    pos: Array.from(validOptions.pos),
    type: Array.from(validOptions.type),
    stem: Array.from(validOptions.stem),
    person: Array.from(validOptions.person),
    gender: Array.from(validOptions.gender),
    number: Array.from(validOptions.number),
    state: Array.from(validOptions.state),
  };
}
