import SparqlClient from "sparql-http-client";

/**
 * Typ pro Aplikaci
 */
export type Application = {
    url: string,
    paramsformat: string,
    title: string,
    description: string
}

/**
 * Typ pro koncový bod, využit v konfiguraci a při výběru koncového bodu v uživatelském rozhraní
 */
export type Endpoint = {
    title: string,
    url: string
}
/**
 * Typ pro typ objektu, využit v konfiguraci a při výběru typu v uživatelském rozhraní
 */
export type ObjectType = {
    title: string;
    iri: string;
    applications: Application[]
}
/**
 * Typ pro konfiguraci
 */
export type Config = {
    endpoints: Endpoint[],
    types: ObjectType[],
    applications?: Application[]
}

/**
 * Typ pro formát externího souboru s popisem aplikací a jejich dovedností
 */
export type AppConf = {
    title: string,
    iris: string[],
    url: string,
    paramsformat: string,
    description: string
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
    return currentType.applications ?
        currentType.applications.map(application => formatAppURL(application, link, currentType)) :
        [];
}

// pomocná funkce, která naformátuje parametry do URL
//TODO zdokkumentovat do readme.md
function formatAppURL(application: Application, link: string, currentType: ObjectType) {
    return link2html(application.url + "/?" + encodeURIComponent(
        application.paramsformat
            .replace("${0}", link)
            .replace("${1}", currentType.iri)
            .replace("${2}", "Data ze zdroje dle OFN - " + currentType.title)), application);
}

// vykreslí HTML část kódu
function link2html(formatedLink: string, application: Application) {
    return `<a href="${formatedLink}" title="${application.description}">${application.title}</a>`;
}

/**
 * Pripojí externí soubor s popisem aplikací a jejich schopností do konfiguračního souboru
 * @param appConf
 * @param conf
 */
export function mergeAppConfToConf(appConf: AppConf[], conf: Config): Config {
    conf.types.forEach(type => {
        appConf.filter(item => item.iris.indexOf(type.iri) !== -1).forEach(app => {
            if (!type.applications) type.applications = []
            type.applications.push({
                title: app.title,
                description: app.description,
                paramsformat: app.paramsformat,
                url: app.url
            })
        })
    })
    return conf;
}