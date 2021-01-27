/**
 * Typ pro koncový bod, využit v konfiguraci a při výběru koncového bodu v uživatelském rozhraní
 */
export declare type Endpoint = {
    název: string;
    url: string;
};
/**
 * Typ pro typ objektu, využit v konfiguraci a při výběru typu v uživatelském rozhraní
 */
export declare type ObjectType = {
    název: string;
    iri: string;
    aplikace?: ExternalApp[];
};
/**
 * Typ pro konfiguraci
 */
export declare type Configuration = {
    koncove_body: Endpoint[];
    typy_objektu: ObjectType[];
};
/**
 * Typ pro formát externího souboru s popisem aplikací a jejich dovedností
 */
export declare type ExternalApp = {
    název: string;
    zpracovává: string[];
    url: string;
    formát_url: string;
    popis: string;
};
/**
 * Základní fokce pro zpravocvání
 *
 * @param endpoint koncový bod SPARQL pro dotazy
 * @param query vlastní SPARQL dotaz
 * @param headless TRUE -zda se má výsledek transformovat do ploché struktury pole polí [][],
 * FALSE - zda mají být vráceny originální objekty s výsledkem
 * @param userRenderValueFn volitelný parametr funkce, která vykresuje/upravuje výslednou hodnotu každé hodnoty v řádku
 */
export declare function loadFromSPARQL(endpoint: string, query: string, headless?: boolean, userRenderValueFn?: (row: any, key: string) => (string)): Promise<any[]>;
export declare function linksForAppsToHTML(link: string, currentType: ObjectType, payload: any): string[];
/**
 * Pripojí externí soubor s popisem aplikací a jejich schopností do konfiguračního souboru
 *
 * @param appConf
 * @param conf
 */
export declare function addExternalAppsToConfiguration(appConf: ExternalApp[], conf: Configuration): Configuration;
