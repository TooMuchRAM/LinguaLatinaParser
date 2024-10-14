import LinguaLatinaParser from "./LinguaLatinaParser";

const llParser = new LinguaLatinaParser();
llParser.parse("canis ad litus ambulat").then((traces) => {
    console.log(traces);
    console.log("Parsed!");
});