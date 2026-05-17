# Dokumentacja projektu — Elektroniczny bilet miejski

Dokument roboczy do realizacji wszystkich etapów (frontend, backend, data persistence).

## 1. Zakres i cel systemu

System umożliwia:
- rejestrację i logowanie użytkowników,
- przeglądanie oferty biletów (jednorazowe, czasowe, okresowe; normalne i ulgowe),
- zakup biletu i podgląd „Moje bilety” oraz historii transakcji,
- kasowanie biletów przez system kasowników (REST),
- kontrolę biletu przez biletera na podstawie kodu biletu i identyfikatora pojazdu.

## 2. Role i uprawnienia

| Rola / status | Uprawnienia |
|---|---|
| `PASSENGER` | Rejestracja/logowanie, przegląd oferty, zakup biletu, podgląd swoich biletów i transakcji |
| `INSPECTOR` | Logowanie, weryfikacja ważności biletu (kod + pojazd) |
| Niezalogowany użytkownik | Dostęp tylko do `/login`, `/register`, `/not-found` oraz tras publicznych |

## 3. Reguły biznesowe ważności biletu

1. **Bilet okresowy** — ważny, jeśli data kontroli mieści się w `[validFrom, validTo]`.
2. **Bilet jednorazowy** — ważny, jeśli został skasowany (`activatedAt != null`) i `activatedVehicleId` jest równy pojazdowi kontroli.
3. **Bilet czasowy** — ważny, jeśli został skasowany i od `activatedAt` nie upłynął czas z oferty (`durationMinutes`).
4. Bilet nieskasowany (jednorazowy/czasowy) jest **nieważny**.
5. Każdy bilet ma unikalny kod `code`.

## 4. Architektura

- **Frontend:** Angular + Tailwind, SPA z route guards.
- **Backend:** Spring Boot (REST), Spring Security (JWT), JPA/Hibernate.
- **DB:** PostgreSQL + Flyway.
- **Integracje:** REST dla kasowników i biletera.
- **Podgląd DB:** Adminer z `infra/docker-compose.yml`.
- **Dane logowania Adminer:** `postgres / eticket / eticket`, baza `eticket`.
- **Seedowane konta:** `passenger@example.com / Passenger123!`, `inspector@example.com / Inspector123!`

## 5. Routing frontendu (Angular)

| Ścieżka | Widok | Dostęp |
|---|---|---|
| `/` | Redirect do `/login` | public |
| `/login` | Logowanie | public |
| `/register` | Rejestracja | public |
| `/offer` | Oferta biletów | `PASSENGER` |
| `/offer/:offerId/purchase` | Zakup wybranego biletu | `PASSENGER` |
| `/my-tickets` | Moje bilety | `PASSENGER` |
| `/my-tickets/:ticketId` | Szczegóły biletu | `PASSENGER` |
| `/my-tickets/:ticketId/scan` | Ekran biletu (QR + kopiowanie kodu) | `PASSENGER` |
| `/transactions` | Historia transakcji | `PASSENGER` |
| `/inspector/check` | Sprawdzenie ważności biletu | `INSPECTOR` |
| `/forbidden` | Brak uprawnień | zalogowany |
| `/not-found` | Nie znaleziono strony | public |
| `/**` | Redirect do `/not-found` | public |

### Guardy
- `authGuard` — wymaga zalogowania.
- `roleGuard` — sprawdza wymagane role.
- `guestGuard` (opcjonalnie) — blokuje `/login` i `/register` dla zalogowanych.

## 6. Opis stron

### `/login`
- Formularz: email, hasło.
- Po sukcesie zapis tokenu + roli i redirect:
  - `PASSENGER` -> `/offer`
  - `INSPECTOR` -> `/inspector/check`

### `/register`
- Formularz: email, hasło, potwierdzenie hasła.
- Domyślna rola: `PASSENGER`.

### `/offer`
- Lista ofert biletowych.
- Filtrowanie: typ biletu, ulga/normalny.
- Akcja „Kup”.

### `/offer/:offerId/purchase`
- Podsumowanie oferty.
- Wybór ważności:
  - czasowy: aktywowany przy kasowaniu, czas z oferty,
  - okresowy: użytkownik wybiera datę startu (koniec liczony wg `validityDays`),
  - jednorazowy: wymaga kasowania, bez daty końca przed kasowaniem.
