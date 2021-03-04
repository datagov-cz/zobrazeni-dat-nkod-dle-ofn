import $ from "jquery";
import {renderBrowserApp} from "./browser";
import {renderDemoApp} from "./demo";
import {specToString} from "./opennings";

$(() => {
    // naváže aplikace na příslušná ID
    void renderBrowserApp("#browser");
    void renderDemoApp("#demo");
});

export function specificationToString(input: string, $div: JQuery<HTMLElement>): void {
    void specToString(input).then(output => {
        $div.text(output);
    });
}

