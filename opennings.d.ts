export declare type Vec = {
    iri: string;
    název: string;
};
export declare type CasovaDoba = {
    čas: string;
    od: string;
    do: string;
};
export declare type CasovyInterval = {
    začátek: string;
    konec: string;
};
export declare type CasovyOkamzik = {
    datum: string;
    datum_a_čas: string;
};
export declare type CasoveObdobi = {
    iri: string;
};
export declare type DenVTydnuType = {
    iri: string;
};
export declare type Frekvence = {
    iri: string;
};
export declare type JinaCasovaSpecifikace = {
    iri: string;
};
export declare type SpecifickaFrekvence = {
    minuta: number;
    hodina: number;
    den_v_měsíci: number;
    týden_v_měsíci: number;
    týden_v_roce: number;
    rok_v_desetiletí: number;
    rok_ve_století: number;
};
export declare type CasovaSpecifikaceType = {
    počet_opakování?: number;
    věc: Vec;
    den_v_týdnu?: DenVTydnuType[];
    časová_doba?: CasovaDoba[];
    časový_interval?: CasovyInterval[];
    časový_okamžik?: CasovyOkamzik[];
    časová_platnost?: CasovaSpecifikaceType[];
    časové_období?: CasoveObdobi[];
    frekvence?: Frekvence[];
    jiná_časová_specifikace?: JinaCasovaSpecifikace[];
    specifická_frekvence?: SpecifickaFrekvence[];
    výjimka?: CasovaSpecifikaceType[];
};
declare enum Properties {
    počet_opakování = "po\u010Det_opakov\u00E1n\u00ED",
    den_v_týdnu = "den_v_t\u00FDdnu",
    časová_doba = "\u010Dasov\u00E1_doba",
    časový_interval = "\u010Dasov\u00FD_interval",
    časový_okamžik = "\u010Dasov\u00FD_okam\u017Eik",
    časová_platnost = "\u010Dasov\u00E1_platnost",
    časové_období = "\u010Dasov\u00E9_obdob\u00ED",
    frekvence = "frekvence",
    jiná_časová_specifikace = "jin\u00E1_\u010Dasov\u00E1_specifikace",
    specifická_frekvence = "specifick\u00E1_frekvence",
    výjimka = "v\u00FDjimka"
}
export declare class DenVTydnu {
    den_v_týdnu: DenVTydnuType;
    constructor(den_v_týdnu: DenVTydnuType);
    denotateDayOfWeek(): Promise<string>;
}
declare type IriPromise = {
    iri: string;
    promise: Promise<string>;
    resolved: string;
};
export declare class CasovaSpecifikace {
    casovaSpecifikace: CasovaSpecifikaceType;
    constructor(casovaSpecifikace: CasovaSpecifikaceType);
    validMoment(moment: Date): boolean;
    toString(): Promise<string>;
    presentFields(): string[];
    hasProperty(property: Properties): boolean;
    createPattern(): Pattern;
}
export declare class Pattern {
    pattern: string;
    iriPromises: IriPromise[];
    constructor(pattern: string);
    addResource(iri: string, resolver: Promise<string>): void;
    performReplace(): string;
}
export declare function isInSpecifications(timeSpecs: CasovaSpecifikace[], moment: Date): boolean;
export declare function specToString(input: string): Promise<string>;
export {};
