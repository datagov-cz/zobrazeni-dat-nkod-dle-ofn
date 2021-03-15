import {CasovaSpecifikace, CasovaSpecifikaceType, isInSpecifications} from "../src/opennings";
import {parse} from "date-fns";

xtest("toString - den_v_týdnu", async () => {
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
test("toString - počet_opakování", async () => {
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

test("toString - časový_okamžik", async () => {
    const input: CasovaSpecifikaceType = {
        "věc": {
            "název": "testovací název",
            "iri": "iri-vec"
        },
        "časový_okamžik": [{datum: "2021-02-23"}, {datum_a_čas: "2021-02-24T14:48:00"}]
    }

    const actual = await new CasovaSpecifikace(input).toString();
    expect(actual).toEqual("úterý, 23. února 2021, středa, 24. února 2021 v 14:48:00 GMT+01:00");
})

test("contains - dny v týdnu", () => {
    const input: CasovaSpecifikaceType = {
        věc: {
            název: "testovací název",
            iri: "<iri-vec>"
        },
        den_v_týdnu: [{iri: "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/pondělí"}, {iri: "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/úterý"}]
    }
    expect(isInSpecifications([new CasovaSpecifikace(input)], new Date(2021, 2, 23))).toEqual(true); // úterý
})

test("contains - časový okamžik", () => {
    const input: CasovaSpecifikaceType = {
        věc: {
            název: "testovací název",
            iri: "<iri-vec>"
        },
        "časový_okamžik": [{datum: "2021-02-23"}]
    }
    expect(isInSpecifications([new CasovaSpecifikace(input)], new Date(2021, 1, 24))).toEqual(true); // úterý
})