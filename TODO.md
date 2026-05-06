# TODO — Elektroniczny bilet miejski

## Etap 1: Frontend

### Programista A

- [x] Zainicjalizować Angular + Tailwind w `frontend/`.
- [x] Dodać routing: `/login`, `/register`, `/offer`, `/my-tickets`, `/inspector/check`.
- [x] Zaimplementować widoki i komponenty formularzy.
- [x] Dodać walidację formularzy i obsługę błędów UI.

### Programista B

- [x] Przygotować modele DTO i serwisy HTTP.
- [x] Dodać auth guard i przechowywanie tokenu.
- [x] Spiąć widoki z API (na start możliwe mocki).
- [x] Dodać testy komponentów krytycznych ścieżek.

### Poprawki

- [x] Zapewnić komunikat "pusta lista" dla oferty biletów
- [ ] Widok konkretnego biletu - Ładny card z qr codem i możliwością skopiowania, gradientowy background
- [ ] Empty states dla innych widoków
- [x] Lucide icons
- [x] Walidacja biletów
- [ ] NavigationLinks hover dla active jest błędnego koloru
- [ ] NavigationLinks i header - poprawić wygląd na urządzeniach pobilnych
- [ ] Historia transakcji - poprawić wygląd na urządzeniach pobilnych (tabela wygląda źle)

## Etap 2: Backend

### Programista A

- [ ] Endpointy auth: rejestracja/logowanie.
- [ ] Role: `PASSENGER`, `INSPECTOR`.
- [ ] Endpointy oferty biletowej i zakupu.
- [ ] Logika biznesowa zakupionych biletów (`my tickets`, historia transakcji).

### Programista B

- [ ] Endpoint REST dla kasownika (kasowanie biletu).
- [ ] Endpoint REST dla biletera (weryfikacja ważności biletu).
- [ ] Generowanie unikalnego kodu biletu.
- [ ] Testy reguł ważności dla biletów jednorazowych/czasowych/okresowych.

## Etap 3: Data persistence

### Programista A

- [ ] Zaprojektować encje i relacje.
- [ ] Przygotować migracje Flyway.
- [ ] Dodać repozytoria i podstawowe zapytania.
- [ ] Zapewnić spójność transakcji przy zakupie i walidacji.

### Programista B

- [ ] Dodać ograniczenia DB (FK, unique, check).
- [ ] Dodać indeksy pod częste zapytania.
- [ ] Przygotować dane startowe oferty biletów.
- [ ] Napisać testy repozytoriów i scenariusze integracyjne z PostgreSQL.

## CI i jakość

- [ ] Utrzymać zielone CI po każdym pushu.
- [ ] Dodać testy jednostkowe i integracyjne zgodnie ze strategią testowania.
- [ ] Utworzyć tagi `etap1`, `etap2`, `etap3` po zakończeniu etapów.
