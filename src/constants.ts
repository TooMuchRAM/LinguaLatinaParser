export const perseusEndpoint =
    (word: string): string =>
        `https://services.perseids.org/bsp/morphologyservice/analysis/word?lang=lat&engine=morpheuslat&word=${word}`;

export enum CASES {
    NOMINATIVE = "nominative",
    GENITIVE = "genitive",
    DATIVE = "dative",
    ACCUSATIVE = "accusative",
    ABLATIVE = "ablative",
    VOCATIVE = "vocative",
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
    INFINITIVE = "infinitive",
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
    FIRST = "1st",
    SECOND = "2nd",
    THIRD = "3rd",
}

export enum GENDERS {
    MASCULINE = "masculine",
    FEMININE = "feminine",
    NEUTER = "neuter",
}