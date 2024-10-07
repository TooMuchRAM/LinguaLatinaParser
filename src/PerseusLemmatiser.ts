import {perseusEndpoint} from "./constants";
import {XMLParser} from "fast-xml-parser";
import GTNodeChildren from "./EIFWOBNFParser/GrammarTree/GTNodeChildren";
import GTNode from "./EIFWOBNFParser/GrammarTree/GTNode";
import OR from "./EIFWOBNFParser/GrammarTree/OR";
import SEQ from "./EIFWOBNFParser/GrammarTree/SEQ";

export interface PerseusLemmatiserOutput {
    pos: "conjunction" | "exclamation" | "verb" | "adjective" | "noun" | "numeral" | "pronoun" | "preposition" | "adverb";
    lemma: string;
    inflection: { [key: string]: string };
}

export default class PerseusLemmatiser {
    private perseusEndpoint = perseusEndpoint;
    private xmlParser = new XMLParser({
        preserveOrder: false
    });

    public settings: (output: PerseusLemmatiserOutput) => GTNode;

    constructor(settings: (output: PerseusLemmatiserOutput) => GTNode) {
        this.settings = settings;
    }

    public async lemmatise(
        word: string,
    ): Promise<GTNodeChildren> {
        const response = await fetch(this.perseusEndpoint(word));
        const text = await response.text();
        const returnValue = new OR(new SEQ<GTNode>());
        const json = this.xmlParser.parse(text);

        if (!json["RDF"] || !json["RDF"]["Annotation"] || !json["RDF"]["Annotation"]["Body"]) return [];
        json["RDF"]["Annotation"]["Body"].forEach((body: any) => {
            if (!body["rest"]["entry"]["infl"]) return;
            body["rest"]["entry"]["infl"].forEach((infl: any) => {
                if (!infl["term"]) return;
                const output: PerseusLemmatiserOutput = {
                    pos: infl["pos"],
                    lemma: word,
                    inflection: infl
                };
                returnValue.push(new SEQ(this.settings(output)));
            });
        });
        return json;
    }
}