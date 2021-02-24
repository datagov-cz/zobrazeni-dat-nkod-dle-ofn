import {CasovaSpecifikace, CasovaSpecifikaceType, isOpen} from "../src/opennings";
import {parse} from "date-fns";

test("toString", async () => {
    const input: CasovaSpecifikaceType = {
        věc: {
            název: "testovací název",
            iri: "<iri-vec>"
        },
        den_v_týdnu: [{iri: "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/pondělí"}, {iri: "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/úterý"}]
    }

    const actual = await new CasovaSpecifikace(input).toString();
    expect(actual).toEqual("Otevírací doba pro testovací název:V těchto dnech: Pondělí, Úterý");
})

test("isOpen", () => {
    const input: CasovaSpecifikaceType = {
        věc: {
            název: "testovací název",
            iri: "<iri-vec>"
        },
        den_v_týdnu: [{iri: "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/pondělí"}, {iri: "https://data.mvcr.gov.cz/zdroj/číselníky/dny-v-týdnu/položky/úterý"}]
    }
    expect(isOpen([new CasovaSpecifikace(input)], new Date(2021, 2,23))).toEqual(true); // úterý
})