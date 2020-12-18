import $ from "jquery";
import {browserApp} from "./browser"
import {demoApp} from "./demo";

// TODO zvážit rozdělení na ES6 moduly, toto jsou takové POJO moduly, které se transpilují do "defaul" modulu
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