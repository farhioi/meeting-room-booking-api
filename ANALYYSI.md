# ANALYYSI

## 1. Mitä tekoäly teki hyvin?

Tekoäly tuotti nopeasti toimivan perusratkaisun REST API:lle Node.js:n ja Expressin avulla.  
Se loi järkevän rakenteen sovellukselle, sisälsi tarvittavat endpointit (varauksen luonti, peruutus ja listaus) sekä hyödynsi muistissa olevaa tallennusta tehtävänannon mukaisesti.

Lisäksi tekoäly huomioi tärkeät perusvaatimukset, kuten:
- startTime on ennen endTimea
- varauksia ei voi luoda menneisyyteen
- saman huoneen varaukset eivät saa mennä päällekkäin

Tämä tarjosi hyvän lähtökohdan jatkokehitykselle ja säästi aikaa perusrakenteen luomisessa.

---

## 2. Mitä tekoäly teki huonosti?

Tekoälyn tuottamassa koodissa oli useita kehityskohtia:
- Virheenkäsittely oli epäyhtenäistä (eri virheviestit ja HTTP-statuskoodit eri tilanteissa).
- Validointi oli melko pintapuolista eikä käsitellyt kaikkia reunatapauksia selkeästi.
- Liiketoimintalogiikka oli sijoitettu suoraan route-handlereihin, mikä heikensi koodin luettavuutta ja ylläpidettävyyttä.
- Päällekkäisyystarkistus toimi, mutta sen logiikka ei ollut heti helposti ymmärrettävissä ilman tarkempaa lukemista.
- Koodista puuttui tuotantomaisuutta tukevia elementtejä, kuten erillinen health-check-endpoint.

---

## 3. Mitkä olivat tärkeimmät parannukset, jotka teit tekoälyn tuottamaan koodiin ja miksi?

Tein useita parannuksia tekoälyn tuottamaan koodiin:

**Yhtenäinen validointi ja virheenkäsittely**  
Lisäsin keskitetyn virhevastauksen ja selkeät virhekoodit. Tämä tekee API:sta helpomman käyttää ja parantaa virhetilanteiden ymmärrettävyyttä.

**Selkeämpi päällekkäisyystarkistus**  
Paransin päällekkäisyyslogiikkaa niin, että aikarajojen käyttäytyminen on yksiselitteistä. Esimerkiksi varaus, joka alkaa täsmälleen toisen varauksen päättyessä, on sallittu.

**Refaktorointi ja vastuunjako**  
Erotin varauslogiikan omiin funktioihin (esim. createBooking ja deleteBookingById), jolloin route-handlerit pysyvät lyhyinä ja luettavina. Tämä parantaa koodin ylläpidettävyyttä ja testattavuutta.

**Health-endpointin lisääminen**  
Lisäsin `/health`-endpointin, joka mahdollistaa sovelluksen toiminnan nopean tarkistamisen. Tämä on tyypillinen käytäntö tuotantoympäristöissä ja parantaa sovelluksen valmiusastetta.

Näiden parannusten avulla koodi on nyt selkeämpi, luotettavampi ja lähempänä oikeaa tuotantokäyttöä verrattuna alkuperäiseen tekoälyn tuottamaan versioon.
