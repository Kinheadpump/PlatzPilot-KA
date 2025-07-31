
# 📊 PlatzPilot KA 

Lernplatz-Verfügbarkeit & Prognose für Bibliotheken in Karlsruhe.

---

**PlatzPilot** ist eine App mit Python-basiertem Backend-System, welche:

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
