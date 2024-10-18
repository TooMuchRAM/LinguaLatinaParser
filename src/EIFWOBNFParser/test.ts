import LinguaLatinaParser from "../LinguaLatinaParser";

const llParser = new LinguaLatinaParser();
llParser.parse("discipuli hominem parvum abutere dicunt").then(
    (result) => {
        console.log(llParser);
        console.log(result);
    }
);