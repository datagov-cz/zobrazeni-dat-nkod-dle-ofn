import SparqlClient from "sparql-http-client";

/**
 * Interface to read the config file
 */
export type Application = {
    url: string,
    paramsformat: string,
    title: string,
    description: string
}

/**
 * The endpoint structure for config and SELECT dropdown
 */
export type Endpoint = {
    title: string,
    url: string
}
/**
 * Object types for SELECT dropdown with predefined IRIs
 */
export type ObjectType = {
    title: string;
    iri: string;
    applications: Application[]
}
/**
 * Config object
 */
export type Config = {
    endpoints: Endpoint[],
    types: ObjectType[],
    applications?: Application[]
}

export type AppConf = {
    title: string,
    iris: string[],
    url: string,
    paramsformat: string,
    description: string
}


/**
 * Function transforms HTTP sream API into a Promise. This is the hearth of the app.
 * @param endpoint SPARQL endpoint to query
 * @param query the SPARQL query
 * @param headless if true return flat structure [][] with only values,
 * it also return array of rows represented as objects with keys ~ colunm names and respective values
 * @param userRenderValueFn value renderer - allows programmer to use own value renderer in case of headless output
 */
export function loadFromSPARQL(endpoint: string,
                               query: string,
                               headless = false,
                               userRenderValueFn?: (row, key) => (string)): Promise<any[]> {
    // tslint:disable-next-line:no-console
    console.info("loading data from ", endpoint, query)

    // use default renderer if not user-defined
    let renderValueFn = (row, key) => row[key].value;
    if (userRenderValueFn) renderValueFn = userRenderValueFn;

    return new Promise<any[]>((resolve, reject) => {
        // one-liner - create the client and wrap streams with a Promise
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

// combines current type (from configuration and select) with link, if apps exist in config
export function appsForIRI(link: string, currentType: ObjectType): string[] {
    return currentType.applications ?
        currentType.applications.map(application => formatAppURL(application, link, currentType)) :
        [];
}

// utility function - format given string as link to given app
function formatAppURL(application: Application, link: string, currentType: ObjectType) {
    return link2html(application.url + "/?" + encodeURIComponent(
        application.paramsformat
            .replace("${0}", link)
            .replace("${1}", currentType.iri)
            .replace("${2}", "Data ze zdroje dle OFN - " + currentType.title)), application);
}

// utility function - how the link is formatted
function link2html(formatedLink: string, application: Application) {
    return `<a href="${formatedLink}" title="${application.description}">${application.title}</a>`;
}

/**
 * merges external app config into Config object
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