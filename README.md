# kto-ui-common
kouta-ui ja konfo-ui yhteisiä resursseja

## Mock-työkalut

KTO-projektissa on toteutettu omat työkalut API-kutsujen mockauksen helpottamiseen. Työkalut koostuvat kolmesta erillisestä osasta.

- [update-mocks.js](https://github.com/Opetushallitus/kto-ui-common/blob/main/scripts/update-mocks.js) node.js skripti, joka käy läpi JSON-muotoiset mock-tiedostot, kutsuu niissä määriteltyjä HTTP-pyyntöjä ja päivittää vastaukset kyseisiin tiedostoihin.
- [playMocks ja playMockFile](https://github.com/Opetushallitus/kto-ui-common/blob/main/cypress/mockUtils.js) cypress-apufunktiot, jotka käyvät läpi mock-määrittelyt ja ottavat ne käyttöön cypress-testissä. `playMocks` ottaa parametrina JS-objektin ja `playMockFile` tiedoston nimen.
- [recordMockFileTemplate](https://github.com/Opetushallitus/kto-ui-common/blob/main/cypress/mockUtils.js#L26) cypress-apufunktio, jonka avulla voi cypress-testissä nauhoittaa tiedostoon kaikki cypress-testitiedostossa tehdyt kutsut mock-tiedoston pohjaksi.

Työkalut olettavat mock-tiedostojen hakemistoksi `cypress/mocks` projektin juurihakemistossa. Polkua voi vaihtaa asettamalla ympäristömuuttujan `MOCKS_ROOT`.

**Huom! Työkalut toimivat toistaiseksi vain rajapinnoille, jotka palauttavat tekstimuotoista dataa.**

### Mock-tiedostojen JSON-formaatti ja luominen

Mock-tiedostojen formaatti on seuraavanlainen:

```jsonc
[
    {
        "url": "https://example.com", // URL-johon pyyntö tehdään.
        "method": "GET" // HTTP-pyynnön verbi. Voi jättää pois, jolloin oletus on "GET"
        "body": {
            "id": 12345
        }, // Pyynnön data, jos kyse on esim. POST-pyynnöstä. Ei pakollinen.
        response: { // Pyynnön vastaus. update-mocks-skripti päivittää nämä.
            status: 200,
            body: {
                "id": 12345,
                "info": "something"
            }
        }
    }
    // Lisää vastaavanlaisia objekteja
]
```
Pakolliset kentät yksittäisille määrittelyille ovat `url` ja `response`. Uusia mock-tiedostoja voi luoda kirjoittamalla käsin määrittelyn mukaisia tiedostoja, joissa ei ole `response`-osia ja kutsumalla `update-mocks.js`-skriptiä. Tällaisia "mock-pohjia" voi myös luoda [recordMockFileTemplate](https://github.com/Opetushallitus/kto-ui-common/blob/main/cypress/mockUtils.js#L26)-funktiola kutsumalla sitä cypress-testistä:

```js
describe('testsuite', () => {
  // Tallentaan tämän tiedoston testeissä tehdyt kutsut projektihakemistossa tiedostoon cypress/mocks/testsuite.mocks.json.template
  recordMockFileTemplate('testsuite.mocks.json.template')
  it('test', () => {
    // testikoodia...
  });
});
```

Luotu mock-pohja (template) todennäköisesti sisältää liikaa pyyntöjä, joten sitä kannattaa siistiä ennen kuin sen "päivittää" [update-mocks.js](https://github.com/Opetushallitus/kto-ui-common/blob/main/scripts/update-mocks.js)-skriptillä.

### Mock-tiedostojen päivitys (update-mocks.js)

Olemassaolevia mock-tiedostoja voi päivittää [update-mocks.js](https://github.com/Opetushallitus/kto-ui-common/blob/main/scripts/update-mocks.js)-skriptillä, joka oletusasetuksilla käy läpi kaikki json-tiedostot hakemistosta `cypress/mocks`, tekee niissä määritellyt API-kutsut ja päivittää niiden `response`-kentät. Skriptille voi antaa parametrina `glob`-merkkijonon, jos ei halua päivittää kaikkia mock-tiedostoja. 

Esimerkiksi seuraava komento päivittää vain mock-tiedoston nimeltä "test.mocks.json":
```
node ./scripts/update-mocks.js test.mocks.json
```

Mock-tiedostot, joiden tiedostonimi alkaa merkkijonolla "test" voi päivittää kutsumalla
```
node ./scripts/update-mocks.js "test*"
```

### Mock-tiedostojen käyttäminen cypress-testeissä

Mock-tiedoston määrittelyt voi ottaa käyttöön cypress-testissä kahdella eri tavalla.
`playMocks` lukee mocks-tiedoston vain kerran per testitiedosto, joten se n suositeltavampi tapa.

Esimerkki [playMocks](https://github.com/Opetushallitus/kto-ui-common/blob/main/cypress/mockUtils.js)-funktion käytöstä:

```js
import testMocks from '../mocks/test.mocks.json'

describe('testsuite', () => {
  beforeEach(() => {
    playMocks(testMocks)
  });
  
  it('test', () => {
    // testikoodia...
  });
});
```

Esimerkki [playMockFile](https://github.com/Opetushallitus/kto-ui-common/blob/main/cypress/mockUtils.js)-funktion käytöstä:

```js
describe('testsuite', () => {
  beforeEach(() => {
    playMockFile('test.mocks.json')
  });
  
  it('test', () => {
    // testikoodia...
  });
});
```


