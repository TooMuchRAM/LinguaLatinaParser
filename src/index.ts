import LinguaLatinaParser from "./LinguaLatinaParser";

const llParser = new LinguaLatinaParser();
llParser.parse("bonus canis").then(() => {
    console.log("Parsed!");
});