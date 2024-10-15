import LinguaLatinaParser from "../LinguaLatinaParser";

const llParser = new LinguaLatinaParser();
llParser.parse("ad litus canis ambulat").then(
    (result) => {
        console.log(result);
    }
);