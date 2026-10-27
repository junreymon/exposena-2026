# 📊 Guía Rápida: Conectar Exposena 2026 con tu Google Sheet

Sigue estos 5 sencillos pasos para que **todos los aprendices que ingresen o suban fotos desde sus celulares** se guarden en vivo en tu archivo de Google Sheets y las fotos en Google Drive:

---

### Paso 1: Crear la Hoja de Cálculo en Google Drive
1. Ve a [drive.google.com](https://drive.google.com) o [sheets.new](https://sheets.new) (con tu cuenta de Google o correo SENA).
2. Nombra tu hoja: **"Control de Ingresos Exposena 2026"**.

---

### Paso 2: Abrir Apps Script
1. En el menú superior de la hoja de cálculo, haz clic en **Extensiones** > **Apps Script**.
2. Se abrirá una nueva pestaña con un editor de código.
3. Borra todo lo que aparezca en el editor (`function myFunction() { ... }`).
4. Abre el archivo [`google_apps_script.js`](./google_apps_script.js) de este proyecto, copia todo su contenido y pégalo en el editor de Apps Script.
5. Haz clic en el icono del **Disquete (Guardar)** 💾 o presiona `Ctrl + S`.

---

### Paso 3: Publicar como Aplicación Web (¡Paso Clave!)
1. En la esquina superior derecha de Apps Script, haz clic en el botón azul **"Implementar"** (Deploy) y selecciona **"Nueva implementación"**.
2. Haz clic en el icono de engranaje ⚙️ junto a *"Seleccionar tipo"* y elige **"Aplicación web"**.
3. Configura exactamente así:
   * **Descripción:** `Receptor Exposena 2026`
   * **Ejecutar como:** `Yo (tu correo electrónico)`
   * **Quién tiene acceso:** **`Cualquier usuario`** *(¡Muy importante! Debe ser "Cualquier usuario" o "Anyone" para que los celulares de los aprendices puedan enviar datos sin pedir inicio de sesión de Google).*
4. Haz clic en el botón azul **"Implementar"**.
5. Si Google te pide autorizar permisos:
   * Haz clic en **Revisar permisos**.
   * Elige tu cuenta de Google.
   * Si sale aviso de "Google no ha verificado esta aplicación", haz clic en **Configuración avanzada** y luego en **Ir a Proyecto (no seguro)**.
   * Haz clic en **Permitir**.

---

### Paso 4: Copiar la URL de la Aplicación Web
1. Apps Script te mostrará una ventana con la **"URL de la aplicación web"**.
   * Tiene un formato como este:
     `https://script.google.com/macros/s/AKfycbx...TU_ID.../exec`
2. Haz clic en **Copiar**.

---

### Paso 5: Pegar la URL en la Página Web
Puedes conectarla de dos formas:

* **Opción A (Desde la misma página web sin editar código):**
  1. Abre tu página de Exposena 2026 en el navegador.
  2. Haz clic en el botón **"⚙️ Google Sheet"** (en la barra superior o en el pie de página).
  3. Pega la URL que copiaste y haz clic en **"Guardar y Conectar"**.
  4. ¡Listo! Verás el indicador verde **🟢 Google Sheet Conectado**.

* **Opción B (Fijarla fija para todos en el archivo `app.js`):**
  1. Abre `app.js`.
  2. En la línea 8, reemplaza `DEFAULT_GOOGLE_SHEET_URL = ""` con tu URL:
     ```javascript
     const DEFAULT_GOOGLE_SHEET_URL = "https://script.google.com/macros/s/TU_ID/exec";
     ```
  3. Guarda y sube los cambios a GitHub. De esta manera, **todos los celulares que abran el enlace ya tendrán la Google Sheet conectada automáticamente**.

---

### 🚀 ¿Cómo verificar que funciona?
1. En la página web, haz clic en **"Ingreso de Aprendiz"**.
2. Ingresa un nombre de prueba, cédula, ficha y toma una foto de prueba.
3. Haz clic en **"Confirmar e Ingresar"**.
4. ¡Abre tu Google Sheet! Verás aparecer la fila inmediatamente con la fecha, nombre, documento y el enlace directo a la foto guardada en Google Drive.
