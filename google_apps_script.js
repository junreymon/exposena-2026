/**
 * =========================================================================
 * EXPOSENA CGAO 2026 - RECEPTOR OFICIAL PARA GOOGLE APPS SCRIPT
 * =========================================================================
 * Este script recibe los registros de ingreso y evidencias fotográficas
 * de los aprendices desde la página web de Exposena 2026.
 * 
 * ¿QUÉ HACE ESTE SCRIPT?
 * 1. Registra automáticamente cada ingreso / evidencia en una fila de Google Sheets.
 * 2. Si el aprendiz tomó o subió una foto, la guarda automáticamente en una
 *    carpeta de Google Drive llamada "Fotos_Exposena_CGAO_2026".
 * 3. Inserta el enlace directo de Google Drive en la columna de la hoja.
 * 4. Evita colisiones de guardado simultáneo usando LockService.
 * =========================================================================
 */

function doPost(e) {
  try {
    // Bloqueo de concurrencia para que si varios aprendices guardan a la vez no se sobreescriban
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No se recibieron datos en la petición POST."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Usar la hoja 'Ingresos_Exposena' o la hoja activa
    var sheet = ss.getSheetByName("Ingresos_Exposena");
    if (!sheet) {
      sheet = ss.getActiveSheet();
      sheet.setName("Ingresos_Exposena");
    }

    // Si la hoja no tiene encabezados, crearlos automáticamente con diseño institucional SENA
    if (sheet.getLastRow() === 0) {
      var headers = [
        "ID Registro",
        "Tipo de Registro",
        "Fecha y Hora",
        "Nombre Completo",
        "Cédula / Documento",
        "Ambiente / Ficha",
        "Jornada",
        "Día Cronograma",
        "Actividad Específica",
        "Descripción / Notas",
        "Foto (Enlace Google Drive)"
      ];
      sheet.appendRow(headers);

      // Aplicar estilo al encabezado: Verde SENA (#39A900), texto blanco y negrita
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#39A900");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var driveFotoUrl = "Sin foto";

    // Si se envió foto en Base64, guardarla en Google Drive
    if (data.fotoBase64 && typeof data.fotoBase64 === "string" && data.fotoBase64.indexOf("data:image") !== -1) {
      try {
        var folderName = "Fotos_Exposena_CGAO_2026";
        var folders = DriveApp.getFoldersByName(folderName);
        var folder;
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder(folderName);
        }

        var base64Data = data.fotoBase64.split(",")[1];
        var decodedBytes = Utilities.base64Decode(base64Data);
        var cleanNombre = (data.nombre || "Aprendiz").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 25);
        var tipoLimpio = (data.tipo || "Registro").replace(/[^a-zA-Z0-9]/g, "_");
        var fileName = tipoLimpio + "_" + (data.cedula || "sin_cc") + "_" + cleanNombre + "_" + Date.now() + ".jpg";
        
        var blob = Utilities.newBlob(decodedBytes, "image/jpeg", fileName);
        var file = folder.createFile(blob);
        
        // Dar permisos de lectura con enlace
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        driveFotoUrl = file.getUrl();
      } catch (errFoto) {
        driveFotoUrl = "Error al guardar foto en Drive: " + errFoto.toString();
      }
    }

    // Agregar la fila con los datos recibidos
    var rowData = [
      data.id || ("REG-" + Date.now()),
      data.tipo || "Ingreso de Aprendiz",
      data.fecha || new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
      data.nombre || "",
      "'" + (data.cedula || ""), // Apóstrofe inicial para mantener formato de texto en cédulas
      data.ambiente || data.ficha || "",
      data.jornada || "General",
      data.dia ? ("Día " + data.dia) : "Día 1",
      data.actividad || "Ingreso Oficial Exposena 2026",
      data.descripcion || "",
      driveFotoUrl
    ];

    sheet.appendRow(rowData);

    // Autoajustar columnas básicas
    try {
      sheet.autoResizeColumns(1, 9);
    } catch (eResize) {}

    lock.releaseLock();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registro guardado correctamente en Google Sheet",
      fotoUrl: driveFotoUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    if (lock) {
      try { lock.releaseLock(); } catch (e) {}
    }
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función GET para probar fácilmente desde el navegador si el script está activo
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    mensaje: "Receptor de Exposena CGAO 2026 activo y listo para recibir datos."
  })).setMimeType(ContentService.MimeType.JSON);
}
