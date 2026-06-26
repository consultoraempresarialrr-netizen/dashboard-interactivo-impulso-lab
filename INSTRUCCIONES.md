# IMPULSO LAB · Dashboard — Instrucciones de despliegue
## Guía completa: Google Apps Script → Netlify

---

## PASO 1 · Configurar Google Apps Script

### 1.1 Abrir el editor
1. Abrí tu Google Sheets: https://docs.google.com/spreadsheets/d/14kWDWie4rBC9QN2fqBfJQe4boBfuL3iqHX5-0DrNW78
2. Ir a **Extensions → Apps Script**
3. Se abre el editor de código

### 1.2 Pegar el código
1. Borrar todo el contenido de `Code.gs`
2. Pegar el contenido del archivo `Code.gs` que te generé
3. **MUY IMPORTANTE**: Verificar que los nombres de las hojas en el objeto `SHEETS` del archivo coincidan exactamente con los nombres de tus hojas en el Sheets:
   ```js
   const SHEETS = {
     CARTERA:    'Nombre exacto de la hoja',
     FINANCIERO: 'Nombre exacto de la hoja',
     CAJA:       'Nombre exacto de la hoja',
     CAJA_USD:   'Nombre exacto de la hoja',
   };
   ```
4. Guardar (Ctrl+S)

### 1.3 Publicar como Web App
1. Click en **Deploy → New deployment**
2. Click en el ícono de configuración ⚙ → **Web app**
3. Configurar:
   - **Description**: Dashboard Impulso Lab
   - **Execute as**: Me (tu cuenta de Google)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Copiar la URL** que aparece (algo como `https://script.google.com/macros/s/AKfyc.../exec`)

---

## PASO 2 · Conectar la URL al dashboard

1. Abrí el archivo `index.html`
2. Buscá esta línea (cerca del inicio del `<script>`):
   ```js
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/REEMPLAZAR_CON_TU_URL/exec';
   ```
3. Reemplazá `REEMPLAZAR_CON_TU_URL` con tu URL real del paso anterior
4. Cambiá también:
   ```js
   const USE_DEMO = false; // ← cambiar a false para usar datos reales
   ```
5. Guardá el archivo

---

## PASO 3 · Subir a Netlify

### Opción A: Drag & Drop (más fácil)
1. Ir a https://app.netlify.com
2. Login con tu cuenta (o crear una gratis)
3. En el dashboard, buscar **"Sites"**
4. Arrastrar la carpeta `impulso-dashboard` directamente al área que dice **"drag and drop"**
5. Netlify despliega en segundos y te da una URL como `https://nombre-aleatorio.netlify.app`

### Opción B: Via GitHub (recomendado para actualizaciones fáciles)
1. Crear repo en GitHub con los archivos
2. En Netlify: **Add new site → Import an existing project → GitHub**
3. Seleccionar el repo
4. Build settings: dejar vacíos (es HTML estático)
5. Deploy

### Personalizar el subdominio
1. En Netlify → Site settings → Domain management
2. Click en **"Edit site name"**
3. Podés poner algo como `impulso-lab-dashboard`

---

## PASO 4 · Nombres de hojas del Sheets

Para que el Apps Script lea correctamente tus datos, necesito saber los nombres exactos de las 4 hojas. Podés verificarlos en las pestañas del Sheets y actualizar el objeto `SHEETS` en `Code.gs`.

**Estructura esperada de cada hoja:**
- La primera fila debe ser los encabezados (headers)
- El sistema lee automáticamente todas las columnas que encuentre
- Los nombres de columnas que el dashboard busca son:
  - **Cartera**: `Mes`, `Concepto`, `Monto`, `Pct`
  - **Financiero**: `Mes`, `Fecha`, `Concepto`, `Categoría`, `Ingreso`, `Egreso`, `Saldo`
  - **Caja**: `Mes`, `Fecha`, `Concepto`, `Categoría`, `Ingreso`, `Egreso`, `Saldo`
  - **Caja USD**: `Mes`, `Fecha`, `Concepto`, `Cuenta`, `Tipo`, `Ingreso`, `Egreso`, `Saldo`

---

## PASO 5 · CORS (si hay errores de acceso)

Si el navegador muestra error de CORS al cargar datos del Apps Script, agregar al inicio de `doGet()` en el Code.gs:

```js
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  // ... resto del código
```

El Apps Script con "Anyone" ya maneja CORS automáticamente. Si aun así hay problemas, verificar que redesplegaste después de cada cambio en el código.

---

## Mantenimiento

- **Actualización de datos**: El dashboard se auto-actualiza cada 30 minutos. También hay botón "Actualizar" manual.
- **Nuevos meses**: Solo agregar filas en el Sheets. El dashboard los detecta automáticamente.
- **Cambios de diseño**: Editar `index.html` y re-subir a Netlify (drag & drop de nuevo o push a GitHub si usaste Opción B).

---

## Estructura de archivos

```
impulso-dashboard/
├── index.html     ← Dashboard completo (subir a Netlify)
├── Code.gs        ← Apps Script (pegar en Google Apps Script)
└── INSTRUCCIONES.md
```
