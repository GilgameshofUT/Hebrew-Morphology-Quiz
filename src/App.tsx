import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  parseMorph,
  ParsedMorph,
  POS_CODES,
  VERB_STEMS_HEBREW,
  VERB_STEMS_ARAMAIC,
  VERB_CONJUGATION_TYPES,
  ADJECTIVE_TYPES,
  NOUN_TYPES,
  PRONOUN_TYPES,
  PREPOSITION_TYPES,
  SUFFIX_TYPES,
  PARTICLE_TYPES,
  GENDER_CODES,
  NUMBER_CODES,
  STATE_CODES,
  PERSON_CODES,
} from "./lib/morphology";
import { MultiSelect } from "@/components/MultiSelect";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import rawData from "./data.json";
import { getValidOptions } from "./lib/morphologyLogic";

interface WordData {
  word: string;
  strongs: string;
  morph_options: string[];
  frequency: number;
  parsed_options: ParsedMorph[];
}

const allWords: WordData[] = (rawData as any[])
  .map((w) => {
    const parsed_options = w.morph_options
      .map((m: string) => parseMorph(m))
      .filter((p: any) => p !== null);
    return {
      word: w.form,
      strongs: w.strongs || "",
      morph_options: w.morph_options,
      frequency: w.count || w.total_occurrences || 0,
      parsed_options,
    };
  })
  .filter((w) => w.parsed_options.length > 0);

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function App() {
  const [screen, setScreen] = useState<"settings" | "quiz" | "report" | "reports">(
    "settings",
  );

  // Settings state
  const [language, setLanguage] = useState<"H" | "A" | "both">("H");
  const [maxFrequency, setMaxFrequency] = useState<number>(6500);
  const [minFrequency, setMinFrequency] = useState<number>(0);
  const [selectedPos, setSelectedPos] = useState<string[]>([]);
  const [selectedStem, setSelectedStem] = useState<string[]>([]);
  const [selectedConjugation, setSelectedConjugation] = useState<string[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string[]>([]);
  const [selectedAdjectiveType, setSelectedAdjectiveType] = useState<string[]>([]);
  const [selectedNounType, setSelectedNounType] = useState<string[]>([]);
  const [selectedPronounType, setSelectedPronounType] = useState<string[]>([]);
  const [selectedSuffixType, setSelectedSuffixType] = useState<string[]>([]);
  const [selectedParticleType, setSelectedParticleType] = useState<string[]>([]);
  const [numWords, setNumWords] = useState<number>(10); // 0 means continuous
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Quiz state
  const [quizWords, setQuizWords] = useState<WordData[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState({
    elementsCorrect: 0,
    elementsTotal: 0,
    wordsCorrect: 0,
    wordsTotal: 0,
  });
  const [mistakes, setMistakes] = useState<{
    pos: Record<string, number>;
    stem: Record<string, number>;
  }>({ pos: {}, stem: {} });
  const [stats, setStats] = useState<Record<string, Record<string, { correct: number; total: number }>>>({
    pos: {}, stemH: {}, stemA: {}, conjugation: {}, adjective: {}, noun: {}, pronoun: {}, suffix: {}, state: {}, person: {}, gender: {}, number: {}, particle: {}
  });
  const [history, setHistory] = useState({
    elementsCorrect: 0,
    elementsTotal: 0,
    wordsCorrect: 0,
    wordsTotal: 0,
    sessions: [] as any[],
  });

  // Current answer state
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hebrew_morph_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveHistory = (newHistory: any) => {
    setHistory(newHistory);
    localStorage.setItem("hebrew_morph_history", JSON.stringify(newHistory));
  };

  const startQuiz = () => {
    let filtered = allWords.filter((w) => {
      if (language !== "both" && !w.parsed_options.some(p => p.language === language)) return false;
      if (w.frequency < minFrequency || w.frequency > maxFrequency)
        return false;
      
      const hasMatchingOption = w.parsed_options.some(parsed => {
        if (
          selectedPos.length > 0 &&
          !parsed.morphemes.some((m) => selectedPos.includes(m.pos))
        )
          return false;
        if (
          selectedStem.length > 0 &&
          !parsed.morphemes.some((m) => m.stem && selectedStem.includes(m.stem))
        )
          return false;
        if (
          selectedConjugation.length > 0 &&
          !parsed.morphemes.some((m) => m.type && selectedConjugation.includes(m.type))
        )
          return false;
        if (
          selectedPerson.length > 0 &&
          !parsed.morphemes.some((m) => m.person && selectedPerson.includes(m.person))
        )
          return false;
        if (
          selectedGender.length > 0 &&
          !parsed.morphemes.some((m) => m.gender && selectedGender.includes(m.gender))
        )
          return false;
        if (
          selectedNumber.length > 0 &&
          !parsed.morphemes.some((m) => m.number && selectedNumber.includes(m.number))
        )
          return false;
        if (
          selectedState.length > 0 &&
          !parsed.morphemes.some((m) => m.state && selectedState.includes(m.state))
        )
          return false;
        if (
          selectedAdjectiveType.length > 0 &&
          !parsed.morphemes.some((m) => m.pos === "A" && m.type && selectedAdjectiveType.includes(m.type))
        )
          return false;
        if (
          selectedNounType.length > 0 &&
          !parsed.morphemes.some((m) => m.pos === "N" && m.type && selectedNounType.includes(m.type))
        )
          return false;
        if (
          selectedPronounType.length > 0 &&
          !parsed.morphemes.some((m) => m.pos === "P" && m.type && selectedPronounType.includes(m.type))
        )
          return false;
        if (
          selectedSuffixType.length > 0 &&
          !parsed.morphemes.some((m) => m.pos === "S" && m.type && selectedSuffixType.includes(m.type))
        )
          return false;
        if (
          selectedParticleType.length > 0 &&
          !parsed.morphemes.some((m) => m.pos === "T" && m.type && selectedParticleType.includes(m.type))
        )
          return false;
        return true;
      });

      return hasMatchingOption;
    });

    // Shuffle
    filtered = filtered.sort(() => Math.random() - 0.5);

    if (numWords > 0) {
      filtered = filtered.slice(0, numWords);
    }

    if (filtered.length === 0) {
      alert("No words match your criteria!");
      return;
    }

    setQuizWords(filtered);
    setCurrentWordIndex(0);
    setScore({
      elementsCorrect: 0,
      elementsTotal: 0,
      wordsCorrect: 0,
      wordsTotal: 0,
    });
    setMistakes({ pos: {}, stem: {} });
    setStats({
      pos: {}, stemH: {}, stemA: {}, conjugation: {}, adjective: {}, noun: {}, pronoun: {}, suffix: {}, state: {}, person: {}, gender: {}, number: {}, particle: {}
    });
    setUserAnswers([]);
    setShowFeedback(false);
    setScreen("quiz");
  };

  const currentWord = quizWords[currentWordIndex];

  const handleAnswerChange = (
    morphemeIndex: number,
    field: string,
    value: string,
  ) => {
    const newAnswers = [...userAnswers];
    if (!newAnswers[morphemeIndex]) newAnswers[morphemeIndex] = {};
    newAnswers[morphemeIndex][field] = value;
    setUserAnswers(newAnswers);
  };

  const checkAnswer = () => {
    if (!currentWord) return;

    let bestEvaluation: any = null;
    let maxScore = -1;

    for (const parsed of currentWord.parsed_options) {
      let elementsCorrect = 0;
      let elementsTotal = 0;
      let wordFullyCorrect = true;
      const newMistakes = { pos: { ...mistakes.pos }, stem: { ...mistakes.stem } };
      const newStats = JSON.parse(JSON.stringify(stats));

      const recordStat = (category: string, key: string, isCorrect: boolean) => {
        if (!key) return;
        if (!newStats[category]) newStats[category] = {};
        if (!newStats[category][key]) newStats[category][key] = { correct: 0, total: 0 };
        newStats[category][key].total++;
        if (isCorrect) newStats[category][key].correct++;
      };

      const morphemeFeedback = parsed.morphemes.map((m, i) => {
        const ans = userAnswers[i] || {};
        const fb: any = {
          pos: {
            correct: ans.pos === m.pos,
            expected: m.posName,
            actual: POS_CODES[ans.pos] || "None",
          },
        };
        elementsTotal++;
        recordStat('pos', m.posName, fb.pos.correct);
        if (fb.pos.correct) elementsCorrect++;
        else {
          wordFullyCorrect = false;
          newMistakes.pos[m.posName] = (newMistakes.pos[m.posName] || 0) + 1;
        }

        if (m.pos === "V") {
          if (m.stem) {
            elementsTotal++;
            fb.stem = {
              correct: ans.stem === m.stem,
              expected: m.stemName,
              actual: VERB_STEMS_HEBREW[ans.stem] || "None",
            };
            const stemCat = parsed.language === "A" ? "stemA" : "stemH";
            recordStat(stemCat, m.stemName, fb.stem.correct);
            if (fb.stem.correct) elementsCorrect++;
            else {
              wordFullyCorrect = false;
              newMistakes.stem[m.stemName] = (newMistakes.stem[m.stemName] || 0) + 1;
            }
          }
          if (m.type) {
            elementsTotal++;
            fb.type = {
              correct: ans.type === m.type,
              expected: m.typeName,
              actual: VERB_CONJUGATION_TYPES[ans.type] || "None",
            };
            recordStat('conjugation', m.typeName, fb.type.correct);
            if (fb.type.correct) elementsCorrect++;
            else wordFullyCorrect = false;
          }
        } else if (m.pos === "R") {
          // Preposition
          const isInseparable = i < parsed.morphemes.length - 1;
          if (isInseparable) {
            elementsTotal++;
            const hasArticle = m.type === "d";
            const answeredYes = ans.type === "d";
            fb.type = {
              correct: (hasArticle && answeredYes) || (!hasArticle && (!ans.type || ans.type === "none")),
              expected: hasArticle ? "Yes" : "No",
              actual: answeredYes ? "Yes" : "No",
            };
            if (fb.type.correct) elementsCorrect++;
            else wordFullyCorrect = false;
          }
        } else if (m.type) {
          elementsTotal++;
          let actualName = "None";
          let cat = "";
          if (m.pos === "A") { actualName = ADJECTIVE_TYPES[ans.type] || "None"; cat = "adjective"; }
          else if (m.pos === "N") { actualName = NOUN_TYPES[ans.type] || "None"; cat = "noun"; }
          else if (m.pos === "P") { actualName = PRONOUN_TYPES[ans.type] || "None"; cat = "pronoun"; }
          else if (m.pos === "R") { actualName = PREPOSITION_TYPES[ans.type] || "None"; cat = "particle"; }
          else if (m.pos === "S") { actualName = SUFFIX_TYPES[ans.type] || "None"; cat = "suffix"; }
          else if (m.pos === "T") { actualName = PARTICLE_TYPES[ans.type] || "None"; cat = "particle"; }
          
          fb.type = {
            correct: ans.type === m.type,
            expected: m.typeName,
            actual: actualName,
          };
          if (cat) recordStat(cat, m.typeName, fb.type.correct);
          if (fb.type.correct) elementsCorrect++;
          else wordFullyCorrect = false;
        }

        if (m.person) {
          elementsTotal++;
          fb.person = {
            correct: ans.person === m.person,
            expected: m.personName,
            actual: PERSON_CODES[ans.person] || "None",
          };
          recordStat('person', m.personName, fb.person.correct);
          if (fb.person.correct) elementsCorrect++;
          else wordFullyCorrect = false;
        }
        if (m.gender) {
          elementsTotal++;
          fb.gender = {
            correct: ans.gender === m.gender,
            expected: m.genderName,
            actual: GENDER_CODES[ans.gender] || "None",
          };
          recordStat('gender', m.genderName, fb.gender.correct);
          if (fb.gender.correct) elementsCorrect++;
          else wordFullyCorrect = false;
        }
        if (m.number) {
          elementsTotal++;
          fb.number = {
            correct: ans.number === m.number,
            expected: m.numberName,
            actual: NUMBER_CODES[ans.number] || "None",
          };
          recordStat('number', m.numberName, fb.number.correct);
          if (fb.number.correct) elementsCorrect++;
          else wordFullyCorrect = false;
        }
        if (m.state) {
          elementsTotal++;
          fb.state = {
            correct: ans.state === m.state,
            expected: m.stateName,
            actual: STATE_CODES[ans.state] || "None",
          };
          recordStat('state', m.stateName, fb.state.correct);
          if (fb.state.correct) elementsCorrect++;
          else wordFullyCorrect = false;
        }

        return fb;
      });

      if (elementsCorrect > maxScore) {
        maxScore = elementsCorrect;
        bestEvaluation = {
          elementsCorrect,
          elementsTotal,
          wordFullyCorrect,
          newMistakes,
          newStats,
          morphemeFeedback,
          parsed
        };
      }
    }

    setScore((s) => ({
      ...s,
      elementsCorrect: s.elementsCorrect + bestEvaluation.elementsCorrect,
      elementsTotal: s.elementsTotal + bestEvaluation.elementsTotal,
      wordsCorrect: s.wordsCorrect + (bestEvaluation.wordFullyCorrect ? 1 : 0),
      wordsTotal: s.wordsTotal + 1,
    }));

    setMistakes(bestEvaluation.newMistakes);
    setStats(bestEvaluation.newStats);

    setFeedback({ morphemes: bestEvaluation.morphemeFeedback, wordFullyCorrect: bestEvaluation.wordFullyCorrect });
    setShowFeedback(true);
  };

  const nextWord = () => {
    if (numWords > 0 && currentWordIndex >= quizWords.length - 1) {
      // End of quiz
      const newHistory = {
        elementsCorrect: history.elementsCorrect + score.elementsCorrect,
        elementsTotal: history.elementsTotal + score.elementsTotal,
        wordsCorrect: history.wordsCorrect + score.wordsCorrect,
        wordsTotal: history.wordsTotal + score.wordsTotal,
        sessions: [
          ...(history.sessions || []),
          {
            date: new Date().toISOString(),
            score,
            mistakes,
            stats,
          }
        ]
      };
      saveHistory(newHistory);
      setScreen("report");
    } else {
      let nextIdx = currentWordIndex + 1;
      if (numWords === 0 && nextIdx >= quizWords.length) {
        nextIdx = 0; // loop if continuous
      }
      setCurrentWordIndex(nextIdx);
      setUserAnswers([]);
      setShowFeedback(false);
      setFeedback(null);
    }
  };

  if (screen === "settings") {
    return (
      <div className="min-h-screen bg-parchment p-4 md:p-8 flex justify-center items-start font-serif text-amber-950">
        <Card className="w-full max-w-2xl bg-white/80 backdrop-blur border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-amber-900">
              Biblical Hebrew Morphology
            </CardTitle>
            <CardDescription className="text-amber-800/70">Configure your practice session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={language}
                onValueChange={(v: any) => setLanguage(v)}
              >
                <SelectTrigger>
                  <span className="flex-1 text-left">
                    {language === "H" ? "Hebrew Only" : language === "A" ? "Aramaic Only" : "Both"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="H">Hebrew Only</SelectItem>
                  <SelectItem value="A">Aramaic Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Part of Speech Filter</Label>
              <MultiSelect
                options={Object.entries(POS_CODES).map(([code, name]) => ({ label: name, value: code }))}
                selected={selectedPos}
                onChange={setSelectedPos}
                placeholder="All Parts of Speech"
              />
            </div>

            <div className="space-y-4">
              <Label>Frequency Range (1 - 6500)</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  type="number" 
                  value={minFrequency} 
                  onChange={(e) => setMinFrequency(Number(e.target.value))}
                  className="w-20 bg-white/50"
                  min={1}
                  max={maxFrequency}
                />
                <Slider
                  value={[minFrequency, maxFrequency]}
                  max={6500}
                  step={1}
                  onValueChange={(values) => {
                    setMinFrequency(values[0]);
                    setMaxFrequency(values[1]);
                  }}
                  className="flex-1"
                />
                <Input 
                  type="number" 
                  value={maxFrequency} 
                  onChange={(e) => setMaxFrequency(Number(e.target.value))}
                  className="w-20 bg-white/50"
                  min={minFrequency}
                  max={6500}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Number of Words</Label>
              <Select
                value={numWords.toString()}
                onValueChange={(v) => setNumWords(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 words</SelectItem>
                  <SelectItem value="10">10 words</SelectItem>
                  <SelectItem value="20">20 words</SelectItem>
                  <SelectItem value="50">50 words</SelectItem>
                  <SelectItem value="0">Continuous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="advanced-filters"
                checked={showAdvancedFilters}
                onCheckedChange={setShowAdvancedFilters}
              />
              <Label htmlFor="advanced-filters">Show Advanced Filters</Label>
            </div>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50/50 border border-amber-200 rounded-lg">
                <div className="space-y-2">
                  <Label>Verb Stem</Label>
                  <MultiSelect
                    options={Object.entries(
                      language === "A" ? VERB_STEMS_ARAMAIC : VERB_STEMS_HEBREW
                    ).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedStem}
                    onChange={setSelectedStem}
                    placeholder="All Stems"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verb Conjugation</Label>
                  <MultiSelect
                    options={Object.entries(VERB_CONJUGATION_TYPES).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedConjugation}
                    onChange={setSelectedConjugation}
                    placeholder="All Conjugations"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Person</Label>
                  <MultiSelect
                    options={Object.entries(PERSON_CODES).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedPerson}
                    onChange={setSelectedPerson}
                    placeholder="All Persons"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <MultiSelect
                    options={Object.entries(GENDER_CODES).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedGender}
                    onChange={setSelectedGender}
                    placeholder="All Genders"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number</Label>
                  <MultiSelect
                    options={Object.entries(NUMBER_CODES).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedNumber}
                    onChange={setSelectedNumber}
                    placeholder="All Numbers"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <MultiSelect
                    options={Object.entries(STATE_CODES).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedState}
                    onChange={setSelectedState}
                    placeholder="All States"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adjective Type</Label>
                  <MultiSelect
                    options={Object.entries(ADJECTIVE_TYPES).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedAdjectiveType}
                    onChange={setSelectedAdjectiveType}
                    placeholder="All Adjectives"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Noun Type</Label>
                  <MultiSelect
                    options={Object.entries(NOUN_TYPES).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedNounType}
                    onChange={setSelectedNounType}
                    placeholder="All Nouns"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pronoun Type</Label>
                  <MultiSelect
                    options={Object.entries(PRONOUN_TYPES).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedPronounType}
                    onChange={setSelectedPronounType}
                    placeholder="All Pronouns"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Suffix Type</Label>
                  <MultiSelect
                    options={Object.entries(SUFFIX_TYPES).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedSuffixType}
                    onChange={setSelectedSuffixType}
                    placeholder="All Suffixes"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Particle Type</Label>
                  <MultiSelect
                    options={Object.entries(PARTICLE_TYPES).map(([code, name]) => ({ label: name, value: code }))}
                    selected={selectedParticleType}
                    onChange={setSelectedParticleType}
                    placeholder="All Particles"
                  />
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label className="text-lg text-amber-900">Cumulative Stats</Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-amber-50/80 border border-amber-100 p-3 rounded-md">
                  <div className="text-amber-800/70">Words Fully Correct</div>
                  <div className="text-2xl font-bold text-amber-900">
                    {history.wordsCorrect} / {history.wordsTotal}
                  </div>
                </div>
                <div className="bg-amber-50/80 border border-amber-100 p-3 rounded-md">
                  <div className="text-amber-800/70">Elements Correct</div>
                  <div className="text-2xl font-bold text-amber-900">
                    {history.elementsCorrect} / {history.elementsTotal}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-200 text-amber-800 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                  onClick={() =>
                    saveHistory({
                      elementsCorrect: 0,
                      elementsTotal: 0,
                      wordsCorrect: 0,
                      wordsTotal: 0,
                      sessions: [],
                    })
                  }
                >
                  Clear History
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-amber-100 text-amber-900 hover:bg-amber-200"
                  onClick={() => setScreen("reports")}
                >
                  View Reports
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full text-lg h-12 bg-amber-700 hover:bg-amber-800 text-white" onClick={startQuiz}>
              Start Practice
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (screen === "quiz" && currentWord) {
    return (
      <div className="min-h-screen bg-parchment p-4 md:p-8 flex flex-col items-center font-serif text-amber-950">
        <div className="w-full max-w-3xl flex justify-between items-center mb-4">
          <Button variant="outline" className="bg-amber-100/50 border-amber-200 hover:bg-amber-200/50 text-amber-900" onClick={() => setScreen("settings")}>
            &larr; Settings
          </Button>
          <div className="text-sm font-medium text-amber-800/70">
            {numWords > 0
              ? `Word ${currentWordIndex + 1} of ${numWords}`
              : `Word ${currentWordIndex + 1}`}
          </div>
        </div>

        <Card className="w-full max-w-3xl mb-6 bg-white/80 backdrop-blur border-amber-200 shadow-lg">
          <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center">
            <div className="text-7xl hebrew-text mb-4 text-center leading-tight text-amber-950">
              {currentWord.word}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="text-sm bg-amber-100 text-amber-900 hover:bg-amber-200">
                Freq: {currentWord.frequency}
              </Badge>
              {currentWord.strongs && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge variant="secondary" className="text-sm bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer">
                      Strongs: {currentWord.strongs.length > 15 ? currentWord.strongs.substring(0, 15) + "..." : currentWord.strongs}
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-amber-50 border-amber-200 text-amber-950">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Strong's Numbers</h4>
                      <p className="text-sm text-amber-800/80 break-words">
                        {currentWord.strongs}
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="w-full max-w-3xl space-y-6">
          {currentWord.parsed_options[0].morphemes.map((morpheme, mIdx) => {
            const validOptions = getValidOptions(currentWord.parsed_options[0].language, userAnswers[mIdx] || {});
            return (
            <Card key={mIdx} className="border-amber-200 shadow-sm bg-white/60 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-amber-900">Morpheme {mIdx + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Part of Speech</Label>
                    <Select
                      disabled={showFeedback}
                      value={userAnswers[mIdx]?.pos || ""}
                      onValueChange={(v) => handleAnswerChange(mIdx, "pos", v)}
                    >
                      <SelectTrigger
                        className={
                          showFeedback
                            ? feedback?.morphemes[mIdx]?.pos?.correct
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select POS" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(POS_CODES)
                          .filter(([code]) => validOptions.pos.length === 0 || validOptions.pos.includes(code))
                          .map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showFeedback &&
                      !feedback?.morphemes[mIdx]?.pos?.correct && (
                        <div className="text-xs text-red-600 mt-1">
                          Expected: {feedback?.morphemes[mIdx]?.pos?.expected}
                        </div>
                      )}
                  </div>

                  {userAnswers[mIdx]?.pos === "V" && (
                    <>
                      <div className="space-y-1">
                        <Label>Verb Stem</Label>
                        <Select
                          disabled={showFeedback}
                          value={userAnswers[mIdx]?.stem || ""}
                          onValueChange={(v) =>
                            handleAnswerChange(mIdx, "stem", v)
                          }
                        >
                          <SelectTrigger
                            className={
                              showFeedback && feedback?.morphemes[mIdx]?.stem
                                ? feedback.morphemes[mIdx].stem.correct
                                  ? "border-green-500 bg-green-50"
                                  : "border-red-500 bg-red-50"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select Stem" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(VERB_STEMS_HEBREW)
                              .filter(([code]) => validOptions.stem.length === 0 || validOptions.stem.includes(code))
                              .map(
                              ([code, name]) => (
                                <SelectItem key={code} value={code}>
                                  {name}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        {showFeedback &&
                          feedback?.morphemes[mIdx]?.stem &&
                          !feedback.morphemes[mIdx].stem.correct && (
                            <div className="text-xs text-red-600 mt-1">
                              Expected: {feedback.morphemes[mIdx].stem.expected}
                            </div>
                          )}
                      </div>
                      <div className="space-y-1">
                        <Label>Conjugation</Label>
                        <Select
                          disabled={showFeedback}
                          value={userAnswers[mIdx]?.type || ""}
                          onValueChange={(v) =>
                            handleAnswerChange(mIdx, "type", v)
                          }
                        >
                          <SelectTrigger
                            className={
                              showFeedback && feedback?.morphemes[mIdx]?.type
                                ? feedback.morphemes[mIdx].type.correct
                                  ? "border-green-500 bg-green-50"
                                  : "border-red-500 bg-red-50"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select Conjugation" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(VERB_CONJUGATION_TYPES)
                              .filter(([code]) => validOptions.type.length === 0 || validOptions.type.includes(code))
                              .map(
                              ([code, name]) => (
                                <SelectItem key={code} value={code}>
                                  {name}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        {showFeedback &&
                          feedback?.morphemes[mIdx]?.type &&
                          !feedback.morphemes[mIdx].type.correct && (
                            <div className="text-xs text-red-600 mt-1">
                              Expected: {feedback.morphemes[mIdx].type.expected}
                            </div>
                          )}
                      </div>
                    </>
                  )}

                  {["A", "N", "P", "S", "T"].includes(userAnswers[mIdx]?.pos) && (
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <Select
                        disabled={showFeedback}
                        value={userAnswers[mIdx]?.type || ""}
                        onValueChange={(v) =>
                          handleAnswerChange(mIdx, "type", v)
                        }
                      >
                        <SelectTrigger
                          className={
                            showFeedback && feedback?.morphemes[mIdx]?.type
                              ? feedback.morphemes[mIdx].type.correct
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(
                            userAnswers[mIdx]?.pos === "A" ? ADJECTIVE_TYPES :
                            userAnswers[mIdx]?.pos === "N" ? NOUN_TYPES :
                            userAnswers[mIdx]?.pos === "P" ? PRONOUN_TYPES :
                            userAnswers[mIdx]?.pos === "S" ? SUFFIX_TYPES :
                            PARTICLE_TYPES
                          )
                            .filter(([code]) => validOptions.type.length === 0 || validOptions.type.includes(code))
                            .map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {showFeedback &&
                        feedback?.morphemes[mIdx]?.type &&
                        !feedback.morphemes[mIdx].type.correct && (
                          <div className="text-xs text-red-600 mt-1">
                            Expected: {feedback.morphemes[mIdx].type.expected}
                          </div>
                        )}
                    </div>
                  )}

                  {userAnswers[mIdx]?.pos === "R" && mIdx < currentWord.parsed_options[0].morphemes.length - 1 && (
                    <div className="space-y-1">
                      <Label>Definite Article?</Label>
                      <Select
                        disabled={showFeedback}
                        value={userAnswers[mIdx]?.type || "none"}
                        onValueChange={(v) =>
                          handleAnswerChange(mIdx, "type", v)
                        }
                      >
                        <SelectTrigger
                          className={
                            showFeedback && feedback?.morphemes[mIdx]?.type
                              ? feedback.morphemes[mIdx].type.correct
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="d">Yes</SelectItem>
                          <SelectItem value="none">No</SelectItem>
                        </SelectContent>
                      </Select>
                      {showFeedback &&
                        feedback?.morphemes[mIdx]?.type &&
                        !feedback.morphemes[mIdx].type.correct && (
                          <div className="text-xs text-red-600 mt-1">
                            Expected: {feedback.morphemes[mIdx].type.expected}
                          </div>
                        )}
                    </div>
                  )}

                  {(() => {
                    const isVerb = userAnswers[mIdx]?.pos === "V";
                    const isParticiple = isVerb && ["r", "s"].includes(userAnswers[mIdx]?.type);
                    const isInfinitive = isVerb && ["a", "c"].includes(userAnswers[mIdx]?.type);
                    const showPerson = ["P", "S"].includes(userAnswers[mIdx]?.pos) || (isVerb && !isParticiple && !isInfinitive);
                    const showGender = !isInfinitive;
                    const showNumber = !isInfinitive;
                    const showState = ["N", "A"].includes(userAnswers[mIdx]?.pos) || isParticiple;
                    const isProperNoun = userAnswers[mIdx]?.pos === "N" && userAnswers[mIdx]?.type === "p";
                    
                    return ["V", "N", "A", "P", "S"].includes(userAnswers[mIdx]?.pos) && !isProperNoun && (
                    <>
                      {showPerson && (
                        <div className="space-y-1">
                          <Label>Person</Label>
                          <Select
                            disabled={showFeedback}
                            value={userAnswers[mIdx]?.person || ""}
                            onValueChange={(v) =>
                              handleAnswerChange(mIdx, "person", v)
                            }
                          >
                            <SelectTrigger
                              className={
                                showFeedback &&
                                feedback?.morphemes[mIdx]?.person
                                  ? feedback.morphemes[mIdx].person.correct
                                    ? "border-green-500 bg-green-50"
                                    : "border-red-500 bg-red-50"
                                  : ""
                              }
                            >
                              <SelectValue placeholder="Select Person" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PERSON_CODES)
                                .filter(([code]) => validOptions.person.length === 0 || validOptions.person.includes(code))
                                .map(
                                ([code, name]) => (
                                  <SelectItem key={code} value={code}>
                                    {name}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          {showFeedback &&
                            feedback?.morphemes[mIdx]?.person &&
                            !feedback.morphemes[mIdx].person.correct && (
                              <div className="text-xs text-red-600 mt-1">
                                Expected:{" "}
                                {feedback.morphemes[mIdx].person.expected}
                              </div>
                            )}
                        </div>
                      )}

                      {showGender && (
                        <div className="space-y-1">
                          <Label>Gender</Label>
                          <Select
                            disabled={showFeedback}
                            value={userAnswers[mIdx]?.gender || ""}
                            onValueChange={(v) =>
                              handleAnswerChange(mIdx, "gender", v)
                            }
                          >
                            <SelectTrigger
                              className={
                                showFeedback && feedback?.morphemes[mIdx]?.gender
                                  ? feedback.morphemes[mIdx].gender.correct
                                    ? "border-green-500 bg-green-50"
                                    : "border-red-500 bg-red-50"
                                  : ""
                              }
                            >
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(GENDER_CODES)
                                .filter(([code]) => validOptions.gender.length === 0 || validOptions.gender.includes(code))
                                .map(
                                ([code, name]) => (
                                  <SelectItem key={code} value={code}>
                                    {name}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          {showFeedback &&
                            feedback?.morphemes[mIdx]?.gender &&
                            !feedback.morphemes[mIdx].gender.correct && (
                              <div className="text-xs text-red-600 mt-1">
                                Expected:{" "}
                                {feedback.morphemes[mIdx].gender.expected}
                              </div>
                            )}
                        </div>
                      )}

                      {showNumber && (
                        <div className="space-y-1">
                          <Label>Number</Label>
                          <Select
                            disabled={showFeedback}
                            value={userAnswers[mIdx]?.number || ""}
                            onValueChange={(v) =>
                              handleAnswerChange(mIdx, "number", v)
                            }
                          >
                            <SelectTrigger
                              className={
                                showFeedback && feedback?.morphemes[mIdx]?.number
                                  ? feedback.morphemes[mIdx].number.correct
                                    ? "border-green-500 bg-green-50"
                                    : "border-red-500 bg-red-50"
                                  : ""
                              }
                            >
                              <SelectValue placeholder="Select Number" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(NUMBER_CODES)
                                .filter(([code]) => validOptions.number.length === 0 || validOptions.number.includes(code))
                                .map(
                                ([code, name]) => (
                                  <SelectItem key={code} value={code}>
                                    {name}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          {showFeedback &&
                            feedback?.morphemes[mIdx]?.number &&
                            !feedback.morphemes[mIdx].number.correct && (
                              <div className="text-xs text-red-600 mt-1">
                                Expected:{" "}
                                {feedback.morphemes[mIdx].number.expected}
                              </div>
                            )}
                        </div>
                      )}

                      {showState && (
                        <div className="space-y-1">
                          <Label>State</Label>
                          <Select
                            disabled={showFeedback}
                            value={userAnswers[mIdx]?.state || ""}
                            onValueChange={(v) =>
                              handleAnswerChange(mIdx, "state", v)
                            }
                          >
                            <SelectTrigger
                              className={
                                showFeedback && feedback?.morphemes[mIdx]?.state
                                  ? feedback.morphemes[mIdx].state.correct
                                    ? "border-green-500 bg-green-50"
                                    : "border-red-500 bg-red-50"
                                  : ""
                              }
                            >
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATE_CODES)
                                .filter(([code]) => validOptions.state.length === 0 || validOptions.state.includes(code))
                                .map(
                                ([code, name]) => (
                                  <SelectItem key={code} value={code}>
                                    {name}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          {showFeedback &&
                            feedback?.morphemes[mIdx]?.state &&
                            !feedback.morphemes[mIdx].state.correct && (
                              <div className="text-xs text-red-600 mt-1">
                                Expected:{" "}
                                {feedback.morphemes[mIdx].state.expected}
                              </div>
                            )}
                        </div>
                      )}
                    </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
            );
          })}

          <div className="flex justify-end mt-6 pb-12">
            {!showFeedback ? (
              <Button size="lg" className="bg-amber-700 hover:bg-amber-800 text-white" onClick={checkAnswer}>
                Check Answer
              </Button>
            ) : (
              <Button size="lg" className="bg-amber-700 hover:bg-amber-800 text-white" onClick={nextWord}>
                Next Word
              </Button>
            )}
          </div>
        </div>

        <Dialog open={showFeedback} onOpenChange={(open) => { if (!open) nextWord(); }}>
          <DialogContent className="sm:max-w-md text-center bg-amber-50 border-amber-200">
            <DialogHeader>
              <DialogTitle className={feedback?.wordFullyCorrect ? "text-green-700 text-2xl" : "text-red-700 text-2xl"}>
                {feedback?.wordFullyCorrect ? "Correct!" : "Incorrect"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="text-5xl hebrew-text mb-6 text-amber-950">{currentWord.word}</div>
              {feedback?.morphemes.map((m: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="font-semibold text-lg text-amber-900">Morpheme {idx + 1}</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Object.entries(m).map(([field, data]: [string, any]) => (
                      <Badge 
                        key={field} 
                        variant="outline" 
                        className={data.correct ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}
                      >
                        {field}: {data.expected}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <Button size="lg" onClick={nextWord} className="w-full bg-amber-700 hover:bg-amber-800 text-white">
                Next Word
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (screen === "report") {
    return (
      <div className="min-h-screen bg-parchment p-4 md:p-8 flex justify-center items-start font-serif text-amber-950">
        <Card className="w-full max-w-2xl bg-white/80 backdrop-blur border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-amber-900">Session Report</CardTitle>
            <CardDescription className="text-amber-800/70">How you did this round</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/90 border border-amber-100 rounded-lg p-6 text-center shadow-sm">
                <div className="text-4xl font-bold text-amber-700 mb-2">
                  {Math.round(
                    (score.wordsCorrect / Math.max(1, score.wordsTotal)) * 100,
                  )}
                  %
                </div>
                <div className="text-sm text-amber-900/60 font-medium uppercase tracking-wider">
                  Words Perfect
                </div>
                <div className="mt-1 text-sm text-amber-900/80">
                  {score.wordsCorrect} of {score.wordsTotal}
                </div>
              </div>
              <div className="bg-white/90 border border-amber-100 rounded-lg p-6 text-center shadow-sm">
                <div className="text-4xl font-bold text-green-700 mb-2">
                  {Math.round(
                    (score.elementsCorrect / Math.max(1, score.elementsTotal)) *
                      100,
                  )}
                  %
                </div>
                <div className="text-sm text-amber-900/60 font-medium uppercase tracking-wider">
                  Elements Correct
                </div>
                <div className="mt-1 text-sm text-amber-900/80">
                  {score.elementsCorrect} of {score.elementsTotal}
                </div>
              </div>
            </div>

            {(Object.keys(mistakes.pos).length > 0 || Object.keys(mistakes.stem).length > 0) && (
              <div className="space-y-4 pt-4 border-t border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900">Areas for Improvement</h3>
                {Object.keys(mistakes.pos).length > 0 && (
                  <div className="bg-red-50/80 p-4 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">Parts of Speech</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-red-800">
                      {Object.entries(mistakes.pos)
                        .sort((a, b) => Number(b[1]) - Number(a[1]))
                        .map(([name, count]) => (
                          <li key={name}>
                            {name}: {count} mistake{count !== 1 ? 's' : ''}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {Object.keys(mistakes.stem).length > 0 && (
                  <div className="bg-orange-50/80 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-900 mb-2">Verb Stems</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-orange-800">
                      {Object.entries(mistakes.stem)
                        .sort((a, b) => Number(b[1]) - Number(a[1]))
                        .map(([name, count]) => (
                          <li key={name}>
                            {name}: {count} mistake{count !== 1 ? 's' : ''}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-amber-700 hover:bg-amber-800 text-white"
              size="lg"
              onClick={() => setScreen("settings")}
            >
              Return to Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (screen === "reports") {
    const sessionData = (history.sessions || []).map((s: any, idx: number) => ({
      name: `Session ${idx + 1}`,
      wordsCorrect: Math.round((s.score.wordsCorrect / Math.max(1, s.score.wordsTotal)) * 100),
      elementsCorrect: Math.round((s.score.elementsCorrect / Math.max(1, s.score.elementsTotal)) * 100),
      date: new Date(s.date).toLocaleDateString(),
    }));

    const allStats: Record<string, Record<string, { correct: number; total: number }>> = {
      pos: {}, stemH: {}, stemA: {}, conjugation: {}, adjective: {}, noun: {}, pronoun: {}, suffix: {}, state: {}, person: {}, gender: {}, number: {}, particle: {}
    };

    (history.sessions || []).forEach((s: any) => {
      if (s.stats) {
        Object.keys(s.stats).forEach(cat => {
          if (!allStats[cat]) allStats[cat] = {};
          Object.keys(s.stats[cat]).forEach(key => {
            if (!allStats[cat][key]) allStats[cat][key] = { correct: 0, total: 0 };
            allStats[cat][key].correct += s.stats[cat][key].correct;
            allStats[cat][key].total += s.stats[cat][key].total;
          });
        });
      }
    });

    const renderStatChart = (title: string, dataObj: Record<string, { correct: number; total: number }>, color: string) => {
      const data = Object.entries(dataObj)
        .map(([name, { correct, total }]) => ({
          name,
          accuracy: Math.round((correct / Math.max(1, total)) * 100),
          total
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 15);

      if (data.length === 0) return null;

      return (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value, name, props) => [`${value}% (${props.payload.total} total)`, 'Accuracy']} />
                  <Bar dataKey="accuracy" name="Accuracy" fill={color} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      );
    };

    return (
      <div className="min-h-screen bg-parchment p-4 md:p-8 flex flex-col items-center font-serif text-amber-950">
        <div className="w-full max-w-5xl flex justify-between items-center mb-6">
          <Button variant="outline" className="bg-amber-100/50 border-amber-200 hover:bg-amber-200/50 text-amber-900" onClick={() => setScreen("settings")}>
            &larr; Settings
          </Button>
          <h2 className="text-3xl font-bold text-amber-900">Performance Reports</h2>
          <div className="w-24"></div>
        </div>

        <div className="w-full max-w-5xl space-y-8">
          <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-amber-900">Accuracy Over Time</CardTitle>
              <CardDescription>Your percentage of correct answers across sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionData.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                      <XAxis dataKey="name" stroke="#475569" />
                      <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} stroke="#475569" />
                      <Tooltip formatter={(value) => `${value}%`} labelFormatter={(label, payload) => payload[0]?.payload.date} contentStyle={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d' }} />
                      <Legend />
                      <Line type="monotone" dataKey="wordsCorrect" name="Words Perfect" stroke="#b45309" strokeWidth={3} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="elementsCorrect" name="Elements Correct" stroke="#15803d" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-amber-700/60">
                  No session data available yet. Complete a practice session to see your progress!
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {renderStatChart("Part of Speech", allStats.pos, "#0284c7")}
            {renderStatChart("Hebrew Verb Stems", allStats.stemH, "#b45309")}
            {renderStatChart("Aramaic Verb Stems", allStats.stemA, "#b45309")}
            {renderStatChart("Verb Conjugations", allStats.conjugation, "#0f766e")}
            {renderStatChart("Adjective Types", allStats.adjective, "#6d28d9")}
            {renderStatChart("Noun Types", allStats.noun, "#be185d")}
            {renderStatChart("Pronoun Types", allStats.pronoun, "#c2410c")}
            {renderStatChart("Suffix Types", allStats.suffix, "#4d7c0f")}
            {renderStatChart("State", allStats.state, "#0369a1")}
            {renderStatChart("Person", allStats.person, "#a21caf")}
            {renderStatChart("Gender", allStats.gender, "#b91c1c")}
            {renderStatChart("Number", allStats.number, "#1d4ed8")}
            {renderStatChart("Particle Types", allStats.particle, "#4338ca")}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
