import LinguaLatinaParser from "./LinguaLatinaParser";

const llParser = new LinguaLatinaParser();
llParser.parse("canis bonus ad litus pulcher depressum currit").then(
    (result) => {
        console.log(result);
    }
);