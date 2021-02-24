// eslint-disable-next-line max-classes-per-file
import {loadFromSPARQL} from "./common";
import {getDay} from "date-fns";

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

export type DenVTydnuType = {
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
export type CasovaSpecifikaceType = {
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

}

enum Properties {
    počet_opakování = "počet_opakování",
    den_v_týdnu = "den_v_týdnu",
    časová_doba = "časová_doba",
    časový_interval = "časový_interval",
    časový_okamžik = "časový_okamžik",
    časová_platnost = "časová_platnost",
    časové_období = "časové_období",
    frekvence = "frekvence",
    jiná_časová_specifikace = "jiná_časová_specifikace",
    specifická_frekvence = "specifická_frekvence",
    výjimka = "výjimka"
}

export class DenVTydnu {
    den_v_týdnu: DenVTydnuType;

    constructor(den_v_týdnu: DenVTydnuType) {
        this.den_v_týdnu = den_v_týdnu;
    }

    public denotateDayOfWeek(): Promise<string> {
        return loadFromSPARQL(
            "https://data.mvcr.gov.cz/sparql",
            `SELECT ?o WHERE {
            <${this.den_v_týdnu.iri}> 
            <http://www.w3.org/2004/02/skos/core#prefLabel> 
            ?o.
        FILTER(LANG(?o) = "" || LANGMATCHES(LANG(?o), "cs"))
        }`,
            false).then(o => String(o[0].o.value));
    }
}

export class CasovaSpecifikace {
    casovaSpecifikace: CasovaSpecifikaceType;

    constructor(casovaSpecifikace: CasovaSpecifikaceType) {
        this.casovaSpecifikace = casovaSpecifikace;
    }

    public isOpen(moment: Date): boolean {
        function evaluate(property: Properties, mmnt: Date, casovaSpecifikace: CasovaSpecifikaceType): boolean {
            switch (property) {
                case Properties.den_v_týdnu:
                    const daysOfWeek = [
                        "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/neděle",
                        "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/pondělí",
                        "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/úterý",
                        "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/středa",
                        "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/čtvrtek",
                        "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/pátek",
                        "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/sobota",
                    ];
                    return casovaSpecifikace.den_v_týdnu!.map(dayOfWeek => daysOfWeek.indexOf(dayOfWeek.iri))
                        .indexOf(getDay(moment)) > -1;
                    break;
                case Properties.časová_doba:
                    break;
                case Properties.časový_interval:
                    break;
                case Properties.časový_okamžik:
                    break;
                case Properties.časová_platnost:
                    break;
                case Properties.časové_období:
                    break;
                case Properties.frekvence:
                    break;
                case Properties.jiná_časová_specifikace:
                    break;
                case Properties.specifická_frekvence:
                    break;
                case Properties.výjimka:
                    break;
            }
            return false;
        }

        return this.presentFields()
            .map(field => evaluate(field as Properties, moment, this.casovaSpecifikace))
            .reduce((previousValue, currentValue) => previousValue && currentValue);

    }

    public toString(): Promise<string> {
        return new Promise<string>((resolve) => {

            const pattern = this.createPattern();
            const promises = Promise.all(pattern.iriPromises.map(iriPromse => iriPromse.promise));
            let counter = 0;
            void promises.then((resolvedPromises) => {
                resolvedPromises.forEach(() => {
                    pattern.iriPromises[counter].resolved = resolvedPromises[counter];
                    counter++;
                });

                resolve(`Otevírací doba pro ${this.casovaSpecifikace.věc.název}\n ${pattern.performReplace()}`);
            });
        });
    }

    public presentFields(): string[] {
        return Object.keys(this.casovaSpecifikace).filter(key => this.casovaSpecifikace[key].length && this.casovaSpecifikace[key].length > 0);
    }

    createPattern(): Pattern {

        function hasProperty(data: CasovaSpecifikaceType, property: Properties) {
            return Array.isArray(data[property]) && (data[property] as any[]).length > 0;
        }

        if (this.casovaSpecifikace
            && hasProperty(this.casovaSpecifikace, Properties.den_v_týdnu)
            && !hasProperty(this.casovaSpecifikace, Properties.frekvence)
            && !hasProperty(this.casovaSpecifikace, Properties.specifická_frekvence)) {
            const daysOfWeek: DenVTydnuType[] = this.casovaSpecifikace.den_v_týdnu || [{iri: "undefined"}];
            const pattern = new Pattern(`V těchto dnech: ${daysOfWeek?.map(data => `<${data.iri}>`).join(", ")}`);

            daysOfWeek?.forEach(dayOfWeek => {
                pattern.addResource(`<${dayOfWeek.iri}>`, new DenVTydnu(dayOfWeek).denotateDayOfWeek());
            });
            return pattern;
        }

        return new Pattern("##### !!!");

    }


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


export function isOpen(timeSpecs: CasovaSpecifikace[], moment: Date): boolean {
    if (timeSpecs.length > 0) {
        return timeSpecs.map(ts => ts.isOpen(moment)).reduce((previousValue, currentValue) => previousValue || currentValue);
    } else {
        return false;
    }
}