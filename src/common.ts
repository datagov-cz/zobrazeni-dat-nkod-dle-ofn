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
    aplikace?: AppConf[]
}
/**
 * Typ pro konfiguraci
 */
export type Config = {
    koncove_body: Endpoint[],
    typy_objektu: ObjectType[],
}


/**
 * Typ pro formát externího souboru s popisem aplikací a jejich dovedností
 */
export type AppConf = {
    "název": string,
    "zpracovává": string[],
    "url": string,
    "formát_url": string,
    "popis": string
}


/**
 * Základní fokce pro zpravocvání
 * @param endpoint koncový bod SPARQL pro dotazy
 * @param query vlastní SPARQL dotaz
 * @param headless TRUE -zda se má výsledek transformovat do ploché struktury pole polí [][],
 * FALSE - zda mají být vráceny originální objekty s výsledkem
 * @param userRenderValueFn volitelný parametr funkce, která vykresuje/upravuje výslednou hodnotu každé hodnoty v řádku
 */
export function loadFromSPARQL(endpoint: string,
                               query: string,
                               headless = false,
                               userRenderValueFn?: (row, key) => (string)): Promise<any[]> {
    // tslint:disable-next-line:no-console
    console.info("loading data from ", endpoint, query)

    // výchozí vykreslovač protstě použije výchozí hodnoty
    let renderValueFn = (row, key) => row[key].value;
    if (userRenderValueFn) renderValueFn = userRenderValueFn;

    return new Promise<any[]>((resolve, reject) => {
        // obaluje volání SparqlClient do Promise - moderní přístup v TypeScriptu
        new SparqlClient({endpointUrl: endpoint}).query.select(query).then(stream => {
            const accumulator: any[] = []

            stream.on('data', row => {
                // console.log("adding row ", row)
                if (headless) {
                    const item = Object.keys(row).map(key => renderValueFn(row, key));
                    accumulator.push(item)
                } else {
                    accumulator.push(row)
                }
            })

            stream.on('end', () => {
                // console.debug("finishing stream ", accumulator)
                resolve(accumulator);
            })

            stream.on('error', err => {
                reject(err);
            })

        })
    });

}

// připraví odkaz na aplikaci z poskytnutého linku
export function appsForIRI(link: string, currentType: ObjectType): string[] {
    return currentType.aplikace ?
        currentType.aplikace.map(application => formatAppURL(application, link, currentType)) :
        [];
}

// pomocná funkce, která naformátuje parametry do URL
//TODO zdokkumentovat do readme.md
function formatAppURL(application: AppConf, link: string, currentType: ObjectType) {
    return link2html(application.url + "/?" + encodeURIComponent(
        application.formát_url
            .replace("${0}", link)
            .replace("${1}", currentType.iri)
            .replace("${2}", "Data ze zdroje dle OFN - " + currentType.název)), application);
}

// vykreslí HTML část kódu
function link2html(formatedLink: string, application: AppConf) {
    return `<a href="${formatedLink}" title="${application.popis}">${application.název}</a>`;
}

/**
 * Pripojí externí soubor s popisem aplikací a jejich schopností do konfiguračního souboru
 * @param appConf
 * @param conf
 */
export function mergeAppConfToConf(appConf: AppConf[], conf: Config): Config {
    conf.typy_objektu.forEach(type => {
        appConf.filter(item => item.zpracovává.indexOf(type.iri) !== -1).forEach(app => {
            if (!type.aplikace) type.aplikace = []
            type.aplikace.push(app)
        })
    })
    return conf;
}