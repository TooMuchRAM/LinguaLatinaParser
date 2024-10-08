export const perseusEndpoint =
    (word: string): string =>
        `https://services.perseids.org/bsp/morphologyservice/analysis/word?lang=lat&engine=morpheuslat&word=${word}`;

export enum CASES {
    NOMINATIVE = "nominative",
    GENITIVE = "genitive",
    DATIVE = "dative",
    ACCUSATIVE = "accusative",
    ABLATIVE = "ablative",
}

export enum TENSES {
    PRAESENS = "present",
    PERFECTUM = "perfectum",
    IMPERFECTUM = "imperfectum",
    FUTURUM = "futurum",
    PLUSQUAMPERFECTUM = "pluperfect",
    FUTURUMEXACTUM = "futureperfect",
}

export enum MOODS {
    INDICATIVE = "indicative",
    SUBJUNCTIVE = "subjunctive",
    IMPERATIVE = "imperative",
}

export enum VOICES {
    ACTIVE = "active",
    PASSIVE = "passive",
}

export enum NUMBERS {
    SINGULAR = "singular",
    PLURAL = "plural",
}

export enum PERSONS {
    FIRST = "first",
    SECOND = "second",
    THIRD = "third",
}

export enum GENDERS {
    MASCULINE = "masculine",
    FEMININE = "feminine",
    NEUTER = "neuter",
}