- Potwierdzenie zakupu.

### `/my-tickets`
- Lista zakupionych biletów: kod, typ, status, ważność, pojazd kasowania.
- Możliwość podglądu szczegółów.

### `/transactions`
- Historia operacji zakupu (kwota, data, oferta, status).

### `/inspector/check`
- Formularz: kod biletu + identyfikator pojazdu.
- Wynik: `VALID` lub `INVALID`, z krótkim powodem.

## 7. Kontrakt API (v1)

Prefix: `/api/v1`

### 7.1 Auth

#### `POST /auth/register`
Request:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```
Response `201`:
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "PASSENGER"
}
```

#### `POST /auth/login`
Request:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```
Response `200`:
```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer",
  "role": "PASSENGER"
}
```

### 7.2 Oferta i zakup (PASSENGER)

#### `GET /offers`
Response `200`:
```json
[
  {
    "id": 10,
    "name": "Bilet czasowy 20 min normalny",
    "ticketType": "TIME",
    "fareType": "NORMAL",
    "durationMinutes": 20,
    "validityDays": null,
    "price": 4.60
  }
]
```

#### `POST /tickets/purchase`
Request:
```json
{
  "offerId": 10,
  "validFrom": "2026-05-10T00:00:00Z"
}
```
`validFrom` wymagane tylko dla okresowego.

Response `201`:
```json
{
  "ticketId": 2001,
  "code": "TCK-4Q7K8R2M9P",
  "status": "PURCHASED",
  "ticketType": "TIME"
}
```

#### `GET /tickets/my`
Response `200`:
```json
[
  {
    "id": 2001,
    "code": "TCK-4Q7K8R2M9P",
    "ticketType": "TIME",
    "fareType": "NORMAL",
    "status": "ACTIVATED",
    "purchasedAt": "2026-05-04T17:00:00Z",
    "activatedAt": "2026-05-04T17:10:00Z",
    "activatedVehicleId": "KR-105",
    "validFrom": "2026-05-04T17:10:00Z",
    "validTo": "2026-05-04T17:30:00Z"
  }
]
```

#### `GET /tickets/my/{ticketId}`
Response `200`:
```json
{
  "id": 2001,
  "code": "TCK-4Q7K8R2M9P",
  "ticketType": "TIME",
  "fareType": "NORMAL",
  "status": "ACTIVATED",
  "purchasedAt": "2026-05-04T17:00:00Z",
  "activatedAt": "2026-05-04T17:10:00Z",
  "activatedVehicleId": "KR-105",
  "validFrom": "2026-05-04T17:10:00Z",
  "validTo": "2026-05-04T17:30:00Z"
}
```

#### `GET /transactions/my`
Response `200`:
```json
[
  {
    "id": 6001,
    "ticketId": 2001,
    "amount": 4.60,
    "currency": "PLN",
    "status": "SUCCESS",
    "createdAt": "2026-05-04T17:00:00Z"
  }
]
```

### 7.3 Kasownik (integracja zewnętrzna)

#### `POST /validator/activate`
Request:
```json
{
  "ticketCode": "TCK-4Q7K8R2M9P",
  "vehicleId": "KR-105",
  "activationTime": "2026-05-04T17:10:00Z"
}
```
Response `200`:
```json
{
  "ticketCode": "TCK-4Q7K8R2M9P",
  "result": "ACTIVATED"
}
```

### 7.4 Kontrola biletu (INSPECTOR)

#### `POST /inspector/check`
Request:
```json
{
  "ticketCode": "TCK-4Q7K8R2M9P",
  "vehicleId": "KR-105",
  "controlTime": "2026-05-04T17:20:00Z"
}
```
Response `200`:
```json
{
  "ticketCode": "TCK-4Q7K8R2M9P",
  "status": "VALID",
  "reason": "TIME_TICKET_ACTIVE",
  "checkedAt": "2026-05-04T17:20:00Z"
}
```

## 8. Modele domenowe i encje

## 8.1 Enumy
- `UserRole`: `PASSENGER`, `INSPECTOR`
- `TicketType`: `SINGLE`, `TIME`, `PERIOD`
- `FareType`: `NORMAL`, `REDUCED`
- `TicketStatus`: `PURCHASED`, `ACTIVATED`, `EXPIRED`, `INVALIDATED`
- `TransactionStatus`: `SUCCESS`, `FAILED`

### 8.2 Encje

#### `AppUser`
- `id: Long`
- `email: String` (unique)
- `passwordHash: String`
- `role: UserRole`
- `createdAt: Instant`

#### `TicketOffer`
- `id: Long`
- `name: String`
- `ticketType: TicketType`
- `fareType: FareType`
- `durationMinutes: Integer?` (dla czasowego)
- `validityDays: Integer?` (dla okresowego)
- `price: BigDecimal`

#### `Ticket`
- `id: Long`
- `user: AppUser`
- `offer: TicketOffer`
- `code: String` (unique)
- `status: TicketStatus`
- `purchasedAt: Instant`
- `activatedAt: Instant?`
- `activatedVehicleId: String?`
- `validFrom: Instant?`
- `validTo: Instant?`

#### `Transaction`
- `id: Long`
- `user: AppUser`
- `ticket: Ticket`
- `amount: BigDecimal`
- `currency: String` (`PLN`)
- `status: TransactionStatus`
- `createdAt: Instant`

#### `ticket_transaction`
- tabela transakcji zakupu w PostgreSQL
- podgląd przez Adminer: `http://localhost:8081`

