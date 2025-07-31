
# 📊 PlatzPilot KA - Lernplatz-Verfügbarkeit & Prognose für Bibliotheken in Karlsruhe

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/navendu-pottekkat/awesome-readme?include_prereleases)](https://img.shields.io/github/v/release/navendu-pottekkat/awesome-readme?include_prereleases)
[![GitHub last commit](https://img.shields.io/github/last-commit/navendu-pottekkat/awesome-readme)](https://img.shields.io/github/last-commit/navendu-pottekkat/awesome-readme)
[![GitHub](https://img.shields.io/github/license/navendu-pottekkat/awesome-readme)](https://img.shields.io/github/license/navendu-pottekkat/awesome-readme)

**PlatzPilot** ist eine App mit Python-basiertem Backend-System, das:

- 🔄 regelmäßig die aktuelle Lernplatzbelegung der Bibliotheken abruft
- 💾 diese Daten effizient in einem Ringbuffer speichert
- 📈 für jedes Gebäude ein Vorhersagemodell trainiert (TODO)
- 🔮 Vorhersagen über die Lernplatzverfügbarkeit in naher Zukunft generiert (TODO)

---

## 🚀 Funktionen

- ⏱ Effizientes Polling alle 5 Minuten mit Timeout, Retry und Backoff
- 🧠 Zeitreihen-Vorhersage pro Gebäude mit `pmdarima.auto_arima`
- 💾 Speicherfreundliche Ablage der Daten via NumPy `memmap` im Ringbuffer
- 📁 Modulare, wartbare Python-Codebasis
- 🔐 Robuste Fehlerbehandlung und zentrale Logging-Infrastruktur
