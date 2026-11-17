# Consulta de horas de Jira

Script de Node.js para consultar y sumar el tiempo que has registrado
en Jira Cloud durante un intervalo de fechas.

Muestra las tareas con sus horas y el tiempo total del periodo.

## Funcionalidades

- Consulta los registros de trabajo del usuario autenticado.
- Incluye tareas propias y tareas asignadas a otras personas.
- Filtra por la fecha del trabajo registrado.
- Incluye los días de inicio y fin del intervalo.
- Recupera todas las páginas de tareas y registros.
- Muestra el tiempo en horas, minutos y segundos.

El script solo consulta información: no crea ni modifica datos en Jira.

## Requisitos

- Node.js 24 o superior.
- Una cuenta con acceso a Jira Cloud.
- La dirección de tu sitio: `https://tuempresa.atlassian.net`.
- Un token de API de tu cuenta de Atlassian sin ámbitos
  (*without scopes*), para la conexión directa que utiliza este script.

Solo se pueden consultar las tareas y registros a los que tu cuenta
tenga acceso.

## Instalación

### 1. Clonar el repositorio

Sustituye la URL por la dirección de este repositorio:

```bash
git clone https://github.com/USUARIO/REPOSITORIO.git
cd REPOSITORIO
```

### 2. Comprobar Node.js

```bash
node --version
```

No hace falta ejecutar `npm install`: el proyecto utiliza funciones
incluidas en Node.js y no tiene dependencias externas.

### 3. Crear un token de API

Accede con la cuenta de Atlassian con la que registras tus horas:

https://id.atlassian.com/manage-profile/security/api-tokens

Crea un token de API sin ámbitos, establece su caducidad y copia su valor.
Guárdalo de forma segura: no podrás volver a consultar su valor al cerrar
la ventana de creación.

### 4. Configurar las credenciales

Copia `.env.example` a un archivo llamado `.env`.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

En Linux o macOS:

```bash
cp .env.example .env
```

Edita `.env` con tus datos:

```dotenv
JIRA_URL=https://tuempresa.atlassian.net
JIRA_EMAIL=tu-correo@ejemplo.com
JIRA_TOKEN=tu_token_de_api
```

- `JIRA_URL`: dirección base del sitio, sin rutas de proyectos o tareas.
- `JIRA_EMAIL`: correo de la cuenta que ha creado el token.
- `JIRA_TOKEN`: token de API de esa cuenta.

Cada persona debe utilizar sus propias credenciales.

## Elegir el periodo

Abre `jira.mjs` y modifica estas constantes dentro de `main()`:

```javascript
const fechaInicio = "2026-11-01";
const fechaFin = "2026-11-30";
```

Utiliza el formato `AAAA-MM-DD`.

Ambas fechas están incluidas. Este ejemplo consulta del 1 al 30 de
noviembre de 2026, incluidos ambos días.

El script utiliza la zona horaria de la cuenta de Jira. Si no está
informada, utiliza `Europe/Madrid`.

## Ejecutar

Desde la carpeta del proyecto:

```bash
node --env-file=.env jira.mjs
```

El programa muestra:

- El nombre del usuario autenticado.
- El periodo consultado.
- Una tabla con las columnas TAREA, TÍTULO y HORAS.
- El tiempo total del periodo.

Si no encuentra registros del usuario en esas fechas, lo indica y
muestra un total de cero.

## Seguridad

- No subas `.env` al repositorio.
- No incluyas tokens en el código, capturas o documentación.
- Comparte `.env.example` con valores ficticios.
- Si publicas un token por error, revócalo y genera otro. Borrarlo del
  último archivo no lo elimina del historial de Git.
