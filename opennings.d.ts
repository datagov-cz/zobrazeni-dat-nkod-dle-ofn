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
export declare class DenVTydnu {
    den_v_týdnu: DenVTydnuType;
    constructor(den_v_týdnu: DenVTydnuType);
    denotateDayOfWeek(): Promise<string>;
}
export declare class CasovaSpecifikace {
    casovaSpecifikace: CasovaSpecifikaceType;
    constructor(casovaSpecifikace: CasovaSpecifikaceType);
    isOpen(moment: Date): boolean;
    toString(): Promise<string>;
    presentFields(): string[];
    createPattern(): Pattern;
}
declare type IriPromise = {
    iri: string;
    promise: Promise<string>;
    resolved: string;
};
declare class Pattern {
    pattern: string;
    iriPromises: IriPromise[];
    constructor(pattern: string);
    addResource(iri: string, resolver: Promise<string>): void;
    performReplace(): string;
}
export declare function isOpen(timeSpecs: CasovaSpecifikace[], moment: Date): boolean;
export {};
