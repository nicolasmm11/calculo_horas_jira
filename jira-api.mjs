export function crearClienteJira({ url, email, token }) {
    if (!url || !email || !token) {
        throw new Error("Faltan las credenciales de Jira en .env");
    }

    const urlBase = url.replace(/\/+$/, "");

    const credenciales = Buffer
        .from(`${email}:${token}`)
        .toString("base64");

    // CENTRALIZA LAS PETICIONES Y SUS ERRORES
    async function consultar(ruta, parametros = {}) {
        const urlPeticion = new URL(`${urlBase}${ruta}`);
        urlPeticion.search = new URLSearchParams(parametros).toString();

        const respuesta = await fetch(urlPeticion, {
            headers: {
                Authorization: `Basic ${credenciales}`,
                Accept: "application/json"
            }
        });

        if (!respuesta.ok) {
            throw new Error(
                `Error HTTP ${respuesta.status} al consultar ${ruta}`
            );
        }

        return respuesta.json();
    }

    // OBTIENE EL USUARIO AUTENTICADO
    async function obtenerUsuarioActual() {
        return consultar("/rest/api/3/myself");
    }

    // OBTIENE TODAS LAS TAREAS DONDE HAS REGISTRADO TRABAJO
    async function obtenerTareasConTrabajoPropio() {
        const tareas = [];
        let siguientePagina = null;

        do {
            const parametros = {
                jql: "worklogAuthor = currentUser()",
                fields: "summary",
                maxResults: "100"
            };

            if (siguientePagina) {
                parametros.nextPageToken = siguientePagina;
            }

            const datos = await consultar(
                "/rest/api/3/search/jql",
                parametros
            );

            for (const tarea of datos.issues) {
                tareas.push(tarea);
            }

            siguientePagina = datos.nextPageToken ?? null;

        } while (siguientePagina);

        return tareas;
    }

    // OBTIENE TODOS LOS REGISTROS DE TRABAJO DE UNA TAREA
    async function obtenerRegistrosDeTarea(claveTarea) {
        const registros = [];
        let inicioPagina = 0;
        let totalRegistros = 0;

        do {
            const datos = await consultar(
                `/rest/api/3/issue/${encodeURIComponent(claveTarea)}/worklog`,
                {
                    startAt: String(inicioPagina),
                    maxResults: "100"
                }
            );

            for (const registro of datos.worklogs) {
                registros.push(registro);
            }

            inicioPagina += datos.worklogs.length;
            totalRegistros = datos.total;

            if (
                datos.worklogs.length === 0 &&
                inicioPagina < totalRegistros
            ) {
                throw new Error(
                    `Paginación incompleta en la tarea ${claveTarea}`
                );
            }

        } while (inicioPagina < totalRegistros);

        return registros;
    }

    return {
        obtenerUsuarioActual,
        obtenerTareasConTrabajoPropio,
        obtenerRegistrosDeTarea
    };
}