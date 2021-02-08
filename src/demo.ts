import $ from "jquery";
import "datatables.net-bs4";
import config from "./conf/config_demo.json";
import {linksForAppsToHTML, Endpoint, loadFromSPARQL, addExternalAppsToConfiguration, ObjectType} from "./common";
import appConfig from "./conf/applications.json";

function getQuery(iri: string): string {
    return `PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
SELECT ?link
WHERE {
?datová_sada a dcat:Dataset ;
dcterms:conformsTo <${iri}> ;
dcat:distribution ?distribuce .
?distribuce a dcat:Distribution ;
dcterms:format <http://publications.europa.eu/resource/authority/file-type/JSON_LD> ;
dcat:downloadURL ?link .
}
`;
}

// Globální stav aplikace - může být i jako třída
const currentEndpoint: Endpoint = config.koncove_body[0];
let currentType: ObjectType = config.typy_objektu[0];
let theTable: DataTables.Api;

const tableOptions = {
    language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.22/i18n/cs.json"
    },
    data: [],
    columns: [{title: "Název"}, {title: "Typ"}, {title: "Popis"}, {title: "Aplikace"}]
};


/**
 * Vykreslí obsah demo aplikace do elementu se zvoleným id
 *
 * @param elementId id elementu, do kterého se má vykreslit obsah
 */
export async function renderDemoApp(elementId: string) {
    const newConfig = addExternalAppsToConfiguration(appConfig, config);
    const tableId = "thetable";
    console.info("Using enhanced config:", newConfig);

    loadOptionalURLtype();

    const $demo = $(elementId);
    if ($demo.length) {
        $demo.append("<hr>");
        // eslint-disable-next-line max-len
        $demo.append(`<p>Zobrazena data z: <strong>${newConfig.koncove_body[0].název}</strong> (<a href="${newConfig.koncove_body[0].url}">${newConfig.koncove_body[0].url}</a>)</p>`);
        createSelectType("demo", newConfig.typy_objektu);
        $demo.append("<hr>");
        const $table = $("<table>").attr("id", tableId).addClass(["table", "table-striped", "table-bordered", "w-100"]);
        $demo.append($table);
        theTable = $table.DataTable(tableOptions);
        await loadTable();
    }
}


/**
 * Načte obsah tabulky podle aktuální konfigurace a stavu ovládacích prvků
 */
async function loadTable(): Promise<void> {
    function useData(rows: string[][]): void {
        theTable.rows.add(rows).draw();
    }

    // loads from SPARQL and then load all details in parallel
    convertData(await loadFromSPARQL(currentEndpoint.url, getQuery(currentType.iri), false), useData);
}

/**
 * Funkce transformuje data z polepolí ze SPARQL do rozvinuté formy - připraví typy Promise,
 * které se paralelně vyhodnocují a povyhodnocení všech výsledek vrátí
 *
 * @param data vstupní data
 * @param useData funkce zpracovávající výsledek
 */
function convertData(data: any[], useData: (rows: string[][]) => void): void {

    data.forEach(row => {
        const url = row.link.value;
        void $.ajax({
            url,
            dataType: "json",
            crossDomain: true,
            success: (result) => {
                if (result instanceof Array) {
                    result.forEach(item => {
                        useData([formatRow(item, url)]);
                    });
                } else {
                    useData([formatRow(result, url)]);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.error("cteni z URL selhalo", url);
                console.error(textStatus + "\n" + errorThrown + "\n" + JSON.stringify(jqXHR));
            }
        });

    });

    function formatRow(item, link): string[] {
        return [
            JSON.stringify(item.název.cs),
            JSON.stringify(item.typ),
            JSON.stringify(item.popis.cs),
            linksForAppsToHTML(link, currentType, item).join(", ")
        ];
    }

}

/**
 * načte volitelnou část URL, ze které vezme obsah parametru "typ" a použije jej jako první položky výběru.
 * Pokud je parametr "typ" nalezen, tak je obsah využit ihned
 */
function loadOptionalURLtype() {
    const type = new URLSearchParams(window.location.search).get("typ");
    if (type != null) {
        config.typy_objektu.unshift({název: "z parametru typ: " + String(type), iri: String(type)});
        currentType = config.typy_objektu[0];
    }
}

/**
 * vyrobí a vloží do HTML stránky SELECT s výběrem typu
 *
 * @param id
 * @param types
 */
function createSelectType(id: string, types: ObjectType[]): void {
    const appDiv = $(`#${id}`).append($("<div class='types'>"));
    appDiv.remove("select");
    appDiv.append($("<label>").addClass("pr-2").attr("for", `${id}_type_selector`).text("Typ dat"));
    const select = $("<select>").attr("for", `${id}_type_selector`);
    types.forEach(item => {
        select.append($("<option>").attr("value", item.iri).text(item.název));
    });
    appDiv.append(select);
    select.on("change", function (this: any) {
            currentType = types[this.selectedIndex];
            void loadTable();
        }
    );
}
