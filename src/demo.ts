import $ from "jquery";
import 'datatables.net-bs4';
import config from "./conf/config.json";
import {appsForIRI, Endpoint, loadFromSPARQL, mergeAppConfToConf, ObjectType} from "./common";
import appConfig from "./conf/applications.json";

function getQuery(iri: string): string {
    return `PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
SELECT ?link
WHERE {
?datová_sada a dcat:Dataset ;
dcterms:conformsTo ${iri} ;
dcat:distribution ?distribuce .
?distribuce a dcat:Distribution ;
dcterms:format <http://publications.europa.eu/resource/authority/file-type/JSON_LD> ;
dcat:downloadURL ?link .
}
`
}

// Globální stav aplikace - může být i jako třída
const currentEndpoint: Endpoint = config.endpoints[0];
let currentType: any = config.types[0];
let theTable: DataTables.Api;

const tableOptions = {
    language: {
        url: "http://cdn.datatables.net/plug-ins/1.10.22/i18n/cs.json"
    },
    data: [],
    columns: [{title: "Název"}, {title: "Typ"}, {title: "Popis"}, {title: "Aplikace"}]
}


export function demoApp(id: string, tableId: string) {
    const newConfig = mergeAppConfToConf(appConfig as any, config as any)
    // tslint:disable-next-line:no-console
    console.info("Using enhanced config:", config);


    loadOptionalURLtype()

    const $demo = $("#demo");
    if ($demo.length) {
        createSelectType("demo", config.types as any);
        $demo.append($("<table>").attr("id", tableId));
        $demo.append($("<div>").attr("id", id));
        theTable = $('#' + tableId).DataTable(tableOptions);
        loadTable()
    }
}


async function loadTable(): Promise<void> {
    // loads from SPARQL and then load all details in paralel
    const data = await convertData(await loadFromSPARQL(currentEndpoint.url, getQuery(currentType.iri), false))

    // tslint:disable-next-line:no-console
    console.info("data loaded:", data);

    theTable.clear().rows.add(data).draw();
}

/**
 * Funkce transformuje data z polepolí ze SPARQL do rozvinuté formy - připraví typy Promise,
 * které se paralelně vyhodnocují a povyhodnocení všech výsledek vrátí
 * @param data vstupní data
 */
async function convertData(data: any[]): Promise<any> {
    const promises: Promise<string[]>[] = []

    function formatRow(item, link) {
        return [item.název.cs, item.typ, item.popis.cs, appsForIRI(link, currentType)]
    }

    data.forEach(row => {
        const url = proxy(row.link.value);
        promises.push(new Promise<string[]>((resolve, reject) => {
            $.ajax({
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
                error: ((jqXHR, textStatus, errorThrown) =>
                    reject(textStatus + "\n" + errorThrown + "\n" + JSON.stringify(jqXHR)))
            })
        }))
    })
    return Promise.all(promises);
}

/**
 * načte volitelnou část URL, ze které vezme obsah parametru "typ" a použije jej jako první položky výběru.
 * Pokud je parametr "typ" nalezen, tak je obsah využit ihned
 */
function loadOptionalURLtype() {
    const type = new URLSearchParams(window.location.search).get('typ');
    if (type != null) {
        config.types.unshift({title: "z parametru typ: " + String(type), iri: String(type)});
        currentType = config.types[0];
    }
}

function proxy(url: string): string {
    return url.replace("https://gitlab.com", "http://localhost:8010/proxy");
}

/**
 * vyrobí a vloží do HTML stránky SELECT s výběrem typu
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
            loadTable();
        }
    );
}
