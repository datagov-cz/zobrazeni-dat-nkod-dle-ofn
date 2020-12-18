import $ from "jquery";
import 'datatables.net-bs4';
import config from "./conf/config.json";
import appConfig from "./conf/applications.json";
import {appsForIRI, Endpoint, loadFromSPARQL, mergeAppConfToConf, ObjectType} from "./common"


function getQuery(iri: string): string {
    return `
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/>
SELECT  ?title ?description ?publisher_name ?download_link
WHERE {

    ?s a dcat:Dataset ;
        dcat:distribution ?distribution ;

        dcterms:conformsTo ${iri} ;

        dcterms:title ?title ;
        dcterms:description ?description;
        dcterms:publisher ?publisher_iri .

    ?distribution a dcat:Distribution ;
        dcterms:format <http://publications.europa.eu/resource/authority/file-type/JSON_LD> ;
        dcat:downloadURL ?download_link .

    SERVICE <https://rpp-opendata.egon.gov.cz/odrpp/sparql/> {
      ?publisher_iri l-sgov-sbírka-111-2009-pojem:má-název-orgánu-veřejné-moci ?publisher_name
    }
}
`
}


// global states of application - might be easily converted into a class in more difficult application
let currentEndpoint: Endpoint = config.endpoints[0];
let currentType: any = config.types[0];
let table: DataTables.Api;

const dataTableOptions = {
    language: {
        url: "http://cdn.datatables.net/plug-ins/1.10.22/i18n/cs.json"
    },
    data: [],
    columns: [
        {title: "Název"},
        {title: "Popis"},
        {title: "Poskytovatel dat"},
        {title: "Aplikace využívající otevřená data"},
    ]
};

// run the app with jQuery, the top function function is asynchronous to not block user actions or other scripts
export async function browserApp() {
    const newConfig = mergeAppConfToConf(appConfig as any, config as any)
    // tslint:disable-next-line:no-console
    console.info("Using enhanced config:", config);


    loadOptionalURLendpoint();

    const $browser = $("#browser");
    if ($browser.length) {
        createSelectEndpoint("browser", newConfig.endpoints);
        createSelectType("browser", newConfig.types as any);

        // create <table> and convert into DataTable
        const $table = $("<table>");
        $browser.append($table)
        table = $table.DataTable(dataTableOptions);

        await loadTable();
    }
}

async function loadTable(): Promise<void> {
    const data = await loadFromSPARQL(currentEndpoint.url, getQuery(currentType.iri), true, valueRenderer)

    // tslint:disable-next-line:no-console
    console.info("data loaded:", data);

    table.clear().rows.add(data).draw();
}

/**
 * function loads additional URL from the page parameter "url" and directly uses that if "url" parametr is present
 */
function loadOptionalURLendpoint() {
    const url = new URLSearchParams(window.location.search).get('url');
    if (url != null) {
        config.endpoints.unshift({title: "z parametru url: " + String(url), url: String(url)});
        currentEndpoint = config.endpoints[0];
    }
}

/**
 * Value renderer is a callback implementation, that picks "download_link" column and replaces with
 * proper 3rd party aplication liks according to configuration
 * @param row
 * @param key
 */
function valueRenderer(row, key) {
    const keyName = "download_link"
    // with the switch I assume that there will be more types of values to be rendered differently..
    switch (key) {
        case keyName: {
            return appsForIRI(row[keyName].value, currentType)
        }
        default: {
            return row[key].value;
        }
    }
}


/**
 * create Endpoint select and label
 * @param id
 * @param endpoints
 */
function createSelectEndpoint(id: string, endpoints: Endpoint[]): void {
    const appDiv = $(`#${id}`).append($("<div class='endpoints'>"));
    appDiv.append($("<label>").attr("for", `${id}_catalog_selector`).text("Katalog"))
    const select = $("<select>").attr('for', `${id}_catalog_selector`);
    endpoints.forEach(item => {
        select.append($("<option>").attr('value', item.url).text(item.title));
    })
    appDiv.append(select);
    select.on("change", function (this: any) {
            currentEndpoint = endpoints[this.selectedIndex];
            // console.debug("changing endpoint to", currentEndpoint)
            loadTable();
        }
    );
}

/**
 * create Types select and label
 * @param id
 * @param types
 */
function createSelectType(id: string, types: ObjectType[]): void {
    const appDiv = $(`#${id}`).append($("<div class='types'>"));
    appDiv.remove("select");
    appDiv.append($("<label>").attr("for", `${id}_type_selector`).text("Typ dat"))
    const select = $("<select>").attr('for', `${id}_type_selector`);
    types.forEach(item => {
        select.append($("<option>").attr('value', item.iri).text(item.title));
    })
    appDiv.append(select);
    select.on("change", function (this: any) {
            currentType = types[this.selectedIndex];
            // console.debug("change type to", currentType);
            loadTable();
        }
    );
}
