# 🚀 EXPOSENA CGAO 2026 - Portal de Evidencias Fotográficas

Aplicación web institucional desarrollada para el **Centro de Gestión Agroempresarial del Oriente (CGAO) - SENA**, diseñada para desplegarse de manera 100% gratuita en **GitHub Pages**.

Permite que cada aprendiz registre su asistencia y participación en las actividades de la **Exposena 2026**, capturando evidencias fotográficas directamente desde la cámara de su celular o galería, asociadas a su **Nombre Completo**, **Cédula** y la **Actividad del Cronograma Oficial**.

---

## 📅 Cronograma Oficial Integrado

* **Día 1: Martes 27 Octubre • Evento de Investigación**
  * a) Carpa de inscripción al evento (Grupos mañana 7:45 am).
  * b) Acto de apertura (8:00 am Auditorio) y conferencias hasta las 10:00 am.
  * c) Exposición de póster por ambientes en el polideportivo:
    * *10:00 am - 10:30 am:* Bloque Laboratorio (Ambientes 207, 208, 110).
    * *10:30 am - 11:00 am:* Bloque Biblioteca (Ambientes 201, 202, 203, 204).
    * *11:00 am - 11:30 am:* Bloque Administrativo (Ambientes 104, 206, 205).
    * *11:30 am - 12:00 m:* Edificio Nuevo (TICs, BIM, Enfermería).
* **Día 2: Miércoles 28 Octubre • Encuentros Deportivos & Cultura**
  * a) Evento Deportivo: Coliseo de Ferias a las 8:00 am (jornada mañana).
  * b) Acto Cultural: Centro de Formación a las 4:00 pm (llegada 3:40 pm jornada tarde y noche).
* **Día 3: Jueves 29 Octubre • Finales Deportivas & SENA Karting**
  * a) Finales Deportivas: Coliseo de Ferias a las 8:00 am.
  * b) SENA Karting 🏁: Parque Nacional del Folclor a las 2:00 pm (llegada 1:50 pm tarde, por la novena).
* **Día 4: Viernes 30 Octubre • Carnaval de la Creatividad**
  * Carnaval de la Creatividad 🎭: Parque del Folclor por la calle 10ma a las 8:45 am (las 3 jornadas).
* **Día 5: Sábado 31 Octubre • Feria Empresarial**
  * Feria Empresarial y de Emprendimiento 🚀: Parque del Folclor desde las 9:00 am.

---

## 🌐 ¿Cómo subir esta página a GitHub Pages Gratis?

Para publicar este portal y compartir el enlace con aprendices e instructores, sigue estos sencillos pasos:

### Paso 1: Crear el repositorio en GitHub
1. Ingresa a [github.com](https://github.com) e inicia sesión con tu cuenta.
2. Haz clic en el botón verde **"New"** (Nuevo repositorio).
3. Nómbralo por ejemplo: `exposena-2026` o `exposena-cgao`.
4. Asegúrate de marcarlo como **Public** (Público).
5. Haz clic en **"Create repository"**.

### Paso 2: Subir los archivos del proyecto
Puedes subir los archivos directamente desde el navegador o por consola Git:
* **Opción A (Desde el navegador Web sin comandos):**
  1. En la página de tu repositorio vacío, haz clic en el enlace que dice **"uploading an existing file"**.
  2. Arrastra todos los archivos de esta carpeta:
     * `index.html`
     * `styles.css`
     * `app.js`
     * Carpeta `assets/` (con `banner.jpg`)
     * `README.md`
  3. Haz clic en el botón verde **"Commit changes"**.

* **Opción B (Por consola de Git):**
  ```bash
  git init
  git add .
  git commit -m "Portal Exposena CGAO 2026 listo para GitHub Pages"
  git branch -M main
  git remote add origin https://github.com/TU-USUARIO/exposena-2026.git
  git push -u origin main
  ```

### Paso 3: Activar GitHub Pages
1. En tu repositorio en GitHub, ve a la pestaña superior **"Settings"** (Configuración).
2. En el menú lateral izquierdo, haz clic en **"Pages"**.
3. En la sección **"Build and deployment"** > **"Branch"**:
   * Selecciona la rama `main` (o `master`).
   * Deja la carpeta en `/ (root)`.
4. Haz clic en **"Save"**.
5. ¡Listo! En 1 a 2 minutos GitHub te mostrará una caja verde con tu enlace público:
   `https://tu-usuario.github.io/exposena-2026/`

---

## 📱 Características y Funcionalidades para Aprendices

1. **Autenticación y Registro:**
   * El aprendiz ingresa su **Nombre Completo**, **Cédula de Ciudadanía**, **Ficha / Ambiente** y **Jornada**.
   * La sesión queda guardada para que no tenga que volver a escribir sus datos cada vez que tome una foto durante el día.
   * Cuenta con botón *"Cambiar"* por si un compañero usa el mismo dispositivo.
2. **Cámara Rápida y Optimización:**
   * Botón dedicado para activar la **Cámara del Celular** o seleccionar fotos de la galería.
   * Compresión automática por Canvas (reduce fotos pesadas de 10 MB a ~250 KB sin perder nitidez), ahorrando datos móviles y memoria.
3. **Cronograma Dinámico e Interactivo:**
   * Al tocar cualquier actividad del cronograma, el formulario se auto-rellena con el día y horario exacto.
4. **Galería en Tiempo Real:**
   * Filtros por día (Día 1 al Día 5).
   * Buscador instantáneo por nombre de aprendiz, cédula o ambiente de formación.
   * Visor de fotos en pantalla completa con zoom y descarga individual.
5. **Herramientas de Exportación para Instructores:**
   * **Descargar Reporte (Excel):** Exporta un archivo `.csv` compatible con Microsoft Excel (formato UTF-8 con BOM para que respete acentos y la letra ñ) con todos los registros detallados.
   * **Descargar Fotos (ZIP):** Empaqueta todas las fotografías en un archivo `.zip` comprimido y ordenado con nombres descriptivos (`Dia1_Cedula_Nombre.jpg`).

---

## ☁️ Opcional: Centralización en Google Drive / Google Sheets

Dado que GitHub Pages es un servidor estático, la página almacena las fotos localmente en el navegador de cada usuario con **IndexedDB** (capacidad de cientos de megabytes).

Si deseas que todas las fotos subidas desde múltiples celulares se guarden automáticamente en un **Google Drive compartido** y se listen en un **Google Sheet**, la aplicación incluye soporte nativo para **Webhooks**:

1. En Google Drive, crea una Hoja de Cálculo de Google.
2. Ve a **Extensiones > Apps Script**.
3. Pega este sencillo código receptor:
   ```javascript
   function doPost(e) {
     var data = JSON.parse(e.postData.contents);
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     
     // Guarda en la hoja
     sheet.appendRow([data.id, data.nombre, data.cedula, data.ambiente, data.dia, data.actividad, data.fecha, data.descripcion]);
     
     // Opcional: guarda foto en Drive
     if (data.fotoBase64) {
       var bytes = Utilities.base64Decode(data.fotoBase64.split(",")[1]);
       var blob = Utilities.newBlob(bytes, "image/jpeg", data.nombre + "_" + data.dia + ".jpg");
       DriveApp.createFile(blob);
     }
     
     return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
   }
   ```
4. Haz clic en **Implementar > Nueva implementación > Aplicación web** (Acceso: *Cualquiera*).
5. Copia la URL generada y pégala en el pie de página de la web en **"Guía de GitHub & Nube"**.
