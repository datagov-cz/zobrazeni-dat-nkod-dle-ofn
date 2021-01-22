import $ from "jquery";
import "datatables.net-bs4";
import config from "./conf/config.json";
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
`
}

// Globální stav aplikace - může být i jako třída
const currentEndpoint: Endpoint = config.koncove_body[0];
let currentType: ObjectType = config.typy_objektu[0];
let theTable: DataTables.Api;

const tableOptions = {
    language: {
        url: "http://cdn.datatables.net/plug-ins/1.10.22/i18n/cs.json"
    },
    data: [],
    columns: [{title: "Název"}, {title: "Typ"}, {title: "Popis"}, {title: "Aplikace"}]
}


export async function demoApp(id: string, tableId: string) {
    const newConfig = addExternalAppsToConfiguration(appConfig, config);
    console.info("Using enhanced config:", newConfig);


    loadOptionalURLtype()

    const $demo = $("#demo");
    if ($demo.length) {
        createSelectType("demo", newConfig.typy_objektu);
        $demo.append($("<table>")
            .attr("id", tableId))
            .addClass(["table", "table-striped", "table-bordered", "w-100"]);
        $demo.append($("<div>").attr("id", id));
        theTable = $("#" + tableId).DataTable(tableOptions);
        await loadTable()
    }
}


async function loadTable(): Promise<void> {
    // loads from SPARQL and then load all details in parallel
    let data: string[][] = await convertData(await loadFromSPARQL(currentEndpoint.url, getQuery(currentType.iri), false))
    data = data.filter(row => row.length > 0)
    console.info("SPARQL data loaded:", data);
    theTable.clear().rows.add(data).draw();
}

/**
 * Funkce transformuje data z polepolí ze SPARQL do rozvinuté formy - připraví typy Promise,
 * které se paralelně vyhodnocují a povyhodnocení všech výsledek vrátí
 *
 * @param data vstupní data
 */
async function convertData(data: any[]): Promise<any> {

    function getPromise(url: string) {
        return new Promise<string[]>((resolve, reject) => {
            void $.ajax({
                url,
                dataType: "json",
                crossDomain: true,
                success: (result) => {
                    if (result instanceof Array) {
                        result.forEach(item => {
                            resolve(formatRow(item, url));
                        })
                    } else {
                        resolve(formatRow(result, url))
                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error("cteni z URL selhalo", url)
                    console.error(textStatus + "\n" + errorThrown + "\n" + JSON.stringify(jqXHR));
                    resolve([])
                    // resolve(["chyba pri cteni dat z URL" + url, "", "", ""])
                }
            })
        });
    }

    function formatRow(item, link): string[] {
        return [
            JSON.stringify(item.název.cs),
            JSON.stringify(item.typ),
            JSON.stringify(item.popis.cs),
            linksForAppsToHTML(link, currentType).join(", ")
        ]
    }

    return Promise.all(data.map(row => getPromise(proxy(row.link.value))));
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

// TODO smazat proxy v produkcnim kodu, vyresit pro dev a prod
function proxy(url: string): string {
    // if (url.startsWith("https://gitlab.com")) {
    //     return "https://api.allorigins.win/get?url=" + encodeURIComponent(url)
    // } else {
    //     return url;
    // }
    return url.replace("https://gitlab.com", "http://localhost:8010/proxy");
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
    appDiv.append($("<label>").attr("for", `${id}_type_selector`).text("Typ dat"))
    const select = $("<select>").attr("for", `${id}_type_selector`);
    types.forEach(item => {
        select.append($("<option>").attr("value", item.iri).text(item.název));
    })
    appDiv.append(select);
    select.on("change", function (this: any) {
            currentType = types[this.selectedIndex];
            void loadTable();
        }
    );
}
