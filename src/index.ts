import LinguaLatinaParser from "./LinguaLatinaParser";

const llParser = new LinguaLatinaParser();
llParser.parse("ad litus ambulo").then(() => {
    console.log("Parsed!");
});