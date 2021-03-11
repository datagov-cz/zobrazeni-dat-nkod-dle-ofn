import $ from "jquery";
import {renderBrowserApp} from "./browser";
import {renderDemoApp} from "./demo";
import {isInJSONSpecifications, jsonSpecToString} from "./opennings";


$(() => {
    // naváže aplikace na příslušná ID
    void renderBrowserApp("#browser");
    void renderDemoApp("#demo");
});

export function specificationToString(input: string, $targetDiv: JQuery<HTMLElement>): void {
    void jsonSpecToString(input).then(output => {
        $targetDiv.text(output);
    });
}

export function contains(input: string, date: Date, $targetDiv: JQuery<HTMLElement>): void {
    $targetDiv.text(isInJSONSpecifications(input, date) ? "Ano" : "Ne");
}