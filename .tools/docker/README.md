# Docker — Shop Vue + Firestore

Wieloetapowy obraz: Node buduje bundle Vite, nginx serwuje gotowe pliki
statyczne z obsluga trybu history Vue Routera.

## Wymagania

- Docker Engine 24+ z wtyczka `docker compose`

## Uruchomienie

Wszystkie polecenia wykonuj z katalogu `.tools/docker`:

```bash
cd .tools/docker
docker compose up --build
```

Sklep dziala pod adresem <http://localhost:8080>.

Do pracy nad kodem z hot-reloadem uzyj konfiguracji deweloperskiej:

\`\`\`bash
docker compose -f docker-compose.dev.yml up
\`\`\`

Serwer deweloperski Vite nasluchuje wtedy na <http://localhost:5173>.

Konfiguracje Firebase podaj przez zmienne srodowiskowe albo plik \`.env\`
w katalogu glownym projektu — klucze nie sa wersjonowane w repozytorium.

## Zatrzymanie

```bash
docker compose down
```

Aby usunac takze wolumeny z danymi:

```bash
docker compose down -v
```
