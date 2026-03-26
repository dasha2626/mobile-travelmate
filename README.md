> ⚠️ This project is currently in progress.

# TravelMate Mobile


TravelMate Mobile to aplikacja mobilna zbudowana w React Native (Expo) do planowania i dokumentowania podróży.

## Funkcjonalności

- 🗺️ Interaktywna mapa – dodawanie podróży przez przytrzymanie mapy z automatycznym geokodowaniem adresu
- 📍 Zarządzanie podróżami – dodawanie, edytowanie, usuwanie oraz zmiana lokalizacji na mapie
- 🏨 Szczegóły podróży – noclegi, transport i punkty zwiedzania z lokalizacją na mapie
- 🤖 Planer AI (Gemini 2.5 Flash) – generowanie destynacji na podstawie preferencji stylu, budżetu, czasu i towarzysza podróży
- ❤️ Polubione destynacje – zapisywanie i przeglądanie polubionych miejsc z planera


## Technologie

- React Native / Expo
- Node.js + Express
- MySQL
- Gemini API, Nominatim

## Instalacja

1. Sklonuj repozytorium
2. Utwórz plik `.env` na podstawie `.env.example` i uzupełnij swoje dane
3. Zainstaluj zależności: `npm install`
4. Utwórz bazę danych MySQL i zaimportuj schemat: `mysql -u root -p nazwa_bazy < server/database.sql`
5. Uruchom serwer: `cd server && node app.js`
6. Uruchom aplikację: `npx expo start`

---

# TravelMate Mobile

TravelMate Mobile is a mobile application built with React Native (Expo) for planning and documenting trips.

## Features

- 🗺️ Interactive map – add trips by long-pressing the map with automatic address geocoding
- 📍 Trip management – add, edit, delete and relocate trips on the map
- 🏨 Trip details – accommodations, transport and points of interest with map location
- 🤖 AI Planner (Gemini 2.5 Flash) – generates destinations based on travel style, budget, duration and companion preferences
- ❤️ Liked destinations – save and browse liked places from the planner


## Technologies

- React Native / Expo
- Node.js + Express
- MySQL
- Gemini API, Nominatim

## Setup

1. Clone the repository
2. Create `.env` file based on `.env.example` and fill in your own values
3. Install dependencies: `npm install`
4. Create a MySQL database and import the schema: `mysql -u root -p your_database < server/database.sql`
5. Start the server: `cd server && node app.js`
6. Start the app: `npx expo start`
