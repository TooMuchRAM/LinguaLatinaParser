import EIFWOBNFParser from "./EIFWOBNFParser/eifwobnfParser";

const parser = new EIFWOBNFParser();
const tree = parser.parse(String.raw`
<person> ::= "first" | "second" | "third";
<gender> ::= "masculine" | "feminine" | "neuter";
<number> ::= "singular" | "plural";
<case> ::= "nominative" | "genitive" | "dative" | "accusative" | "ablative";
<tense> ::= "praesens" | "perfectum" | "imperfectum" | "futurum" | "plusquamperfectum" | "futurumexactum";
<mood> ::= "indicative" | "subjunctive" | "imperative";
<voice> ::= "active" | "passive";

<noun(<gender>, <number>, <case>)>;
<adjective(<gender>, <number>, <case>)>;
<verb(<person>, <number>, <tense>, <mood>, <voice>)>;
<subject> ::= <noun(<gender>, <number>, "nominative")>;
<adclause> ::= "ad", {..<adjective(<gender>, <number>, "accusative")>..}, <noun(<gender>, <number>, "accusative")>;
<sentence> ::= [<subject>], [<adclause>], <verb(<person>, <number>, <tense>, <mood>, <voice>)>;
`);

console.log(tree.toString());