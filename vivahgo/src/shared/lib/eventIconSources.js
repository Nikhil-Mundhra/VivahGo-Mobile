const EVENT_ICON_SOURCES = {
  Roka: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Om_symbol.svg",
  Sagai: "/event-icons/sagai.png",
  "Ganesh Puja": "/event-icons/ganesh-ji.png",
  Haldi: "/event-icons/haldi.png",
  Mehndi: "/event-icons/mehendi.svg",
  Sangeet: "/event-icons/sangeet.png",
  Baraat: "/event-icons/baraat.png",
  Jaimala: "/event-icons/jaimala.png",
  Kanyadaan: "/event-icons/kanyadaan.png",
  Pheras: "/event-icons/pheras.svg",
  Saptapadi: "/event-icons/saptapadi.png",
  "Sindoor Daan": "/event-icons/sindoor-daan.png",
  Reception: "/event-icons/reception.png",
  Vidaai: "/event-icons/vidaai.png",
  "Griha Pravesh": "/event-icons/griha-pravesh.png",
};

export function getEventIconSource(eventName) {
  return EVENT_ICON_SOURCES[eventName] || "";
}
