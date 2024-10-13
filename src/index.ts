import LinguaLatinaParser from "./LinguaLatinaParser";

const llParser = new LinguaLatinaParser();
llParser.parse("canis ad litus ambulat").then(() => {
    console.log("Parsed!");
});