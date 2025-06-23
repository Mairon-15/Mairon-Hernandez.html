class Videojuego {
    constructor(titulo, desarrollador, genero, sku, stock, precioUnitario) {
        this.titulo = titulo;
        this.desarrollador = desarrollador;
        this.genero = genero;
        this.sku = sku;
        this.stock = stock;
        this.precioUnitario = precioUnitario;
    }

    calcularValorTotal() {
        return this.stock * this.precioUnitario;
    }
}

class VideojuegoFisico extends Videojuego {
    constructor(titulo, desarrollador, genero, sku, stock, precioUnitario, plataforma, tipoEmbalaje) {
        super(titulo, desarrollador, genero, sku, stock, precioUnitario);
        this.plataforma = plataforma;
        this.tipoEmbalaje = tipoEmbalaje;
    }
}

class VideojuegoDigital extends Videojuego {
    constructor(titulo, desarrollador, genero, sku, stock, precioUnitario, tamanoDescarga, plataformasSoportadas) {
        super(titulo, desarrollador, genero, sku, stock, precioUnitario);
        this.tamanoDescarga = tamanoDescarga;
        this.plataformasSoportadas = plataformasSoportadas;
    }
}

class EdicionEspecial extends VideojuegoFisico {
    constructor(titulo, desarrollador, genero, sku, stock, precioUnitario, plataforma, tipoEmbalaje, contenidoExtra, edicionLimitada) {
        super(titulo, desarrollador, genero, sku, stock, precioUnitario, plataforma, tipoEmbalaje);
        this.contenidoExtra = contenidoExtra;
        this.edicionLimitada = edicionLimitada;
    }
}

const VIDEOJUEGOS_KEY = 'videojuegosInventario';

function guardarVideojuegos(videojuegos) {
    localStorage.setItem(VIDEOJUEGOS_KEY, JSON.stringify(videojuegos));
}

function cargarVideojuegos() {
    const data = localStorage.getItem(VIDEOJUEGOS_KEY);
    if (data) {
        const parsedData = JSON.parse(data);
        return parsedData.map(item => {
            if (item.contenidoExtra !== undefined) {
                return new EdicionEspecial(item.titulo, item.desarrollador, item.genero, item.sku, item.stock, item.precioUnitario, item.plataforma, item.tipoEmbalaje, item.contenidoExtra, item.edicionLimitada);
            } else if (item.plataforma !== undefined || item.tipoEmbalaje !== undefined) {
                if (item.contenidoExtra === undefined || item.contenidoExtra === null || item.contenidoExtra === '') {
                     return new VideojuegoFisico(item.titulo, item.desarrollador, item.genero, item.sku, item.stock, item.precioUnitario, item.plataforma, item.tipoEmbalaje);
                }
            } else if (item.tamanoDescarga !== undefined || item.plataformasSoportadas !== undefined) {
                return new VideojuegoDigital(item.titulo, item.desarrollador, item.genero, item.sku, item.stock, item.precioUnitario, item.tamanoDescarga, item.plataformasSoportadas);
            }
            return new Videojuego(item.titulo, item.desarrollador, item.genero, item.sku, item.stock, item.precioUnitario);
        });
    }
    return [];
}

function mostrarAtributosEspecificos() {
    const tipoVideojuego = document.getElementById('tipoVideojuego').value;
    document.getElementById('atributosFisicos').style.display = 'none';
    document.getElementById('atributosDigitales').style.display = 'none';
    document.getElementById('atributosEdicionEspecial').style.display = 'none';

    document.getElementById('plataformaFisico').value = '';
    document.getElementById('tipoEmbalaje').value = '';
    document.getElementById('tamanoDescarga').value = '';
    document.getElementById('plataformasSoportadas').value = '';
    document.getElementById('contenidoExtra').value = '';
    document.getElementById('edicionLimitada').checked = false;

    if (tipoVideojuego === 'fisico') {
        document.getElementById('atributosFisicos').style.display = 'block';
    } else if (tipoVideojuego === 'digital') {
        document.getElementById('atributosDigitales').style.display = 'block';
    } else if (tipoVideojuego === 'edicionEspecial') {
        document.getElementById('atributosFisicos').style.display = 'block';
        document.getElementById('atributosEdicionEspecial').style.display = 'block';
    }
}

