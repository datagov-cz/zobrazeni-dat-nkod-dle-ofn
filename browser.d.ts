import "datatables.net-bs4";
/** aplikace se spouštítouto funkcí a všechny části, které mohou zdržet uživatle, beží asynchronně, využívá návrhového
 * vzoru s klíčovými slovy async/await {@link https://en.wikipedia.org/wiki/Async/await}
 *
 */
export declare function renderBrowserApp(elementId: string): Promise<void>;
