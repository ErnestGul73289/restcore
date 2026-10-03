# Restcore

Restcore to aplikacja webowa do przeglądania ćwiczeń, śledzenia postępów i
prowadzenia treningu z użyciem kamery. Projekt składa się ze statycznych plików
HTML, CSS i JavaScript — nie wymaga instalowania zależności ani uruchamiania
serwera backendowego.

## Wymagania

- przeglądarka internetowa, np. aktualna wersja Chrome lub Edge;
- połączenie z internetem, potrzebne do załadowania bibliotek i stylów z CDN;
- kamera i zgoda na jej użycie, jeśli chcesz skorzystać z treningu z kamerą.

## Pobranie projektu

Jeśli masz zainstalowany Git, sklonuj repozytorium i przejdź do katalogu:

```bash
git clone https://github.com/ErnestGul73289/restcore.git
cd restcore
```

Możesz też pobrać projekt z GitHuba jako archiwum ZIP i rozpakować je na
komputerze.

## Uruchomienie

Nie otwieraj pliku HTML bezpośrednio z dysku (`file://`). Uruchom projekt przez
lokalny serwer HTTP.

### Opcja 1: Visual Studio Code i Live Server

1. Otwórz folder projektu `restcore` w Visual Studio Code.
2. Zainstaluj rozszerzenie **Live Server**, jeśli nie jest jeszcze
   zainstalowane.
3. Kliknij prawym przyciskiem myszy plik `index.html` w głównym folderze
   projektu.
4. Wybierz **Open with Live Server**.
5. Aplikacja otworzy się w przeglądarce. Strona główna znajduje się pod
   adresem `http://127.0.0.1:5500/` lub podobnym, wyświetlonym przez Live Server.

### Opcja 2: Python

Otwórz terminal w głównym folderze projektu i uruchom:

```bash
python -m http.server 8000
```

Jeśli polecenie `python` nie jest dostępne, spróbuj:

```bash
python3 -m http.server 8000
```

Następnie otwórz w przeglądarce adres <http://localhost:8000>.
Aby zatrzymać serwer, wróć do terminala i naciśnij `Ctrl+C`.

## Korzystanie z kamery

Otwórz sekcję **Kamera** i naciśnij **Uruchom kamerę**. Gdy przeglądarka
zapyta o dostęp do kamery, zezwól na niego. Kamera działa na bezpiecznym
pochodzeniu — `localhost` lub połączeniu HTTPS — dlatego uruchom aplikację
przez jeden z powyższych serwerów, a nie przez plik otwarty bezpośrednio z dysku.

## Dane aplikacji

Ustawienia i postępy są przechowywane lokalnie w pamięci przeglądarki
(`localStorage`). Nie są automatycznie synchronizowane między przeglądarkami
ani urządzeniami. Wyczyszczenie danych witryny w przeglądarce może je usunąć.
