/**
 * EXPOSENA CGAO 2026 - LÓGICA PRINCIPAL
 * Compatible con GitHub Pages (100% Client-Side)
 * Soporta almacenamiento en IndexedDB, compresión de imágenes, exportación Excel y ZIP.
 */

// Cronograma estructurado oficial Exposena CGAO 2026
const CRONOGRAMA_DATA = {
  1: {
    nombre: "Día 1: Martes 27 Octubre - Evento de Investigación",
    actividades: [
      { id: "d1-inscripcion", texto: "a) Carpa de inscripción al evento (Grupos Mañana 7:45 am)" },
      { id: "d1-apertura", texto: "b) Acto de apertura (8:00 am Auditorio) y conferencias hasta las 10:00 am" },
      { id: "d1-poster-lab", texto: "c.1) Exposición de póster - Bloque Laboratorio (Ambientes 207, 208, 110) [10:00 am - 10:30 am]" },
      { id: "d1-poster-biblio", texto: "c.2) Exposición de póster - Bloque Biblioteca (Ambientes 201, 202, 203, 204) [10:30 am - 11:00 am]" },
      { id: "d1-poster-admin", texto: "c.3) Exposición de póster - Bloque Administrativo (Ambientes 104, 206, 205) [11:00 am - 11:30 am]" },
      { id: "d1-poster-nuevo", texto: "c.4) Exposición de póster - Edificio Nuevo (TICs, BIM, Enfermería) [11:30 am - 12:00 m]" }
    ]
  },
  2: {
    nombre: "Día 2: Miércoles 28 Octubre - Encuentros Deportivos & Cultura",
    actividades: [
      { id: "d2-deportivo", texto: "a) Evento Deportivo - Coliseo de Ferias (8:00 am - Grupos Mañana con Instructor)" },
      { id: "d2-cultural", texto: "b) Acto Cultural - Centro de Formación (3:40 pm llegada / 4:00 pm inicio - Tarde y Noche)" }
    ]
  },
  3: {
    nombre: "Día 3: Jueves 29 Octubre - Finales Deportivas & SENA Karting",
    actividades: [
      { id: "d3-finales", texto: "a) Finales Deportivas - Coliseo de Ferias (8:00 am - Grupos Mañana con Instructor)" },
      { id: "d3-karting", texto: "b) SENA Karting 🏁 - Parque Nacional del Folclor (1:50 pm llegada / 2:00 pm carrera por la 9na)" }
    ]
  },
  4: {
    nombre: "Día 4: Viernes 30 Octubre - Carnaval de la Creatividad",
    actividades: [
      { id: "d4-carnaval", texto: "Carnaval de la Creatividad 🎭 - Parque del Folclor Calle 10ma (8:45 am - Las 3 Jornadas)" }
    ]
  },
  5: {
    nombre: "Día 5: Sábado 31 Octubre - Feria Empresarial",
    actividades: [
      { id: "d5-feria", texto: "Feria Empresarial y de Emprendimiento 🚀 - Parque del Folclor (Desde las 9:00 am)" }
    ]
  }
};

