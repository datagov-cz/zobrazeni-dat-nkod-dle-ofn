import SparqlClient from "sparql-http-client";


/**
 * Typ pro koncový bod, využit v konfiguraci a při výběru koncového bodu v uživatelském rozhraní
 */
export type Endpoint = {
    název: string,
    url: string
}
/**
 * Typ pro typ objektu, využit v konfiguraci a při výběru typu v uživatelském rozhraní
 */
export type ObjectType = {
    název: string;
    iri: string;
    aplikace?: ExternalApp[];
    iri_objektu?: string;
}
/**
 * Typ pro konfiguraci
 */
export type Configuration = {
    koncove_body: Endpoint[],
    typy_objektu: ObjectType[],
}


/**
 * Typ pro formát externího souboru s popisem aplikací a jejich dovedností
 */
export type ExternalApp = {
    název: string,
    zpracovává: string[],
    url: string,
    formát_url: string,
    popis: string
}


/**
 * Základní fokce pro zpravocvání
 *
 * @param endpoint koncový bod SPARQL pro dotazy
 * @param query vlastní SPARQL dotaz
 * @param headless TRUE -zda se má výsledek transformovat do ploché struktury pole polí [][],
 * FALSE - zda mají být vráceny originální objekty s výsledkem
 * @param userRenderValueFn volitelný parametr funkce, která vykresuje/upravuje výslednou hodnotu každé hodnoty v řádku
 */
export async function loadFromSPARQL(endpoint: string,
                                     query: string,
                                     headless = false,
                                     userRenderValueFn?: (row, key: string) => (string)): Promise<any[]> {
    console.info("Starting loading data from ", endpoint, query);

    // výchozí vykreslovač prostě použije výchozí hodnoty
    const defaultRenderValueFn = (row, key: string) => JSON.stringify(row[key].value);
    const renderValueFn = userRenderValueFn ? userRenderValueFn : defaultRenderValueFn;

    return new Promise<any[]>((resolve, reject) => {
        // obaluje volání SparqlClient do Promise - moderní přístup v TypeScriptu
        void new SparqlClient({endpointUrl: endpoint}).query.select(query).then(stream => {
            const accumulator: any[] = [];

            stream.on("data", row => {
                if (headless) {
                    const item = Object.keys(row).map(key => renderValueFn(row, key));
                    accumulator.push(item);
                } else {
                    accumulator.push(row);
                }
            });

            stream.on("end", () => {
                resolve(accumulator);
            });

            stream.on("error", err => {
                reject(err);
            });

        });
    });

}

// připraví odkaz na aplikaci z poskytnutého linku
export function linksForAppsToHTML(link: string, currentType: ObjectType, payload: any): string[] {
    if (!currentType.aplikace) {
        return [];
    } else {
        return currentType.aplikace.map(application => {
            const uriComponent = application.formát_url
                .replace("${0}", link)
                .replace("${1}", currentType.iri)
                .replace("${2}", "Data ze zdroje dle OFN - " + currentType.název)
                .replace("${3}", (payload && payload.iri) ? payload.iri : "");
            return linkToHTML(application, `${application.url}?${uriComponent}`);
        });
    }
}

// vykreslí HTML část kódu
function linkToHTML(application: ExternalApp, httpLink: string) {
    return `<a href="${httpLink}" title="${application.popis}">${application.název}</a>`;
}

/**
 * Pripojí externí soubor s popisem aplikací a jejich schopností do konfiguračního souboru
 *
 * @param appConf
 * @param conf
 */
export function addExternalAppsToConfiguration(appConf: ExternalApp[], conf: Configuration): Configuration {
    conf.typy_objektu.forEach(type => {
        appConf.filter(item => item.zpracovává.indexOf(type.iri) !== -1).forEach(app => {
            if (!type.aplikace) {
                type.aplikace = [];
            }
            type.aplikace.push(app);
        });
    });
    return conf;
}