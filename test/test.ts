import {linksForAppsToHTML} from "../src/common";

test("html link", () => {

    const app1 = {
        formát_url: "param0=${0}&param1=${1}&param2=${2}&param3=${3}&param4=${4}",
        název: "testapp",
        popis: "test app",
        url: "https://applicationURL.test",
        zpracovává: ["iri"]
    };
    const type1 = {
        "název": "Turistické cíle",
        "iri": "https://ofn.gov.cz/turistické-cíle/2020-07-01/",
        "aplikace": [
            app1]
    };
    expect(linksForAppsToHTML("link", type1, {}))
            // eslint-disable-next-line max-len
        .toStrictEqual(["<a href=\"https://applicationURL.test?param0=link&param1=https://ofn.gov.cz/turistické-cíle/2020-07-01/&param2=Data ze zdroje dle OFN - Turistické cíle&param3=&param4=${4}\" title=\"test app\">testapp</a>"])
})