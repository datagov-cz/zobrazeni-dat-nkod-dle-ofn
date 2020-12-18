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
SELECT  ?název ?popis ?vydavatel ?zdroj
WHERE {

    ?s a dcat:Dataset ;
        dcat:distribution ?distribuce ;
        dcterms:conformsTo ${iri} ;
        dcterms:title ?název ;
        dcterms:description ?popis;
        dcterms:publisher ?vydavatel_iri .

    ?distribuce a dcat:Distribution ;
        dcterms:format <http://publications.europa.eu/resource/authority/file-type/JSON_LD> ;
        dcat:downloadURL ?zdroj .

    SERVICE <https://rpp-opendata.egon.gov.cz/odrpp/sparql/> {
      ?vydavatel_iri l-sgov-sbírka-111-2009-pojem:má-název-orgánu-veřejné-moci ?vydavatel
    }
}
`
}


// Proměnné globálního stavu aplikace. Snadno lze předělat na třídu
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

/** aplikace se spouštítouto funkcí a všechny části, které mohou zdržet uživatle, beží asynchronně, využívá návrhového
 * vzoru s klíčovými slovy async/await {@link https://en.wikipedia.org/wiki/Async/await}
 *
 */
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
 * Funkce načte dodatečné URL z parametru stránky "url", pokud je přítomen, a ihned jej použije jako
 * koncový bod pro dotazování
 */
function loadOptionalURLendpoint() {
    const url = new URLSearchParams(window.location.search).get('url');
    if (url != null) {
        config.endpoints.unshift({title: "z parametru url: " + String(url), url: String(url)});
        currentEndpoint = config.endpoints[0];
    }
}

/**
 * Value renderer je transformační funkce, která dovoluje programátorovi nechat vypsat hodnoty vrácené
 * jako odpověď na dotaz v jiné formě, provést transformaci.
 * @param row z jakého řádku jodpovědi je klíč/hodnota
 * @param key klíš k hodnotě
 */
// TODO funkce by měla vracet string, HTML string, nebo něco pro DataTable
function valueRenderer(row, key): any {
    const keyName = "download_link"
    // použití switch je v tomto místě zbytné, nicméně nabízí snadnou rozšiřitelnost do budoucna
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
 * vytvoří select pro změnu koncového bodu pro dotazy
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
 * vytvoří SELECT pro výběr typu dat
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