// Base de Datos IndexedDB para almacenar fotos sin límites de tamaño de localStorage
class EvidenceStorage {
  constructor() {
    this.dbName = "ExposenaCGAO2026_DB";
    this.dbVersion = 1;
    this.storeName = "evidencias";
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });
          store.createIndex("dia", "dia", { unique: false });
          store.createIndex("cedula", "cedula", { unique: false });
          store.createIndex("fechaTimestamp", "fechaTimestamp", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error("Error al abrir IndexedDB:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async addEvidence(evidence) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.add(evidence);

      request.onsuccess = () => resolve(evidence);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async getAllEvidences() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        // Ordenar del más reciente al más antiguo
        const list = request.result || [];
        list.sort((a, b) => b.fechaTimestamp - a.fechaTimestamp);
        resolve(list);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async deleteEvidence(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async clearAll() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  }
}

// Inicialización de la Aplicación
const storage = new EvidenceStorage();

// Documento Oficial del Instructor Autorizado para Descargas y Eliminación
const INSTRUCTOR_CEDULA = "1099202449";

function isInstructor() {
  const isLoggedDoc = AppState.currentUser && String(AppState.currentUser.cedula).trim() === INSTRUCTOR_CEDULA;
  const isStoredAuth = localStorage.getItem("exposena_instructor_auth") === INSTRUCTOR_CEDULA;
  return Boolean(isLoggedDoc || isStoredAuth);
}

function updateInstructorUI() {
  const instructorTools = document.getElementById("instructorTools");
  const instructorUnlockHint = document.getElementById("instructorUnlockHint");
  const btnInstructorTrigger = document.getElementById("btnInstructorTrigger");
  const instructorStatusLabel = document.getElementById("instructorStatusLabel");

  if (isInstructor()) {
    if (instructorTools) instructorTools.style.display = "flex";
    if (instructorUnlockHint) instructorUnlockHint.style.display = "none";
    if (instructorStatusLabel) instructorStatusLabel.textContent = "👨‍🏫 Instructor (Salir)";
    if (btnInstructorTrigger) {
      btnInstructorTrigger.style.background = "rgba(57, 169, 0, 0.25)";
      btnInstructorTrigger.style.borderColor = "var(--sena-green)";
      btnInstructorTrigger.style.color = "#4ade80";
    }
  } else {
    if (instructorTools) instructorTools.style.display = "none";
    if (instructorUnlockHint) instructorUnlockHint.style.display = "block";
    if (instructorStatusLabel) instructorStatusLabel.textContent = "Instructor";
    if (btnInstructorTrigger) {
      btnInstructorTrigger.style.background = "";
      btnInstructorTrigger.style.borderColor = "";
      btnInstructorTrigger.style.color = "";
    }
  }
}

const AppState = {
  currentUser: null,
  currentFilter: "all",
  searchQuery: "",
  allEvidences: [],
  selectedImageDataUrl: null,
  selectedImageFileName: "",
  cloudWebhookUrl: localStorage.getItem("exposena_webhook_url") || ""
};

// ==========================================================================
// UTILIDADES
// ==========================================================================

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const iconMap = {
    success: "✅",
    error: "❌",
    info: "ℹ️"
  };

  toast.innerHTML = `<span>${iconMap[type] || "ℹ️"}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Compresión Inteligente de Imágenes en el Navegador
// Reduce imágenes pesadas de 10MB tomadas con celular a ~250KB preservando excelente nitidez
function compressImage(file, maxDimension = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, '0');
  const dia = pad(d.getDate());
  const mes = pad(d.getMonth() + 1);
  const anio = d.getFullYear();
  let horas = d.getHours();
  const minutos = pad(d.getMinutes());
  const ampm = horas >= 12 ? 'PM' : 'AM';
  horas = horas % 12 || 12;
  return `${dia}/${mes}/${anio} ${pad(horas)}:${minutos} ${ampm}`;
}

// ==========================================================================
// GESTIÓN DE USUARIO / APRENDIZ
// ==========================================================================

function loadStoredUser() {
  const userJson = localStorage.getItem("exposena_current_user");
  if (userJson) {
    try {
      AppState.currentUser = JSON.parse(userJson);
      updateUserUI();
    } catch (e) {
      console.error("Error al cargar usuario de localStorage", e);
    }
  } else {
    updateUserUI();
  }
}

function saveUser(nombre, cedula, ficha, jornada) {
  const user = {
    nombre: nombre.trim(),
    cedula: cedula.trim(),
    ficha: ficha.trim(),
    jornada: jornada
  };
  localStorage.setItem("exposena_current_user", JSON.stringify(user));
  AppState.currentUser = user;

  if (user.cedula === INSTRUCTOR_CEDULA) {
    localStorage.setItem("exposena_instructor_auth", INSTRUCTOR_CEDULA);
    showToast(`¡Bienvenido Instructor ${user.nombre}! Permisos de administración activos.`, "success");
  } else {
    showToast(`¡Bienvenido, ${user.nombre}!`, "success");
  }

  updateUserUI();
  updateInstructorUI();
  renderGallery();
}

function logoutUser() {
  localStorage.removeItem("exposena_current_user");
  AppState.currentUser = null;
  updateUserUI();
  updateInstructorUI();
  renderGallery();
  showToast("Sesión cerrada. Puedes ingresar con otro aprendiz.", "info");
}

function updateUserUI() {
  const userBadge = document.getElementById("userBadge");
  const btnLoginTrigger = document.getElementById("btnLoginTrigger");
  const authNotice = document.getElementById("authNotice");
  const displayUserName = document.getElementById("displayUserName");
  const displayUserCedula = document.getElementById("displayUserCedula");
  const userAvatar = document.getElementById("userAvatar");

  // Inputs en el formulario
  const inputNombre = document.getElementById("inputNombre");
  const inputCedula = document.getElementById("inputCedula");
  const inputAmbiente = document.getElementById("inputAmbiente");

  if (AppState.currentUser) {
    userBadge.style.display = "flex";
    btnLoginTrigger.style.display = "none";
    if (authNotice) authNotice.style.display = "none";

    displayUserName.textContent = AppState.currentUser.nombre;
    displayUserCedula.textContent = `C.C. ${AppState.currentUser.cedula}`;
    
    // Obtener iniciales
    const parts = AppState.currentUser.nombre.split(" ").filter(Boolean);
    const initials = parts.slice(0, 2).map(p => p[0].toUpperCase()).join("");
    userAvatar.textContent = initials || "AP";

    if (inputNombre) inputNombre.value = AppState.currentUser.nombre;
    if (inputCedula) inputCedula.value = AppState.currentUser.cedula;
    if (inputAmbiente && !inputAmbiente.value) inputAmbiente.value = AppState.currentUser.ficha;
  } else {
    userBadge.style.display = "none";
    btnLoginTrigger.style.display = "inline-flex";
    if (authNotice) authNotice.style.display = "flex";

    if (inputNombre) inputNombre.value = "";
    if (inputCedula) inputCedula.value = "";
  }
}

// ==========================================================================
// CRONOGRAMA INTERACTIVO Y SELECTOR DINÁMICO
// ==========================================================================

function initCronograma() {
  const tabs = document.querySelectorAll(".day-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const dayNum = tab.getAttribute("data-day");
      
      // Activar pestaña
      tabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      // Mostrar panel correspondiente
      document.querySelectorAll(".day-panel").forEach(p => p.classList.remove("active"));
      const targetPanel = document.getElementById(`dayPanel-${dayNum}`);
      if (targetPanel) targetPanel.classList.add("active");
    });
  });

  // Listener para el selector de día en el formulario
  const selectDia = document.getElementById("selectDia");
  if (selectDia) {
    selectDia.addEventListener("change", (e) => {
      populateActivitiesSelect(e.target.value);
    });
    // Poblar inicialmente con Día 1
    populateActivitiesSelect(1);
  }
}

function populateActivitiesSelect(dayNumber, selectedActivityId = null) {
  const selectActividad = document.getElementById("selectActividad");
  if (!selectActividad) return;

  selectActividad.innerHTML = "";
  const dayData = CRONOGRAMA_DATA[dayNumber];
  if (!dayData) return;

  dayData.actividades.forEach(act => {
    const option = document.createElement("option");
    option.value = act.texto;
    option.textContent = act.texto;
    if (selectedActivityId && (act.id === selectedActivityId || act.texto.includes(selectedActivityId))) {
      option.selected = true;
    }
    selectActividad.appendChild(option);
  });
}

function preselectDayAndScroll(dayNumber, keyword = null) {
  const selectDia = document.getElementById("selectDia");
  if (selectDia) {
    selectDia.value = dayNumber;
    populateActivitiesSelect(dayNumber);

    if (keyword) {
      const selectActividad = document.getElementById("selectActividad");
      for (let i = 0; i < selectActividad.options.length; i++) {
        if (selectActividad.options[i].text.toLowerCase().includes(keyword.toLowerCase())) {
          selectActividad.selectedIndex = i;
          break;
        }
      }
    }
  }

  // Scroll suave al formulario de subida
  const uploadSec = document.getElementById("subir");
  if (uploadSec) {
    uploadSec.scrollIntoView({ behavior: "smooth" });
  }

  // Si no está autenticado, abrir modal
  if (!AppState.currentUser) {
    openModal("loginModal");
  }
}

// ==========================================================================
// SUBIDA DE ARCHIVOS Y CÁMARA
// ==========================================================================

function initUploadHandlers() {
  const fileInput = document.getElementById("fileInput");
  const dropZone = document.getElementById("dropZone");
  const dropPrompt = document.getElementById("dropPrompt");
  const imagePreviewContainer = document.getElementById("imagePreviewContainer");
  const imagePreview = document.getElementById("imagePreview");
  const previewFileInfo = document.getElementById("previewFileInfo");
  const btnRemovePhoto = document.getElementById("btnRemovePhoto");
  const btnTriggerCamera = document.getElementById("btnTriggerCamera");
  const btnTriggerGallery = document.getElementById("btnTriggerGallery");
  const uploadForm = document.getElementById("uploadForm");

  // Botón Cámara (configura capture='environment')
  if (btnTriggerCamera) {
    btnTriggerCamera.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.setAttribute("capture", "environment");
      fileInput.click();
    });
  }

  // Botón Galería (remueve capture para abrir selector de fotos)
  if (btnTriggerGallery) {
    btnTriggerGallery.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.removeAttribute("capture");
      fileInput.click();
    });
  }

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      handleImageSelection(files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageSelection(e.target.files[0]);
    }
  });

  btnRemovePhoto.addEventListener("click", (e) => {
    e.stopPropagation();
    clearSelectedPhoto();
  });

  async function handleImageSelection(file) {
    if (!file.type.startsWith("image/")) {
      showToast("El archivo seleccionado no es una imagen válida.", "error");
      return;
    }

    try {
      showToast("Optimizando imagen fotográfica...", "info");
      const compressedData = await compressImage(file);
      AppState.selectedImageDataUrl = compressedData;
      AppState.selectedImageFileName = file.name;

      imagePreview.src = compressedData;
      dropPrompt.style.display = "none";
      imagePreviewContainer.style.display = "block";
      
      const approxSizeKB = Math.round((compressedData.length * 3/4) / 1024);
      previewFileInfo.textContent = `Foto optimizada (${approxSizeKB} KB) - ${file.name}`;
      showToast("¡Foto lista para registrar!", "success");
    } catch (err) {
      console.error("Error al procesar la imagen:", err);
      showToast("No se pudo procesar la imagen seleccionada.", "error");
    }
  }

  function clearSelectedPhoto() {
    AppState.selectedImageDataUrl = null;
    AppState.selectedImageFileName = "";
    fileInput.value = "";
    imagePreview.src = "";
    imagePreviewContainer.style.display = "none";
    dropPrompt.style.display = "flex";
  }

  // Envío del Formulario
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("inputNombre").value.trim();
    const cedula = document.getElementById("inputCedula").value.trim();
    const ambiente = document.getElementById("inputAmbiente").value.trim();
    const instructor = document.getElementById("inputInstructor").value.trim();
    const dia = parseInt(document.getElementById("selectDia").value, 10);
    const actividad = document.getElementById("selectActividad").value;
    const descripcion = document.getElementById("inputDescripcion").value.trim();

    if (!nombre || !cedula) {
      showToast("Debes ingresar el nombre y la cédula del aprendiz.", "error");
      openModal("loginModal");
      return;
    }

    if (!ambiente) {
      showToast("Por favor especifica tu ambiente o número de ficha.", "error");
      document.getElementById("inputAmbiente").focus();
      return;
    }

    if (!AppState.selectedImageDataUrl) {
      showToast("Debes tomar una foto o seleccionar una imagen como evidencia.", "error");
      return;
    }

    // Si el usuario actual no coincide o no existía, guardarlo
    if (!AppState.currentUser || AppState.currentUser.cedula !== cedula) {
      saveUser(nombre, cedula, ambiente, "General");
    }

    const btnSubmit = document.getElementById("btnSubmitEvidence");
    const btnSpinner = document.getElementById("btnSpinner");
    const btnSubmitText = document.getElementById("btnSubmitText");

    btnSubmit.disabled = true;
    btnSpinner.style.display = "inline-block";
    btnSubmitText.textContent = "Guardando Evidencia...";

    const timestamp = Date.now();
    const evidenceItem = {
      id: "evi_" + timestamp + "_" + Math.random().toString(36).substring(2, 8),
      nombre,
      cedula,
      ambiente,
      instructor,
      dia,
      actividad,
      descripcion,
      fotoDataUrl: AppState.selectedImageDataUrl,
      fotoNombre: AppState.selectedImageFileName || `evidencia_dia${dia}.jpg`,
      fechaTimestamp: timestamp,
      fechaFormateada: formatDate(timestamp)
    };

    try {
      await storage.addEvidence(evidenceItem);
      
      // Sincronización Opcional con Nube (Google Script o Webhook) si está configurado
      if (AppState.cloudWebhookUrl) {
        syncToCloudWebhook(evidenceItem);
      }

      showToast("¡Evidencia fotográfica registrada con éxito!", "success");
      clearSelectedPhoto();
      document.getElementById("inputDescripcion").value = "";

      // Recargar galería y actualizar estadísticas
      await refreshEvidenceList();

      // Scroll hacia la galería
      setTimeout(() => {
        const gal = document.getElementById("galeria");
        if (gal) gal.scrollIntoView({ behavior: "smooth" });
      }, 500);

    } catch (err) {
      console.error("Error al guardar la evidencia:", err);
      showToast("Ocurrió un error al guardar la evidencia en la base de datos.", "error");
    } finally {
      btnSubmit.disabled = false;
      btnSpinner.style.display = "none";
      btnSubmitText.textContent = "💾 Guardar Evidencia Fotográfica";
    }
  });
}

// Sincronización Opcional en Segundo Plano a la Nube (Google Sheets / Drive)
async function syncToCloudWebhook(evidence) {
  try {
    fetch(AppState.cloudWebhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: evidence.id,
        nombre: evidence.nombre,
        cedula: evidence.cedula,
        ambiente: evidence.ambiente,
        instructor: evidence.instructor,
        dia: evidence.dia,
        actividad: evidence.actividad,
        fecha: evidence.fechaFormateada,
        descripcion: evidence.descripcion,
        fotoBase64: evidence.fotoDataUrl
      })
    });
    console.log("Evidencia enviada al Webhook de la Nube.");
  } catch (e) {
    console.warn("No se pudo conectar al webhook de la nube (offline o URL inválida).", e);
  }
}

// ==========================================================================
// RENDERIZADO Y CONTROL DE LA GALERÍA
// ==========================================================================

async function refreshEvidenceList() {
  AppState.allEvidences = await storage.getAllEvidences();
  updateStats();
  renderGallery();
}

function updateStats() {
  const total = AppState.allEvidences.length;
  document.getElementById("statTotalEvidencias").textContent = total;
  document.getElementById("totalEvidenciasCount").textContent = total;
  document.getElementById("countAll").textContent = total;

  // Aprendices únicos (por número de cédula)
  const uniqueCedulas = new Set(AppState.allEvidences.map(e => e.cedula));
  document.getElementById("statTotalAprendices").textContent = uniqueCedulas.size;

  // Conteos por día
  for (let i = 1; i <= 5; i++) {
    const count = AppState.allEvidences.filter(e => e.dia === i).length;
    const el = document.getElementById(`countD${i}`);
    if (el) el.textContent = count;
  }
}

function renderGallery() {
  const galleryGrid = document.getElementById("galleryGrid");
  const emptyState = document.getElementById("emptyState");

  // Filtrado por Día y por Búsqueda
  let filtered = AppState.allEvidences;

  if (AppState.currentFilter !== "all") {
    const dayFilterNum = parseInt(AppState.currentFilter, 10);
    filtered = filtered.filter(e => e.dia === dayFilterNum);
  }

  if (AppState.searchQuery) {
    const q = AppState.searchQuery.toLowerCase();
    filtered = filtered.filter(e => 
      e.nombre.toLowerCase().includes(q) ||
      e.cedula.toLowerCase().includes(q) ||
      (e.ambiente && e.ambiente.toLowerCase().includes(q)) ||
      (e.actividad && e.actividad.toLowerCase().includes(q)) ||
      (e.descripcion && e.descripcion.toLowerCase().includes(q))
    );
  }

  galleryGrid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "evidence-card";
    
    const initials = item.nombre
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join("") || "AP";

    card.innerHTML = `
      <div class="evidence-thumb-wrapper" onclick="window.ExposenaApp.openLightbox('${item.id}')">
        <img class="evidence-thumb" src="${item.fotoDataUrl}" alt="${item.actividad}" loading="lazy">
        <div class="card-badges">
          <span class="badge-day">Día ${item.dia}</span>
          <span class="badge-time">${item.fechaFormateada.split(" ")[1] || ""}</span>
        </div>
      </div>
      <div class="evidence-body">
        <h4 class="evidence-activity-title" title="${item.actividad}">${item.actividad}</h4>
        
        <div class="evidence-student-info">
          <div class="student-initials">${initials}</div>
          <div class="student-meta">
            <span class="student-name" title="${item.nombre}">${item.nombre}</span>
            <span class="student-cc">C.C. ${item.cedula}</span>
          </div>
        </div>

        <div class="evidence-ambiente">
          <span>🏛️ ${item.ambiente}</span>
        </div>

        ${item.descripcion ? `<p class="evidence-notes">${item.descripcion}</p>` : ''}

        <div class="evidence-actions">
          ${isInstructor() ? `
            <button class="btn-card-action" onclick="window.ExposenaApp.downloadSingleImage('${item.id}')" title="Descargar imagen (Exclusivo Instructor)">
              💾 Guardar Foto
            </button>
            <button class="btn-card-action text-danger" onclick="window.ExposenaApp.deleteItem('${item.id}')" title="Eliminar evidencia (Exclusivo Instructor)">
              🗑️ Eliminar
            </button>
          ` : `
            <button class="btn-card-action" onclick="window.ExposenaApp.openLightbox('${item.id}')" title="Ver foto en tamaño completo">
              🔍 Ver Detalle
            </button>
          `}
        </div>
      </div>
    `;

    galleryGrid.appendChild(card);
  });
}

function initGalleryControls() {
  // Filtros por Día
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      AppState.currentFilter = pill.getAttribute("data-filter");
      renderGallery();
    });
  });

  // Buscador en tiempo real
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value.trim();
      renderGallery();
    });
  }

  // Exportar a Excel (CSV con BOM)
  const btnExportCSV = document.getElementById("btnExportCSV");
  if (btnExportCSV) {
    btnExportCSV.addEventListener("click", exportToCSV);
  }

  // Exportar todas las fotos a ZIP
  const btnExportZIP = document.getElementById("btnExportZIP");
  if (btnExportZIP) {
    btnExportZIP.addEventListener("click", exportToZIP);
  }
}

// ==========================================================================
// EXPORTACIÓN A EXCEL (CSV UTF-8 CON BOM) Y ZIP
// ==========================================================================

function exportToCSV() {
  if (!isInstructor()) {
    showToast("Acceso denegado: Solo el instructor autorizado (C.C. 1099202449) puede descargar el reporte.", "error");
    openModal("instructorModal");
    return;
  }

  if (AppState.allEvidences.length === 0) {
    showToast("No hay evidencias registradas para exportar.", "error");
    return;
  }

  showToast("Generando reporte de Excel...", "info");

  const headers = [
    "ID Registro",
    "Nombre del Aprendiz",
    "Cédula",
    "Ambiente / Ficha",
    "Instructor",
    "Día Cronograma",
    "Actividad Específica",
    "Fecha y Hora",
    "Descripción / Notas"
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = AppState.allEvidences.map(e => [
    escapeCSV(e.id),
    escapeCSV(e.nombre),
    escapeCSV(e.cedula),
    escapeCSV(e.ambiente),
    escapeCSV(e.instructor || "N/A"),
    escapeCSV(`Día ${e.dia}`),
    escapeCSV(e.actividad),
    escapeCSV(e.fechaFormateada),
    escapeCSV(e.descripcion || "")
  ]);

  // \uFEFF es el BOM de UTF-8 que hace que Excel en Windows reconozca tildes y caracteres en español
  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `Reporte_EXPOSENA_CGAO_2026_${new Date().toISOString().slice(0, 10)}.csv`);
  showToast("Reporte descargado exitosamente.", "success");
}

async function exportToZIP() {
  if (!isInstructor()) {
    showToast("Acceso denegado: Solo el instructor autorizado (C.C. 1099202449) puede descargar las fotos en ZIP.", "error");
    openModal("instructorModal");
    return;
  }

  if (AppState.allEvidences.length === 0) {
    showToast("No hay fotos registradas para descargar.", "error");
    return;
  }

  if (typeof JSZip === "undefined") {
    showToast("La librería de compresión ZIP aún no está lista. Revisa tu conexión a internet.", "error");
    return;
  }

  showToast("Comprimiendo fotos en archivo ZIP... Por favor espera un momento.", "info");

  const zip = new JSZip();
  const folderFotos = zip.folder("Evidencias_Exposena_2026");

  // Crear reporte CSV adentro del ZIP
  const csvHeaders = "ID;Nombre;Cedula;Ambiente;Dia;Actividad;Fecha;NombreArchivo\r\n";
  let csvText = "\uFEFF" + csvHeaders;

  AppState.allEvidences.forEach((item, index) => {
    // Sanitizar nombres para nombres de archivos limpios
    const cleanNombre = item.nombre.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20);
    const fileName = `Dia${item.dia}_${item.cedula}_${cleanNombre}_${index + 1}.jpg`;

    // Extraer base64 crudo
    const base64Data = item.fotoDataUrl.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    folderFotos.file(fileName, base64Data, { base64: true });

    csvText += `"${item.id}";"${item.nombre}";"${item.cedula}";"${item.ambiente}";"Dia ${item.dia}";"${item.actividad}";"${item.fechaFormateada}";"${fileName}"\r\n`;
  });

  zip.file("Reporte_Evidencias.csv", csvText);

  try {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `Evidencias_EXPOSENA_CGAO_2026.zip`);
    showToast("¡Archivo ZIP con todas las fotos descargado!", "success");
  } catch (err) {
    console.error("Error al generar el ZIP:", err);
    showToast("Error al generar el archivo ZIP.", "error");
  }
}

// ==========================================================================
// MODALES Y ACCIONES GLOBALES
// ==========================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
}

function initModals() {
  // Login Modal
  const btnLoginTrigger = document.getElementById("btnLoginTrigger");
  const btnOpenAuthFromUpload = document.getElementById("btnOpenAuthFromUpload");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const loginForm = document.getElementById("loginForm");
  const btnLogout = document.getElementById("btnLogout");

  if (btnLoginTrigger) btnLoginTrigger.addEventListener("click", () => openModal("loginModal"));
  if (btnOpenAuthFromUpload) btnOpenAuthFromUpload.addEventListener("click", () => openModal("loginModal"));
  if (btnCloseModal) btnCloseModal.addEventListener("click", () => closeModal("loginModal"));

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = document.getElementById("loginNombre").value;
      const cedula = document.getElementById("loginCedula").value;
      const ficha = document.getElementById("loginFicha").value;
      const jornada = document.getElementById("loginJornada").value;

      if (!nombre.trim() || !cedula.trim()) {
        showToast("Nombre y Cédula son obligatorios.", "error");
        return;
      }

      saveUser(nombre, cedula, ficha, jornada);
      closeModal("loginModal");
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", logoutUser);
  }

  // Cloud / GitHub Help Modal
  const btnOpenCloudHelp = document.getElementById("btnOpenCloudHelp");
  const btnCloseCloudModal = document.getElementById("btnCloseCloudModal");
  const btnSaveWebhook = document.getElementById("btnSaveWebhook");
  const webhookUrlInput = document.getElementById("webhookUrlInput");

  if (webhookUrlInput && AppState.cloudWebhookUrl) {
    webhookUrlInput.value = AppState.cloudWebhookUrl;
  }

  if (btnOpenCloudHelp) btnOpenCloudHelp.addEventListener("click", () => openModal("cloudModal"));
  if (btnCloseCloudModal) btnCloseCloudModal.addEventListener("click", () => closeModal("cloudModal"));

  if (btnSaveWebhook) {
    btnSaveWebhook.addEventListener("click", () => {
      const url = webhookUrlInput.value.trim();
      AppState.cloudWebhookUrl = url;
      localStorage.setItem("exposena_webhook_url", url);
      showToast("Configuración de nube guardada.", "success");
      closeModal("cloudModal");
    });
  }

  // Lightbox Close
  const btnLightboxClose = document.getElementById("btnLightboxClose");
  const lightboxModal = document.getElementById("lightboxModal");
  if (btnLightboxClose) btnLightboxClose.addEventListener("click", () => lightboxModal.classList.remove("active"));
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) lightboxModal.classList.remove("active");
    });
  }

  // Restablecer Datos
  const btnClearAllData = document.getElementById("btnClearAllData");
  if (btnClearAllData) {
    btnClearAllData.addEventListener("click", async () => {
      const confirmFirst = confirm("¿Estás seguro de que deseas eliminar todas las evidencias registradas en este navegador?");
      if (confirmFirst) {
        const confirmSecond = confirm("Esta acción no se puede deshacer. Se borrarán todas las fotos locales. ¿Confirmar?");
        if (confirmSecond) {
          await storage.clearAll();
          await refreshEvidenceList();
          showToast("Todos los datos locales han sido restablecidos.", "info");
        }
      }
    });
  }
  // Instructor Modal & Trigger
  const btnInstructorTrigger = document.getElementById("btnInstructorTrigger");
  const btnCloseInstructorModal = document.getElementById("btnCloseInstructorModal");
  const instructorForm = document.getElementById("instructorForm");

  if (btnInstructorTrigger) {
    btnInstructorTrigger.addEventListener("click", () => {
      if (isInstructor()) {
        if (confirm("¿Deseas cerrar la sesión del Modo Instructor?")) {
          localStorage.removeItem("exposena_instructor_auth");
          updateInstructorUI();
          renderGallery();
          showToast("Has salido del Modo Instructor.", "info");
        }
      } else {
        openModal("instructorModal");
      }
    });
  }

  if (btnCloseInstructorModal) {
    btnCloseInstructorModal.addEventListener("click", () => closeModal("instructorModal"));
  }

  if (instructorForm) {
    instructorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const docInput = document.getElementById("instructorDocInput").value.trim();
      if (docInput === INSTRUCTOR_CEDULA) {
        localStorage.setItem("exposena_instructor_auth", INSTRUCTOR_CEDULA);
        updateInstructorUI();
        renderGallery();
        closeModal("instructorModal");
        document.getElementById("instructorDocInput").value = "";
        showToast("¡Modo Instructor Autorizado! Descargas y gestión desbloqueadas.", "success");
      } else {
        showToast("Documento no autorizado. Solo el instructor asignado tiene acceso.", "error");
      }
    });
  }
}

// Objeto Global Expuesto para Eventos Inline en HTML
window.ExposenaApp = {
  preselectDayAndScroll,
  requestInstructorAccess: () => {
    openModal("instructorModal");
  },
  openLightbox: (id) => {
    const item = AppState.allEvidences.find(e => e.id === id);
    if (!item) return;

    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxDetails = document.getElementById("lightboxDetails");

    lightboxImage.src = item.fotoDataUrl;
    lightboxDetails.innerHTML = `
      <h3 style="color: #fff; margin-bottom: 6px;">${item.actividad}</h3>
      <p style="color: #39A900; font-weight: 700; margin-bottom: 4px;">Aprendiz: ${item.nombre} (C.C. ${item.cedula})</p>
      <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 8px;">Ambiente: ${item.ambiente} • Fecha: ${item.fechaFormateada}</p>
      ${item.descripcion ? `<p style="color: #cbd5e1; font-size: 0.9rem; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 6px;">${item.descripcion}</p>` : ''}
    `;

    lightboxModal.classList.add("active");
  },
  downloadSingleImage: (id) => {
    if (!isInstructor()) {
      showToast("Acceso denegado: Solo el instructor autorizado puede descargar fotos.", "error");
      openModal("instructorModal");
      return;
    }
    const item = AppState.allEvidences.find(e => e.id === id);
    if (!item) return;
    const cleanNombre = item.nombre.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Dia${item.dia}_${item.cedula}_${cleanNombre}.jpg`;
    
    // Crear enlace de descarga
    const link = document.createElement("a");
    link.href = item.fotoDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Descargando foto...", "success");
  },
  openBannerLightbox: () => {
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxDetails = document.getElementById("lightboxDetails");

    lightboxImage.src = "assets/banner.jpg";
    lightboxDetails.innerHTML = `
      <h3 style="color: #fff; margin-bottom: 6px;">EXPOSENA CGAO 2026 - Afiche y Cronograma Oficial</h3>
      <p style="color: #39A900; font-weight: 700; margin-bottom: 4px;">SENA Centro de Gestión Agroempresarial del Oriente</p>
      <p style="color: #cbd5e1; font-size: 0.88rem;">Talento • Innovación • Trabajo • Futuro • ¡5 días, una sola experiencia!</p>
    `;
    lightboxModal.classList.add("active");
  },
  deleteItem: async (id) => {
    if (!isInstructor()) {
      showToast("Acceso denegado: Solo el instructor autorizado (C.C. 1099202449) puede eliminar evidencias.", "error");
      openModal("instructorModal");
      return;
    }
    if (confirm("¿Estás seguro de que deseas eliminar esta evidencia fotográfica? Esta acción no se puede deshacer.")) {
      await storage.deleteEvidence(id);
      await refreshEvidenceList();
      showToast("Evidencia eliminada correctamente.", "info");
    }
  }
};

// Arrancar Aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", async () => {
  await storage.init();
  loadStoredUser();
  updateInstructorUI();
  initCronograma();
  initUploadHandlers();
  initGalleryControls();
  initModals();
  await refreshEvidenceList();
});
