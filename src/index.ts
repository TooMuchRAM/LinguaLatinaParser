import LinguaLatinaParser from "./LinguaLatinaParser";

const llParser = new LinguaLatinaParser();
llParser.parse("deus sum").then(() => {
    console.log("Parsed!");
});