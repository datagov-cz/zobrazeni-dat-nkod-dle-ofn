import $ from "jquery";
import {browserApp} from "./browser"
import {demoApp} from "./demo";

$(() => {
    (async () => {

        if ($("#browser").length) {
            await browserApp();
        }

        if ($("#demo").length) {
            demoApp("app", "theTable");
        }

    })();
})