#### `TicketCheckLog` (opcjonalnie, ale zalecane)
- `id: Long`
- `ticket: Ticket`
- `vehicleId: String`
- `checkedBy: AppUser` (inspector)
- `result: String` (`VALID`/`INVALID`)
- `reason: String`
- `checkedAt: Instant`

## 9. Persystencja i ograniczenia DB

1. Unikalność:
   - `app_user.email` unique
   - `ticket.code` unique
2. Klucze obce:
   - `ticket.user_id -> app_user.id`
   - `ticket.offer_id -> ticket_offer.id`
    - `ticket_transaction.user_id -> app_user.id`
    - `ticket_transaction.ticket_id -> ticket.id`
3. Indeksy:
   - `ticket(user_id)`
   - `ticket(code)`
   - `ticket(status)`
    - `ticket_transaction(user_id, created_at desc)`
4. Migracje przez Flyway (`V1__...`, `V2__...` itd.).

## 10. Obsługa błędów (API)

Wspólny format:
```json
{
  "timestamp": "2026-05-04T17:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "offerId is required",
  "path": "/api/v1/tickets/purchase"
}
```

Kody:
- `400` — walidacja danych
- `401` — brak/niepoprawny token
- `403` — brak roli
- `404` — zasób nie istnieje
- `409` — konflikt (np. ponowne kasowanie)
- `422` — bilet nie spełnia warunków ważności

## 11. Testowanie i jakość

### Frontend
- testy komponentów krytycznych (logowanie, zakup, kontrola),
- testy guardów i serwisów API,
- e2e ścieżki:
  - rejestracja -> zakup -> mój bilet,
  - aktywacja -> kontrola.

### Backend
- testy jednostkowe serwisów domenowych (reguły ważności),
- testy integracyjne kontrolerów i bezpieczeństwa (`MockMvc`),
- testy repozytoriów na PostgreSQL/Testcontainers.

### CI
- po każdym `push` i `pull_request`:
  - backend: `mvn test`
  - frontend: `npm ci` + `npm run test`

## 12. Podział prac na 2 programistów (na etap)

### Etap 1 — Frontend
- **Programista A:** routing, layout, formularze, UX.
- **Programista B:** API client, guardy, integracja, testy komponentów.

### Etap 2 — Backend
- **Programista A:** auth, oferta, zakup.
- **Programista B:** kasownik, kontrola biletu, logika walidacji + testy.

### Etap 3 — Data persistence
- **Programista A:** encje, repozytoria, migracje.
- **Programista B:** constraints, indeksy, dane startowe, testy DB.

## 13. Etapy zaliczeniowe i tagi

Po domknięciu każdego etapu utworzyć tag:
1. `etap1`
2. `etap2`
3. `etap3`

Przykład:
```bash
git tag etap1
git push origin etap1
```
