# zobrazeni-dat-nkod-dle-ofn
Jedná se o soubor ukázkových aplikací v [typescriptu](https://cs.wikipedia.org/wiki/TypeScript), které umí zobrazovat otevřená data.

TODO: užitečné informace, odkazy, jak to patří do celku  

## Lokální vývoj, spuštění

* Ujistěte se, že máte nainstalován program nodejs a npm.
Použijte [node.js](https://nodejs.org/en/download/) ve verzi 14+ (nainstalujte, pokud nemáte z odkazu). Ověřte instalaci spuštěním příkazu `node` a příkazu `npm` 
(ve windows stiskněte Win+R, napište "cmd", enter, otevře se černé okno příkazové řádky kam můžete vepsat tyto příkazy)

* Lokálně spusťte: 
(v okně příkazové řádky, přesuňte se do adresáře, kde máte uloženy soubory projektu, typicky do adresáře `zobrazeni-dat-nkod-dle-ofn`)
```shell script
..\zobrazeni-dat-nkod-dle-ofn> npm ci
..\zobrazeni-dat-nkod-dle-ofn> npm run start
```

měli byste dostat odezvu:
```shell script
Starting up http-server, serving .
Available on:
  http://192.168.2.104:8081
  http://127.0.0.1:8081
Hit CTRL-C to stop the server
```
Okno příkazové řádky nezavírejte.

* Otevřete prohlížeč na adrese, kterou vám vypíše předchozí příkaz, tedy typicky 
[http://127.0.0.1:8081](http://127.0.0.1:8081)

Při řešení problémů s CORS pro projekty hostované na [gitlab.com]() (které jsou v testovacích datech) je pro vývoj zprovozněna lokální proxy, kterou je možné spustit 
`..\zobrazeni-dat-nkod-dle-ofn> npm run start-proxy` a nechat běžet ve vlastním okně (`cmd`), nebo na pozadí

## Konfigurace aplikace
Aplikace má dva konfigurační soubory, sdílené pro obě příkladové stránky

### applications.json
[opendata-mvcr/zobrazeni-dat-nkod-dle-ofn/blob/main/src/conf/applications.json]()

Zde se konfigurují aplikace, které umí zpracovat otevřená data nějakým dalším způsobem. Pokud se tyto aplikace umí inicializovat pomocí parametrů v URL, tato konfigurace tomo umí využít.
Příklad konfigurace

 Parametry:
 * `název`: Název externí aplikace, zobrazí se vedle zdroje dat 
 * `popis`: Popis externí aplikace, zobrazí je jako nápověda (tooltip)
 * `zpracovává`: Pole, které umí vyjmenovat, jaké typy (IRI) umí aplikace zpracovat, působé jako filtr
 * `url`: URL externí aplikace
 * `formát_url`: Dovolí konfigurovat, jaké url bude předáno externí aplikaci v odkazu. Dovoluje použít proměnné s následujícícm významem
 

 |URL Parametr|Význam|
 |---|---| 
 |`${0}`|link na otevřená data, které mají být zpracována aplikací|
 |`${1}`|IRI zdroje dat|
 |`${2}`|Název zdroje dat|
 
 Příklad:          
```json
{
    "název": "Soubor plakátů",
    "popis": "Aplikace generuje plakáty pro turistické cíle",
    "zpracovává": ["https://ofn.gov.cz/turistické-cíle/2020-07-01/"],
    "url": "https://opendata-mvcr.github.io/app-ofn-plakaty/#/",
    "formát_url": "dataurl=${0}"
 }
```
 
 Vygeneruje odkaz na aplikaci, která umí zpracovat typ dat `https://ofn.gov.cz/turistické-cíle/2020-07-01/` 
 (a jen u těchto se zobrazí). Odkaz na aplikaci bude pojmenéván "Soubor plakátů", popisek bude  
 "Aplikace generuje plakáty pro turistické cíle", vygenerovaný odkaz bude
 https://opendata-mvcr.github.io/app-ofn-plakaty/#/dataurl=https://zdroj_dat_z_otevreneho_zdroje.cz/abc
 
 Třesná adresa samozřejmě závisí na skutečných datech přečtených ze zdroje otevřených dat.
 
### config.json
[opendata-mvcr/zobrazeni-dat-nkod-dle-ofn/blob/main/src/conf/config.json]()

Konfiguruje samotnou aplikaci, tedy, jaké URL jsou k dispozici. 
Dovolí konfigurovat obsahy voleb (dropdown select) v aplikaci, tedy z jakých zdrojů uživatel vybírá 
a jaké typy dat v daném zdroji má aplikace vyhledat.
