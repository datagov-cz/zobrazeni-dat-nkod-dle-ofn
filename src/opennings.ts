import {loadFromSPARQL} from "./common";

export type Vec = {
    iri: string;
    název: string;
}

export type CasovaDoba = {
    čas: string;
    od: string;
    do: string;
}
export type CasovyInterval = {
    začátek: string;
    konec: string;
}
export type CasovyOkamzik = {
    datum: string;
    datum_a_čas: string;
}
export type CasoveObdobi = {
    iri: string;
}

export type DenVTydnu = {
    iri: string;
}

export type Frekvence = {
    iri: string;
}
export type JinaCasovaSpecifikace = {
    iri: string;
}
export type SpecifickaFrekvence = {
    minuta: number;
    hodina: number;
    den_v_měsíci: number;
    týden_v_měsíci: number;
    týden_v_roce: number;
    rok_v_desetiletí: number;
    rok_ve_století: number;
}
export type CasovaSpecifikace = {
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

}

function denotateDayOfWeek(iri: string): Promise<string> {
    return loadFromSPARQL(
        "https://data.mvcr.gov.cz/sparql",
        `SELECT ?o WHERE {
            <${iri}> 
            <http://www.w3.org/2004/02/skos/core#prefLabel> 
            ?o.
        FILTER(LANG(?o) = "" || LANGMATCHES(LANG(?o), "cs"))
        }`,
        false).then(o => String(o[0].o.value));
}

type IriPromise = {
    iri: string;
    promise: Promise<string>
    resolved: string;
}

class Pattern {
    pattern = "";
    iriPromises: IriPromise[] = [];


    constructor(pattern: string) {
        this.pattern = pattern;
    }

    addResource(iri: string, resolver: Promise<string>) {
        this.iriPromises.push({iri, promise: resolver, resolved: ""});
    }

    performReplace(): string {
        const map = new Map<string, string>();
        let resultString = this.pattern;
        this.iriPromises.forEach(iriPromise => {
            map.set(iriPromise.iri, iriPromise.resolved);
            resultString = resultString.replace(new RegExp(iriPromise.iri, "g"), iriPromise.resolved);
        });
        return resultString;
    }
}

function createPattern(input: CasovaSpecifikace): Pattern {

    function hasDays(data: CasovaSpecifikace) {
        return data.den_v_týdnu && data.den_v_týdnu.length > 0;
    }

    function hasFrequncy(data: CasovaSpecifikace) {
        return data.frekvence && data.frekvence.length > 0;
    }

    function hasSpecificFrequncy(data: CasovaSpecifikace) {
        return data.specifická_frekvence && data.specifická_frekvence.length > 0;
    }

    if (input && hasDays(input) && !hasFrequncy(input) && !hasSpecificFrequncy(input)) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const pattern = new Pattern(`V těchto dnech: ${input.den_v_týdnu?.map(data => `<${data.iri}>`).join(", ")}`);

        input.den_v_týdnu?.forEach(it => {
            pattern.addResource(`<${it.iri}>`, denotateDayOfWeek(it.iri));
        });
        return pattern;
    }

    return new Pattern("##### !!!");

}

export function toString(input: CasovaSpecifikace): Promise<string> {
    return new Promise<string>((resolve) => {

        const pattern = createPattern(input);
        const promises = Promise.all(pattern.iriPromises.map(iriPromse => iriPromse.promise));
        let counter = 0;
        void promises.then((resolvedPromises) => {
            resolvedPromises.forEach(() => {
                pattern.iriPromises[counter].resolved = resolvedPromises[counter];
                counter++;
            });

            // console.debug("pattern", pattern);
            resolve("Otevírací doba pro " + input.věc.název + ":" + pattern.performReplace());

        });
    });
}