document.getElementById('videoGameForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const desarrollador = document.getElementById('desarrollador').value;
    const genero = document.getElementById('genero').value;
    const skuInput = document.getElementById('sku');
    const sku = parseInt(skuInput.value);
    const stock = parseInt(document.getElementById('stock').value);
    const precioUnitario = parseFloat(document.getElementById('precioUnitario').value);
    const tipoVideojuego = document.getElementById('tipoVideojuego').value;

    if (skuInput.value.length !== 10 || isNaN(sku)) {
        alert('El Código SKU debe ser un número de 10 dígitos.');
        skuInput.focus();
        return;
    }

    const videojuegosExistentes = cargarVideojuegos();
    const skuDuplicado = videojuegosExistentes.some(vg => vg.sku === sku);
    if (skuDuplicado) {
        alert('El Código SKU ya existe. Por favor, ingrese un SKU único.');
        skuInput.focus();
        return;
    }

    let nuevoVideojuego;

    if (tipoVideojuego === 'fisico') {
        const plataformaFisico = document.getElementById('plataformaFisico').value;
        const tipoEmbalaje = document.getElementById('tipoEmbalaje').value;
        nuevoVideojuego = new VideojuegoFisico(titulo, desarrollador, genero, sku, stock, precioUnitario, plataformaFisico, tipoEmbalaje);
    } else if (tipoVideojuego === 'digital') {
        const tamanoDescarga = parseFloat(document.getElementById('tamanoDescarga').value);
        const plataformasSoportadas = document.getElementById('plataformasSoportadas').value;
        nuevoVideojuego = new VideojuegoDigital(titulo, desarrollador, genero, sku, stock, precioUnitario, tamanoDescarga, plataformasSoportadas);
    } else if (tipoVideojuego === 'edicionEspecial') {
        const plataformaFisico = document.getElementById('plataformaFisico').value;
        const tipoEmbalaje = document.getElementById('tipoEmbalaje').value;
        const contenidoExtra = document.getElementById('contenidoExtra').value;
        const edicionLimitada = document.getElementById('edicionLimitada').checked;
        nuevoVideojuego = new EdicionEspecial(titulo, desarrollador, genero, sku, stock, precioUnitario, plataformaFisico, tipoEmbalaje, contenidoExtra, edicionLimitada);
    } else {
        nuevoVideojuego = new Videojuego(titulo, desarrollador, genero, sku, stock, precioUnitario);
    }

    const videojuegos = cargarVideojuegos();
    videojuegos.push(nuevoVideojuego);
    guardarVideojuegos(videojuegos);
    mostrarVideojuegos();
    this.reset();
    mostrarAtributosEspecificos();
});

function mostrarVideojuegos() {
    const inventarioBody = document.getElementById('inventarioBody');
    inventarioBody.innerHTML = '';

    const videojuegos = cargarVideojuegos();
    const filtroTitulo = document.getElementById('filtroTitulo').value.toLowerCase();
    const filtroDesarrollador = document.getElementById('filtroDesarrollador').value.toLowerCase();
    const filtroGenero = document.getElementById('filtroGenero').value.toLowerCase();

    const videojuegosFiltrados = videojuegos.filter(vg => {
        return vg.titulo.toLowerCase().includes(filtroTitulo) &&
               vg.desarrollador.toLowerCase().includes(filtroDesarrollador) &&
               vg.genero.toLowerCase().includes(filtroGenero);
    });

    videojuegosFiltrados.forEach((vg, index) => {
        const row = inventarioBody.insertRow();
        row.insertCell().textContent = vg.titulo;
        row.insertCell().textContent = vg.desarrollador;
        row.insertCell().textContent = vg.genero;
        row.insertCell().textContent = vg.sku;
        row.insertCell().textContent = vg.stock;
        row.insertCell().textContent = `$${vg.precioUnitario.toFixed(2)}`;
        row.insertCell().textContent = `$${vg.calcularValorTotal().toFixed(2)}`;

        let tipo = 'Base';
        let detalles = '';

        if (vg instanceof EdicionEspecial) {
            tipo = 'Edición Especial';
            detalles = `Plataforma: ${vg.plataforma || 'N/A'}, Embalaje: ${vg.tipoEmbalaje || 'N/A'}, Contenido Extra: ${vg.contenidoExtra || 'N/A'}, Edición Limitada: ${vg.edicionLimitada ? 'Sí' : 'No'}`;
        } else if (vg instanceof VideojuegoFisico) {
            tipo = 'Físico';
            detalles = `Plataforma: ${vg.plataforma || 'N/A'}, Embalaje: ${vg.tipoEmbalaje || 'N/A'}`;
        } else if (vg instanceof VideojuegoDigital) {
            tipo = 'Digital';
            detalles = `Tamaño: ${vg.tamanoDescarga ? vg.tamanoDescarga + 'MB' : 'N/A'}, Plataformas: ${vg.plataformasSoportadas || 'N/A'}`;
        }
        row.insertCell().textContent = tipo;
        row.insertCell().textContent = detalles;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => eliminarVideojuego(vg.sku);
        row.insertCell().appendChild(deleteButton);
    });
}

function eliminarVideojuego(skuAEliminar) {
    let videojuegos = cargarVideojuegos();
    videojuegos = videojuegos.filter(vg => vg.sku !== skuAEliminar);
    guardarVideojuegos(videojuegos);
    mostrarVideojuegos();
}

document.addEventListener('DOMContentLoaded', () => {
    mostrarVideojuegos();
    mostrarAtributosEspecificos();
});