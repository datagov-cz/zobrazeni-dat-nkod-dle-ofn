import $ from "jquery";
import {browserApp} from "./browser"
import {demoApp} from "./demo";

// TODO zvážit rozdělení na ES6 moduly, toto jsou takové POJO moduly, které se transpilují do "default" modulu
$(() => {
    if ($("#browser").length) {
        void browserApp();
    }

    if ($("#demo").length) {
        void demoApp("app", "theTable");
    }
})