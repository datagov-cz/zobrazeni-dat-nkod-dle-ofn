import $ from "jquery";
import "datatables.net-bs4";
import config from "./conf/config.json";
import appConfig from "./conf/applications.json";
import {linksForAppsToHTML, Endpoint, loadFromSPARQL, addExternalAppsToConfiguration, ObjectType} from "./common"


function getQuery(iri: string): string {
    return `
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX l-sgov-sbírka-111-2009-pojem: <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/>
SELECT  ?název ?popis ?vydavatel ?zdroj
WHERE {

    ?s a dcat:Dataset ;
        dcat:distribution ?distribuce ;
        dcterms:conformsTo <${iri}> ;
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
let currentEndpoint: Endpoint = config.koncove_body[0];
let currentType: ObjectType = config.typy_objektu[0];
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
export async function renderBrowserApp(elementId: string): Promise<void> {
    const newConfig = addExternalAppsToConfiguration(appConfig, config)
    console.info("Using enhanced config:", newConfig);

    loadOptionalURLendpoint();

    const $browser = $(elementId);
    if ($browser.length) {

        const row = $("<div>").addClass("row").attr("id", "row");
        $browser.append(row)
        createSelectEndpoint("row", newConfig.koncove_body);
        createSelectType("row", newConfig.typy_objektu as any);

        // create <table> and convert into DataTable
        const $table = $("<table>").addClass(["table", "table-striped", "table-bordered", "w-100"]);
        $browser.append($table)
        table = $table.DataTable(dataTableOptions);

        await loadTable();
    }
}

async function loadTable(): Promise<void> {
    const data = await loadFromSPARQL(currentEndpoint.url, getQuery(currentType.iri), true, valueRenderer)
    console.info("SPARQL data loaded:", data);
    table.clear().rows.add(data).draw();
}

/**
 * Funkce načte dodatečné URL z parametru stránky "url", pokud je přítomen, a ihned jej použije jako
 * koncový bod pro dotazování
 */
function loadOptionalURLendpoint() {
    const url = new URLSearchParams(window.location.search).get("url");
    if (url != null) {
        config.koncove_body.unshift({název: "z parametru url: " + String(url), url: String(url)});
        currentEndpoint = config.koncove_body[0];
    }
}

/**
 * Value renderer je transformační funkce, která dovoluje programátorovi nechat vypsat hodnoty vrácené
 * jako odpověď na dotaz v jiné formě, provést transformaci.
 *
 * @param row z jakého řádku jodpovědi je klíč/hodnota
 * @param key klíš k hodnotě
 */
// TODO funkce by měla vracet string, HTML string, nebo něco pro DataTable
function valueRenderer(row, key: string): any {
    if (row && key && row[key] && row[key].value) {
        // použití switch je v tomto místě zbytné, nicméně nabízí snadnou rozšiřitelnost do budoucna
        const keyName = "zdroj"
        switch (key) {
            case keyName: {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const element = row[keyName];
                if (element && element.value) {
                    return linksForAppsToHTML(element.value, currentType, null)
                } else {
                    console.error("unexpected result row format: ", JSON.stringify(row))
                }
            }
            default: {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
                return row[key].value;
            }
        }
    } else {
        console.error("both argumente must be valid, defined", row, key)
    }
}


/**
 * vytvoří select pro změnu koncového bodu pro dotazy
 *
 * @param id
 * @param endpoints
 */
function createSelectEndpoint(id: string, endpoints: Endpoint[]): void {
    const $endpoints = $("<div class='endpoints col-sm m-2 p-3'>");
    $(`#${id}`).append($endpoints);
    $endpoints.append($("<label>").attr("for", `${id}_catalog_selector`).text("Katalog"))
    const select = $("<select>").attr("for", `${id}_catalog_selector`);
    endpoints.forEach(item => {
        select.append($("<option>").attr("value", item.url).text(item.název));
    })
    $endpoints.append(select);
    select.on("change", function (this: any) {
            currentEndpoint = endpoints[this.selectedIndex];
            // console.debug("changing endpoint to", currentEndpoint)
            void loadTable();
        }
    );
}

/**
 * vytvoří SELECT pro výběr typu dat
 *
 * @param id
 * @param types
 */
function createSelectType(id: string, types: ObjectType[]): void {
    const $types = $("<div class='types col-sm m-2 p-3'>");
    $(`#${id}`).append($types);
    $types.remove("select");
    $types.append($("<label>").attr("for", `${id}_type_selector`).text("Typ dat"))
    const select = $("<select>").attr("for", `${id}_type_selector`);
    types.forEach(item => {
        select.append($("<option>").attr("value", item.iri).text(item.název));
    })
    $types.append(select);
    select.on("change", function (this: any) {
            currentType = types[this.selectedIndex];
            // console.debug("change type to", currentType);
            void loadTable();
        }
    );
}
