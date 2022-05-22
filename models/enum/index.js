const ROL = {
    MANAGER: 'manager',
    CENTRO_SERVICIO: 'workshop_customer',
    ADMINISTRADOR_CUENTA: 'account_customer',
    REPRESENTANTE_MARCA: 'representante_marca'
}

const TIPO_DOCUMENTO = {
    CEDULA_CIUDADANIA: 'CC',
    CEDULA_EXTRANJERIA: 'CE',
    PASAPORTE: 'P',
    NIT: 'NIT'
}

const TIPO_CAJA = {
    AUTOMATICA:'AT',
    MECANICA:'MT',
}

const TIPO_COMBUSTIBLE = {
    GASOLINA:'Gasolina',
    ELECTRICO:'Eléctrico',
    HIBRIDO:'Híbrido',
    DIESEL:'Diesel',
}

const TRATAMIENTO = {
    SR: 'Sr.',
    SRA: 'Sra.',
    NA: '',
}

const TIPO_ACTIVIDAD = {
    INSPECCION: 'inspection',
    CHEQUEO: 'check',
    ENCUESTA: 'survey',
    PERSONALIZADO: 'custom',
    REVISION: 'revision'
}

const COTIZACION_APROBADA = {
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada',
    PENDIENTE: 'Pendiente',
    PROGRAMADO: 'Programadao',
    SIN_COTIZACION: 'Sin cotizacion',
}

const TIPO_ITEM_COTIZACION = {
    MANO_OBRA: 'Mano de obra',
    REPUESTO: 'Repuesto',
    TERCERO: 'Tercero'
}

const CATEGORIA_LICENCIA = {
    A1: 'A1',
    A2: 'A2',
    B1: 'B1',
    B2: 'B2',
    B3: 'B3',
    C1: 'C1',
    C2: 'C2',
    C3: 'C3',
}

const CLASIFICAR_POR = {
    GRUPO: 0,
    ACTIVIDAD: 1
}



module.exports = {
    CLASIFICAR_POR,
    CATEGORIA_LICENCIA,
    COTIZACION_APROBADA,
    ROL,
    TIPO_ACTIVIDAD,
    TIPO_CAJA,
    TIPO_COMBUSTIBLE,
    TIPO_DOCUMENTO,
    TIPO_ITEM_COTIZACION,
    TRATAMIENTO
}