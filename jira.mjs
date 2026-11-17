import { crearClienteJira } from "./jira-api.mjs";

import {
    validarPeriodo,
    crearConversorFecha,
    resumirRegistros,
    formatearDuracion
} from "./horas.mjs";

async function main() {
    // CONFIGURACIÓN DEL PERIODO: AMBOS DÍAS INCLUIDOS
    const fechaInicio = "2026-10-01";
    const fechaFin = "2026-11-30";

    validarPeriodo(fechaInicio, fechaFin);

    // CONEXIÓN CON JIRA
    const jira = crearClienteJira({
        url: process.env.JIRA_URL,
        email: process.env.JIRA_EMAIL,
        token: process.env.JIRA_TOKEN
    });

    const usuario = await jira.obtenerUsuarioActual();

    // SE UTILIZA PARA CALCULAR LAS FECHAS, PERO NO SE MUESTRA
    const zonaHoraria = usuario.timeZone || "Europe/Madrid";

    const criterios = {
        accountId: usuario.accountId,
        fechaInicio,
        fechaFin,
        convertirFecha: crearConversorFecha(zonaHoraria)
    };

    console.log(`Usuario: ${usuario.displayName}`);
    console.log(`Periodo: ${fechaInicio} a ${fechaFin}`);
    console.log("\nConsultando registros de trabajo...");

    // CONSULTA Y CÁLCULO
    const tareas = await jira.obtenerTareasConTrabajoPropio();
    const resultados = [];

    let totalSegundos = 0;

    for (const tarea of tareas) {
        const registros = await jira.obtenerRegistrosDeTarea(tarea.key);
        const resumen = resumirRegistros(registros, criterios);

        totalSegundos += resumen.totalSegundos;

        if (resumen.cantidadRegistros > 0) {
            resultados.push({
                tarea: tarea.key,
                titulo: tarea.fields.summary,
                horas: formatearDuracion(resumen.totalSegundos)
            });
        }
    }

    // PRESENTACIÓN DEL RESULTADO TRAS COMPLETAR LA CONSULTA
    if (resultados.length > 0) {
        mostrarTablaTareas(resultados);
    } else {
        console.log("No hay registros tuyos en ese periodo.");
    }

    console.log(`\nTOTAL: ${formatearDuracion(totalSegundos)}`);
}

// MUESTRA LAS COLUMNAS SIN EL ÍNDICE AUTOMÁTICO DE CONSOLE.TABLE
function mostrarTablaTareas(resultados) {
    const anchoTarea = Math.max(
        "TAREA".length,
        ...resultados.map(resultado => resultado.tarea.length)
    );

    const anchoTitulo = Math.max(
        "TÍTULO".length,
        ...resultados.map(resultado => resultado.titulo.length)
    );

    function crearFila(tarea, titulo, horas) {
        return [
            tarea.padEnd(anchoTarea),
            titulo.padEnd(anchoTitulo),
            horas
        ].join(" | ");
    }

    console.log();
    console.log(crearFila("TAREA", "TÍTULO", "HORAS"));

    for (const resultado of resultados) {
        console.log(
            crearFila(resultado.tarea, resultado.titulo, resultado.horas)
        );
    }
}

// EJECUTA EL PROGRAMA Y RECOGE LOS ERRORES
main().catch(error => {
    console.error("Error:", error.message);
    process.exitCode = 1;
});