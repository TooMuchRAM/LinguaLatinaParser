import GrammarTree from "./EIFWOBNFParser/GrammarTree/GrammarTree";
import EIFWOBNFParser from "./EIFWOBNFParser/eifwobnfParser";
import latinGrammar from "./grammar";
import {split} from "sentence-splitter";
import GTNodeChildren from "./EIFWOBNFParser/GrammarTree/GTNodeChildren";
import PerseusLemmatiser, {PerseusLemmatiserOutput} from "./PerseusLemmatiser";
import GTNode from "./EIFWOBNFParser/GrammarTree/GTNode";
import OR from "./EIFWOBNFParser/GrammarTree/OR";
import SEQ from "./EIFWOBNFParser/GrammarTree/SEQ";
import GTTextLeaf from "./EIFWOBNFParser/GrammarTree/GTTextLeaf";

export default class LinguaLatinaParser {
    private eifwobnfParser: EIFWOBNFParser = new EIFWOBNFParser();
    private grammarTree: GrammarTree;
    private lemmatiser: PerseusLemmatiser = new PerseusLemmatiser(this.perseusOutputToNode);

    constructor() {
        this.grammarTree = this.eifwobnfParser.parse(latinGrammar);
    }

    public async parse(input: string): Promise<void> {
        const sentences = this.splitSentences(input);
        const lemmatised: GTNodeChildren = new OR();
        for (const sentence of sentences) {
            lemmatised.push(...await this.lemmatise(sentence));
        }
        for (const lemmatisedSentence of lemmatised) {
            this.grammarTree.parse(lemmatisedSentence);
        }
    }

    private splitSentences(input: string): string[] {
        const splits = split(input);
        return splits.map(split => split.raw);
    }

    private tokenise(input: string): string[] {
        return input.split(" ");
    }

    private async lemmatise(sentence: string): Promise<GTNodeChildren> {
        const tokens = this.tokenise(sentence);
        let children = new OR<SEQ<GTNode>>();
        for (const token of tokens) {
            const lemmatised = await this.lemmatiser.lemmatise(token);
            if (children.length == 0) {
                children = lemmatised;
            } else {
                const childrenLength = children.length;
                if (lemmatised.length > 1) {
                    const slice = children.slice(0);
                    for (let i = 1; i<lemmatised.length; i++) {
                        children.push(...structuredClone(slice));
                    }
                }
                if (lemmatised.length > childrenLength) {
                    for(let i = 0; i<lemmatised.length; i++) {
                        for (let j = 0; j<childrenLength; j++) {
                            const pushAt = j*(childrenLength-1) + i;
                            children[pushAt].push(...lemmatised[i]);
                        }
                    }
                } else {
                    for (let i = 0; i < childrenLength; i++) {
                        for (let j = 0; j < lemmatised.length; j++) {
                            const pushAt = j*(childrenLength-1) + i;
                            children[pushAt].push(...lemmatised[j]);
                        }
                    }
                }

            }
        }
        return children;
    }

    private perseusOutputToNode(output: PerseusLemmatiserOutput): GTNode {
        // TODO: filter out vocatives
        const node: GTNode = (() => {
            switch (output.pos) {
                case "conjunction":
                    return new GTNode(output.lemma);
                case "exclamation":
                    return new GTNode(output.lemma);
                case "verb":
                    // <verb(<person>, <number>, <tense>, <mood>, <voice>)>;
                    // TODO: handle verbs with arguments (accusative, dative, genitive, etc.)
                    // TODO: handle esse
                    // TODO: handle infinitives
                    return new GTNode(
                        `verb"${output.inflection["pers"]}""${output.inflection["num"]}""${output.inflection["tense"]}""${output.inflection["mood"]}""${output.inflection["voice"]}"`
                    );
                case "adjective":
                    // <adjective(<gender>, <number>, <case>)>;
                    // TODO: handle adjectives with arguments (accusative, dative, genitive, etc.)
                    return new GTNode(
                        `adjective"${output.inflection["gend"]}""${output.inflection["num"]}""${output.inflection["case"]}"`
                    );
                case "noun":
                    // <noun(<gender>, <number>, <case>)>;
                    return new GTNode(
                        `noun"${output.inflection["gend"]}""${output.inflection["num"]}""${output.inflection["case"]}"`
                    );
                case "numeral":
                    return new GTNode(output.lemma);
                case "pronoun":
                    // TODO: properly research how pronouns are used in Latin
                    // A case distinction is probably already possible, classifying pronouns as nouns and adjectives
                    return new GTNode("pronoun");
                case "preposition":
                    return new GTNode(output.lemma);
                case "adverb":
                    return new GTNode("adverb");
            }
        })();

        node.children = new OR(new SEQ<GTNode>(
            new GTTextLeaf(output.lemma)
        ));

        return node;
    }
}