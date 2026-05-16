# Elektroniczny bilet miejski

Scaffolding projektu dla zespołu 2-osobowego: **Java Spring Boot + Angular + Tailwind CSS**.

Szczegółowa dokumentacja projektowa: **`DOKUMENTACJA_PROJEKTU.md`**.

## Cel

Aplikacja umożliwia:
- rejestrację i logowanie użytkowników,
- zakup i przegląd biletów (jednorazowe, czasowe, okresowe; normalne i ulgowe),
- kasowanie biletów przez kasownik (REST),
- weryfikację ważności biletu przez biletera.

## Stos technologiczny

- **Backend:** Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Flyway
- **Frontend:** Angular + Tailwind CSS
- **Baza danych:** PostgreSQL
- **CI:** GitHub Actions (workflow uruchamiany po każdym `push` i `pull_request`)

## Struktura repo

```text
.
├── .github/workflows/ci.yml
├── backend/
│   ├── pom.xml
│   └── src/
├── frontend/
├── infra/
│   └── docker-compose.yml
└── TODO.md
```

## Etapy i podział prac (2 programistów)

### Etap 1 — Frontend

**Programista A**
- inicjalizacja Angular + Tailwind,
- layout i routing (logowanie/rejestracja/oferta/moje bilety/weryfikacja),
- komponenty formularzy i walidacja UI.

**Programista B**
- serwisy HTTP + modele DTO,
- guardy/autoryzacja po stronie SPA,
- integracja ekranów z backend API (mocki na start).

### Etap 2 — Backend

**Programista A**
- auth (rejestracja/logowanie, role PASSENGER/INSPECTOR),
- API oferty i zakupu biletów,
- reguły walidacji domenowej.

**Programista B**
- API kasownika i API kontroli biletu,
- generacja unikalnego kodu biletu,
- testy jednostkowe i integracyjne logiki ważności biletu.

### Etap 3 — Data persistence

**Programista A**
- model encji i relacje,
- migracje Flyway,
- repozytoria i transakcyjność.

**Programista B**
- indeksy i ograniczenia (unikalność, integralność),
- przygotowanie danych startowych/oferty,
- testy repozytoriów i scenariusze z bazą PostgreSQL.

## CI/CD

Workflow: `.github/workflows/ci.yml`
- uruchamia się na każdym `push` i `pull_request`,
- backend: `mvn test`,
- frontend: przygotowane miejsce na `npm ci && npm run test`.

## Tagi etapów (wymóg zaliczenia)

Po zakończeniu każdego etapu utwórz tag:

1. `etap1`
2. `etap2`
3. `etap3`

Przykład:

```bash
git tag etap1
git push origin etap1
```

## Szybki start

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Baza danych lokalnie

```bash
docker compose -f infra/docker-compose.yml up -d
```

Podgląd bazy w przeglądarce: `http://localhost:8081` (Adminer)

Logowanie w Adminer:
- system: PostgreSQL
- serwer: `postgres`
- użytkownik: `eticket`
- hasło: `eticket`
- baza: `eticket`

Seedowane konta:
- `passenger@example.com` / `Passenger123!`
- `inspector@example.com` / `Inspector123!`

### Frontend (inicjalizacja)

```bash
cd frontend
npx @angular/cli@latest new webapp --directory . --routing --style css --skip-git
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
