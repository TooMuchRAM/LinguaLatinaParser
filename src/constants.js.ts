export const perseusEndpoint =
    (word: string): string =>
        `https://services.perseids.org/bsp/morphologyservice/analysis/word?lang=lat&engine=morpheuslat&word=${word}`;