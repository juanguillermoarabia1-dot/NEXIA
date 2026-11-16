# NEXIA 1.0 — interfaz inicial

## Contenido
- `index.html`: estructura de la interfaz.
- `style.css`: diseño adaptable a móvil y escritorio.
- `script.js`: botones, conversaciones e historial local.

## Cómo abrir
1. Instala Visual Studio Code.
2. Crea una carpeta llamada `NEXIA`.
3. Copia estos tres archivos dentro.
4. Abre la carpeta desde Visual Studio Code.
5. Abre `index.html` en un navegador (puedes usar la extensión Live Server).

## Estado importante
Esta entrega es SOLO la interfaz inicial. Guarda el historial en el almacenamiento local del navegador/WebView.
Todavía NO ejecuta un modelo de inteligencia artificial. El mensaje automático lo explica y no simula una respuesta real.

## Próxima etapa para IA sin créditos
Hay que crear la aplicación Android nativa e integrar un runtime local (por ejemplo, llama.cpp/Android NDK) y un modelo GGUF pequeño. El modelo se descarga una vez y ocupa almacenamiento; la generación consume batería, memoria y procesamiento. El Samsung Galaxy A04 será el dispositivo que limite el tamaño y la velocidad. No se puede prometer que un mismo modelo funcione bien en ambos sin probarlo.

No pegues claves API en esta versión. No contiene llamadas a Gemini ni a otros servicios.
