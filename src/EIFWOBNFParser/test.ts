import LinguaLatinaParser from "../LinguaLatinaParser";

const llParser = new LinguaLatinaParser();
llParser.parse("discipuli parvum hominem esse dicunt").then(
    (result) => {
        console.log(result);
    }
);