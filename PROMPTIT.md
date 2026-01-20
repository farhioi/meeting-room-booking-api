# PROMPTIT

## Käytetty prompt

I want you to act as a software developer.

Please implement a simple REST API for booking meeting rooms using Node.js and Express.

Requirements:
- The API should allow creating a booking, cancelling a booking, and listing bookings for a meeting room.
- Each booking must have: roomId, startTime, endTime.
- Bookings must not overlap for the same room.
- Bookings must not be created in the past.
- startTime must be before endTime.
- Use in-memory storage (no database).
- Keep the implementation simple and readable.

Please provide the full implementation in a single file and briefly explain how the API works.

---

## Tekoälyn tuottama ratkaisu (tiivistetty kuvaus)

Tekoäly tuotti Node.js- ja Express-pohjaisen REST API:n yhdessä tiedostossa.  
Ratkaisu sisälsi:
- Express-palvelimen alustuksen
- In-memory-taulukon varausten tallentamiseen
- Endpointit varauksen luontiin, poistoon ja huonekohtaiseen listaukseen
- Aikavalidoinnin (startTime ennen endTimea ja ei menneisyyteen)
- Päällekkäisyyden eston saman huoneen varauksille

Tämä ratkaisu toimi hyvänä lähtökohtana jatkokehitykselle, mutta vaati refaktorointia, selkeämmän virheenkäsittelyn ja rakenteellisia parannuksia, jotka on kuvattu erillisessä `ANALYYSI.md`-tiedostossa.
