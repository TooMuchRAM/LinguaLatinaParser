import {CASES, GENDERS, MOODS, NUMBERS, PERSONS, TENSES, VOICES} from "./constants";

const latinGrammar = String.raw`
<person> ::= "${PERSONS.FIRST}" | "${PERSONS.SECOND}" | "${PERSONS.THIRD}";
<gender> ::= "${GENDERS.MASCULINE}" | "${GENDERS.FEMININE}" | "${GENDERS.NEUTER}";
<number> ::= "${NUMBERS.SINGULAR}" | "${NUMBERS.PLURAL}";
<case> ::= "${CASES.NOMINATIVE}" | "${CASES.GENITIVE}" | "${CASES.DATIVE}" | "${CASES.ACCUSATIVE}" | "${CASES.ABLATIVE}";
<tense> ::= "${TENSES.PRAESENS}" | "${TENSES.PERFECTUM}" | "${TENSES.IMPERFECTUM}" | "${TENSES.FUTURUM}" | "${TENSES.PLUSQUAMPERFECTUM}" | "${TENSES.FUTURUMEXACTUM}";
<mood> ::= "${MOODS.INDICATIVE}" | "${MOODS.SUBJUNCTIVE}" | "${MOODS.IMPERATIVE}";
<voice> ::= "${VOICES.ACTIVE}" | "${VOICES.PASSIVE}";

<noun(<gender>, <number>, <case>)>;
<adjective(<gender>, <number>, <case>)>;
<verb(<person>, <number>, <tense>, <mood>, <voice>)>;
<subject> ::= <noun(<gender>, <number>, "${CASES.NOMINATIVE}")>;
<adclause> ::= "ad", {..<adjective(<gender>, <number>, "${CASES.ACCUSATIVE}")>..}, <noun(<gender>, <number>, "${CASES.ACCUSATIVE}")>;
<sentence> ::= [..<subject>..], [..<adclause>..], ..<verb(<person>, <number>, <tense>, <mood>, <voice>)>.., ...;
`;

export default latinGrammar;
