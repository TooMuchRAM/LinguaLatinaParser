import {perseusEndpoint} from "./constants";
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

    public settings: (output: PerseusLemmatiserOutput) => GTNode;

    constructor(settings: (output: PerseusLemmatiserOutput) => GTNode) {
        this.settings = settings;
    }

    public async lemmatise(
        word: string,
    ): Promise<GTNodeChildren> {
        const response = await fetch(this.perseusEndpoint(word));
        const json = await response.json();
        const returnValue = new OR(new SEQ<GTNode>());

        if (!json["RDF"] || !json["RDF"]["Annotation"] || !json["RDF"]["Annotation"]["Body"]) return new OR(new SEQ<GTNode>());
        if (!Array.isArray(json["RDF"]["Annotation"]["Body"])) {
            const output = this.getOutputFromBody(json["RDF"]["Annotation"]["Body"], word);
            if (output) returnValue.push(...output);
        } else {
            json["RDF"]["Annotation"]["Body"].forEach((body: any) => {
                returnValue.push(...this.getOutputFromBody(body, word));
            });
        }

        return returnValue.filter((x: SEQ<GTNode>) => x.length !== 0);
    }

    private getOutputFromBody(body: any, word: string): GTNodeChildren {
        if (!body["rest"]["entry"]["infl"]) return new OR(new SEQ<GTNode>());
        if (!Array.isArray(body["rest"]["entry"]["infl"])) {
            return new OR(new SEQ(
                this.settings(this.getOutputFromInflections(
                    body["rest"]["entry"]["infl"],
                    word
                ))
            ));
        } else {
            return body["rest"]["entry"]["infl"].map((infl: any) => {
                if (!infl["term"]) return new SEQ<GTNode>();
                const output: PerseusLemmatiserOutput = this.getOutputFromInflections(infl, word);
                return (new SEQ(this.settings(output)));
            }).filter((x: SEQ<GTNode>) => x.length !== 0);
        }
    }

    private getOutputFromInflections(infl: any, word: string): PerseusLemmatiserOutput {
        infl = this.flattenDollarKey(infl);
        return {
            pos: infl["pofs"],
            lemma: word,
            inflection: infl
        };
    }

    private flattenDollarKey(json: any): any {
        if (Array.isArray(json)) {
            return json.map(this.flattenDollarKey); // Recursively transform each item in the array
        } else if (typeof json === 'object' && json !== null) {
            // Check if the object contains only the "$" key (and optionally other keys like "order")
            if ('$' in json && Object.keys(json).length <= 2) {
                return json['$']; // Replace the object with the value of "$"
            } else {
                // Recursively apply the transformation to all key-value pairs
                const transformedObject: any = {};
                for (const key in json) {
                    transformedObject[key] = this.flattenDollarKey(json[key]);
                }
                return transformedObject;
            }
        } else {
            return json; // Return non-object values (e.g., strings, numbers) as they are
        }
    }
}