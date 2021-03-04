import {CasovaSpecifikace, CasovaSpecifikaceType, isInSpecifications} from "../src/opennings";
import {parse} from "date-fns";

xtest("toString - days", async () => {
    const input: CasovaSpecifikaceType = {
        "věc": {
            "název": "testovací název",
            "iri": "<iri-vec>"
        },
        "den_v_týdnu": [
            {"iri": "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/pondělí"},
            {"iri": "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/úterý"}
        ]
    }

    const actual = await new CasovaSpecifikace(input).toString();
    expect(actual).toEqual("Otevírací doba pro testovací název\n V těchto dnech: Pondělí, Úterý");
})
test("toString - opakování", async () => {
    const input: CasovaSpecifikaceType = {
        "věc": {
            "název": "testovací název",
            "iri": "iri-vec"
        },
        "počet_opakování": 10
    }

    const actual = await new CasovaSpecifikace(input).toString();
    expect(actual).toEqual("Opakuje se 10×");
})

test("isOpen", () => {
    const input: CasovaSpecifikaceType = {
        věc: {
            název: "testovací název",
            iri: "<iri-vec>"
        },
        den_v_týdnu: [{iri: "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/pondělí"}, {iri: "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/úterý"}]
    }
    expect(isInSpecifications([new CasovaSpecifikace(input)], new Date(2021, 2, 23))).toEqual(true); // úterý
})