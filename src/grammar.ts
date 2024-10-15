import {CASES, GENDERS, MOODS, NUMBERS, PERSONS, TENSES, VOICES} from "./constants";

const latinGrammar = String.raw`
<person> ::= "${PERSONS.FIRST}" | "${PERSONS.SECOND}" | "${PERSONS.THIRD}";
<gender> ::= "${GENDERS.MASCULINE}" | "${GENDERS.FEMININE}" | "${GENDERS.NEUTER}";
<number> ::= "${NUMBERS.SINGULAR}" | "${NUMBERS.PLURAL}";
<case> ::= "${CASES.NOMINATIVE}" | "${CASES.GENITIVE}" | "${CASES.DATIVE}" | "${CASES.ACCUSATIVE}" | "${CASES.ABLATIVE}" | "${CASES.VOCATIVE}";
<tense> ::= "${TENSES.PRAESENS}" | "${TENSES.PERFECTUM}" | "${TENSES.IMPERFECTUM}" | "${TENSES.FUTURUM}" | "${TENSES.PLUSQUAMPERFECTUM}" | "${TENSES.FUTURUMEXACTUM}";
<mood> ::= "${MOODS.INDICATIVE}" | "${MOODS.SUBJUNCTIVE}" | "${MOODS.IMPERATIVE}";
<voice> ::= "${VOICES.ACTIVE}" | "${VOICES.PASSIVE}";

<noun(<gender>, <number>, <case>)>;
<adjective(<gender>, <number>, <case>)>;
<verb(<person>, <number>, <tense>, <mood>, <voice>)>;

<participium(<gender>, <number>, <case>)>;
<gerund(<gender>, <number>, <case>)>;
<gerundive(<gender>, <number>, <case>)>;

<persnpron(<gender>, <number>, <case>)>;
<reflxpron(<gender>, <number>, <case>)>;
<demstpron(<gender>, <number>, <case>)>;
<relatpron(<gender>, <number>, <case>)>;
<indefpron(<gender>, <number>, <case>)>;

<nounlike(<gender>, <number>, <case>)> ::=
<noun(<gender>, <number>, <case>)>
| <persnpron(<gender>, <number>, <case>)>
| <reflxpron(<gender>, <number>, <case>)>
| <demstpron(<gender>, <number>, <case>)>
| <relatpron(<gender>, <number>, <case>)>
| <indefpron(<gender>, <number>, <case>)>
| <gerund("${GENDERS.NEUTER}", "${NUMBERS.SINGULAR}", <case>)>;

<adjectivelike(<gender>, <number>, <case>)> ::= 
<adjective(<gender>, <number>, <case>)> 
| <demstpron(<gender>, <number>, <case>)>
| <indefpron(<gender>, <number>, <case>)>
| <gerundive(<gender>, <number>, <case>)>
| <participium(<gender>, <number>, <case>)>;

<nounphrase(<gender>, <number>, <case>)> ::= {..<adjectivelike(<gender>, <number>, <case>)>..}, <nounlike(<gender>, <number>, <case>)>;

<ad>;
<ante>;
<apud>;
<inter>;
<iuxta>;
<per>;
<post>;
<ab>;
<a>;
<coram>;
<cum>;
<de>;
<e>;
<ex>;
<pre>;
<pro>;
<sine>;
<in>;
<super>;
<prepositionsacc> ::= (<ad> | <ante> | <apud>  | <inter>
    | <iuxta> | <per> | <post> | <in> | <super>), 
    <nounphrase(<gender>, <number>, "accusative")>;
<prepositionsabl> ::= (<a> | <ab> | <coram> | <cum> 
    | <de> | <e> | <ex> | <pre> | <pro> 
    | <sine> | <in> | <super>), 
    <nounphrase(<gender>, <number>, "ablative")>;

<preposition> ::= <prepositionsacc> | <prepositionsabl>;

<subject> ::= <nounphrase(<gender>, <number>, "nominative")>;
<object> ::= <nounphrase(<gender>, <number>, "accusative")>;
<verbphrase> ::= <verb(<person>, <number>, <tense>, <mood>, <voice>)>;

<sentence> ::= [..<subject>..], [..<object>..], [..<preposition>..], ..<verbphrase>..;
`;

export default latinGrammar;
