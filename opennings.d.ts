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
export declare type DenVTydnu = {
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
export declare type CasovaSpecifikace = {
    počet_opakování?: number;
    věc: Vec;
    den_v_týdnu?: DenVTydnu[];
    časová_doba?: CasovaDoba[];
    časový_interval?: CasovyInterval[];
    časový_okamžik?: CasovyOkamzik[];
    časová_platnost?: CasovaSpecifikace[];
    časové_období?: CasoveObdobi[];
    frekvence?: Frekvence[];
    jiná_časová_specifikace?: JinaCasovaSpecifikace[];
    specifická_frekvence?: SpecifickaFrekvence[];
    výjimka?: CasovaSpecifikace[];
};
export declare function toString(input: CasovaSpecifikace): Promise<string>;
