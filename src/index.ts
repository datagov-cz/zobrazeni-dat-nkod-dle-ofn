import $ from "jquery";
import {renderBrowserApp} from "./browser";
import {renderDemoApp} from "./demo";

$(() => {
    // naváže aplikace na příslušná ID
    void renderBrowserApp("#browser");
    void renderDemoApp("#demo");
});