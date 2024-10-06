import EIFWOBNFParser from "./EIFWOBNFParser/eifwobnfParser";

const parser = new EIFWOBNFParser();
const tree = parser.parse(String.raw`
<person> ::= "first" | "second" | "third";
<number> ::= "singular" | "plural";
<case> ::= "nominative" | "genitive" | "dative" | "accusative" | "ablative";
<noun(<person>, <number>, <case>)>;
<adjective(<person>, <number>, <case>)>;
<adclause> ::= "ad", ..[<adjective(<person>, <number>, "accusative")>].., <noun(<person>, <number>, "accusative")>;
`);

console.log(tree.toString());