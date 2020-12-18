# zobrazeni-dat-nkod-dle-ofn
Aplikace pro zobrazení dat dle Otevřených formálních norem

## Lokální vývoj, spuštění

* Ujistěte se, že máte nainstalován program nodejs a npm.
Použijte [node.js](https://nodejs.org/en/download/) ve verzi 14+ (nainstalujte, pokud nemáte z odkazu). Ověřte instalaci spuštěním příkazu `node` a příkazu `npm` 
(ve windows stiskněte Win+R, napište "cmd", enter, otevře se černé okno příkazové řádky kam můžete vepsat tyto příkazy)

* Lokálně spusťte: 
(v okně příkazové řádky, přesuňte se do adresáře, kde máte uloženy soubory projektu, typicky do adresáře `zobrazeni-dat-nkod-dle-ofn`)
``` shell script
..\zobrazeni-dat-nkod-dle-ofn> npm i
..\zobrazeni-dat-nkod-dle-ofn> npm run start
```
měli byste dostat odezvu:
``` shlell script
Starting up http-server, serving .
Available on:
  http://192.168.2.104:8081
  http://127.0.0.1:8081
Hit CTRL-C to stop the server
```
Okno příkazové řádky nezavírejte.

* Otevřete prohlížeč na adrese, kterou vám vypíše předchozí příkaz, tedy typicky 
[http://127.0.0.1:8081](http://127.0.0.1:8081)
