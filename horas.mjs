// COMPRUEBA QUE LAS FECHAS EXISTAN Y EL INTERVALO SEA CORRECTO
export function validarPeriodo(fechaInicio, fechaFin) {
    for (const fecha of [fechaInicio, fechaFin]) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            throw new Error("Las fechas deben tener formato AAAA-MM-DD");
        }

        const fechaInterpretada = new Date(`${fecha}T00:00:00Z`);

        if (
            Number.isNaN(fechaInterpretada.getTime()) ||
            fechaInterpretada.toISOString().slice(0, 10) !== fecha
        ) {
            throw new Error(`Fecha no válida: ${fecha}`);
        }
    }

    if (fechaInicio > fechaFin) {
        throw new Error("La fecha inicial no puede superar a la final");
    }
}

// CREA UNA FUNCIÓN PARA OBTENER FECHAS EN TU ZONA HORARIA
export function crearConversorFecha(zonaHoraria) {
    const formato = new Intl.DateTimeFormat("en-CA", {
        timeZone: zonaHoraria,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });

    return function convertirFecha(valor) {
        const fecha = new Date(valor);

        if (Number.isNaN(fecha.getTime())) {
            throw new Error(`Fecha de registro no válida: ${valor}`);
        }

        const partes = formato.formatToParts(fecha);

        const anio = partes.find(p => p.type === "year").value;
        const mes = partes.find(p => p.type === "month").value;
        const dia = partes.find(p => p.type === "day").value;

        return `${anio}-${mes}-${dia}`;
    };
}

// SUMA ÚNICAMENTE TUS REGISTROS DENTRO DEL PERIODO
export function resumirRegistros(registros, criterios) {
    const {
        accountId,
        fechaInicio,
        fechaFin,
        convertirFecha
    } = criterios;

    let totalSegundos = 0;
    let cantidadRegistros = 0;

    for (const registro of registros) {
        if (registro.author.accountId !== accountId) {
            continue;
        }

        const fecha = convertirFecha(registro.started);

        if (fecha < fechaInicio || fecha > fechaFin) {
            continue;
        }

        totalSegundos += registro.timeSpentSeconds;
        cantidadRegistros++;
    }

    return {
        totalSegundos,
        cantidadRegistros
    };
}

// CONVIERTE SEGUNDOS EN UN TEXTO LEGIBLE
export function formatearDuracion(totalSegundos) {
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    return `${horas} h ${minutos} min ${segundos} s`;
}