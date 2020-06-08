'use strict';

/**
 * Función común para validar una fecha en js
 * @param fecha 
 */
function isDataValid(fecha) {
    let any = fecha.getFullYear().toString().padStart(4, 0);
    let dia = fecha.getDate().toString().padStart(2, 0);
    let mes = (fecha.getMonth() + 1).toString().padStart(2, 0);
    let hour = fecha.getHours().toString().padStart(2, 0);
    let minute = fecha.getMinutes().toString().padStart(2, 0);
    if (any >= '0000' && dia >= '00' && mes >= '00' && hour >= '00' && hour <= '24' && minute >= '00' && minute <= '59') {
    let newDate = new Date(any, (mes-1), dia);
    return ((newDate.getFullYear().toString().padStart(4, 0) == any) 
    && ((newDate.getMonth()+1).toString().padStart(2, 0) == mes) 
    && (newDate.getDate().toString().padStart(2, 0) == dia));
    } else { return false; }
}

/**
 * componente miReserva para insert o update reservas
 */
var miReserva = Vue.extend({
    template: '#add',
    data: function (){
        return {
        newReserva: {id: '', nombre: '', apellidos: '', telefono: '', dia: '', mes: '', year: '', hora: '', minuto: '', comensales: '', comentarios: ''},
        mostrarError: false,
        textoError: '',
        mostrarResult: false,
        textoResult: '',
        }
    },
    methods: {
        addProduct: function(e) {
            var self = this;
            this.limpiarMensajes();
            let nuevaReserva = this.newReserva;
            //Validate form
            let comensales = nuevaReserva.comensales;
            if (!this.isNumber(comensales) || comensales > 10 || comensales < 1) {
                //Mostar el error
                this.mostrarError = true;
                this.textoError = 'El número de comensales debe ser de 1 a 10.';
                return false;
            }
            //Validate date
            let fecha = new Date();
            let newDate = new Date(nuevaReserva.year, (nuevaReserva.mes -1), nuevaReserva.dia, nuevaReserva.hora, nuevaReserva.minuto);
            if (isDataValid(newDate)) {
                let id = nuevaReserva.id;
                if (!(id > 0)) {
                    let diff = new Date(newDate - fecha);
                    let days = diff/1000/60/60/24;
                    if (days > 1) {
                    //Correcto
                    } else {
                        this.mostrarError = true;
                        this.textoError = 'La nueva reserva ha de ser al menos 24h más que la fecha actual.';
                        return false;
                    }
                }
            } else {
                this.mostrarError = true;
                this.textoError = 'La fecha no es válida.';
                return false;
            }
            //Insert/update
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "POST",             
                data: { 
                    method: 'processForm',
                    data: nuevaReserva
                },
                success: function(response) {
                    if (response.ok) {
                        self.mostrarResult = true;
                        self.textoResult = 'Datos actualizados correctamente.';
                        //Redirect to home
                        setTimeout(function () {
                            router.push('/');
                        }, 1000);
                    } else {
                        self.mostrarError = true;
                        self.textoError = response.message;
                        return true;
                    }
                },
                error: function(response) {
                    //Mostar el error
                    self.mostrarError = true;
                    self.textoError = 'Error.';
                    return false;
                }
            });
        },
        limpiarMensajes: function() {
            this.mostrarError = false;
            this.textoError = '';
            this.mostrarResult = false;
            this.textoResult = '';
        },
        isNumber: function(num) {
            //Es un integer
            return (num != '') && !isNaN(parseFloat(num)) && isFinite(num) && (num == parseInt(num, 10));
        },
        obtenerReserva: function (id) {
            if (id > 0) {
            this.loading = true;
            var self = this;
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "GET",
                data: { 
                    method: 'getRow',
                    id: id
                },
                success: function(response) {
                    //Obtener la fecha y separandola para rellenar los diferentes campos del formulario
                    if (response.id) {
                    self.newReserva.id = response.id;
                    self.newReserva.nombre = response.nombre;
                    self.newReserva.apellidos = response.apellidos;
                    self.newReserva.telefono = response.telefono;
                    self.newReserva.comensales = response.comensales;
                    self.newReserva.comentarios = response.comentarios;
                    let actualFecha = response.fecha;
                    if (actualFecha && actualFecha.length ==16) {
                        let fecha = new Date(response.fecha.substr(0,10).split('/').reverse().join('-')+' '+response.fecha.substr(11,5));
                        if (isDataValid(fecha)) {
                            //La fecha es válida;
                            self.newReserva.dia = fecha.getDate().toString().padStart(2, 0);
                            self.newReserva.mes  = (fecha.getMonth() + 1).toString().padStart(2, 0);
                            self.newReserva.year  = fecha.getFullYear().toString().padStart(4, 0);
                            self.newReserva.hora = fecha.getHours().toString().padStart(2, 0);
                            self.newReserva.minuto = fecha.getMinutes().toString().padStart(2, 0);
                        }
                    }
                    }
                },
                error: function(response) {
                    //Mostar el error
                    self.mostrarError = true;
                    self.textoError = response;
                },
                complete: function(response) {
                    self.loading = false;
                }
            });
            } else {
                //Es un Insert
                let fecha = new Date();
                this.newReserva.dia = fecha.getDate().toString().padStart(2, 0);
                this.newReserva.mes = (fecha.getMonth() + 1).toString().padStart(2, 0);
                this.newReserva.year = fecha.getFullYear().toString().padStart(4, 0);
                this.newReserva.hora  = fecha.getHours().toString().padStart(2, 0);
                this.newReserva.minuto = fecha.getMinutes().toString().padStart(2, 0);
            }
        }
    },
    filters: {
        capitalize: function (value, len) {
          return value.toString().padStart(len, 0);
        }
    },
    async created() {
        this.obtenerReserva(this.$route.params.id);
    },
});

/**
 * componente mostrar una reserva
 */
var showReserva = Vue.extend({
    template: '#show',
    data: function (){
        return {
            loading: true,
            mostrarError: false,
            textoError: '',
            reserva: this.obtenerReserva(this.$route.params.id)
        }
    },
    methods: {
        obtenerReserva: function (id) {
            this.loading = true;
            var self = this;
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "GET",
                data: { 
                    method: 'getRow',
                    id: id
                },
                success: function(response) {
                    self.reserva = response;
                },
                error: function(response) {
                    //Mostar el error
                    self.mostrarError = true;
                    self.textoError = response;
                },
                complete: function(response) {
                    self.loading = false;
                }
            });
        }
    }
});

/**
 * componente home de reservas
 */
var Reservas = Vue.extend({
    template: '#reservas',
    data: function (){
        return {
            filtroTexto: '',
            filtroFechaInicial: '',
            filtroFechaFinal: '',
            reservas: [],
            mostrarError: false,
            mostrarResult: false,
            textoError: '',
            textoResult: '',
            loading: false,
            columnaOrden: '',
            orden: '',
            show24Alert: false,
            homePage: true,
        }
    },
    methods: {
        cambiarHome: function() {
            //Refrescar datos
            this.homePage = true;
            this.init();
        },
        cambiarNews: function() {
            //Refrescar datos
            this.homePage = false;
            this.init();
        },
        init: function () {
            this.loading = true;
            var self = this;
            let callMethod = 'getRows';
            if (!this.homePage) {
                callMethod = 'getNewRows';
            }
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "GET",             
                data: { 
                    method: callMethod
                },
                success: function(response) {
                    self.reservas = response;
                }, 
                error: function(response) {
                    //Mostar el error
                    self.mostrarError = true;
                    self.textoError = response;
                },
                complete: function(response) {
                    self.loading = false;
                }
            });
        },
        limpiarMensajes: function() {
            this.mostrarError = false;
            this.textoError = '';
            this.mostrarResult = false;
            this.textoResult = '';
        },
        ordenar: function (columna) {
            if (this.columnaOrden == columna) {
                if (this.orden == 'ASC') {
                    this.orden = 'DESC';
                } else {
                    this.orden = 'ASC'; 
                }
            } else {
                this.columnaOrden = columna;
                this.orden = 'ASC'; 
            }
        },
        deleteReserva: function(id) {
            var self = this;
            this.loading = true;
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "POST",             
                data: { 
                    method: 'deleteRow',
                    id: id
                },
                success: function(response) {
                    if (response.ok) {
                        self.mostrarResult = true;
                        self.textoResult = 'Datos actualizados correctamente.';
                        self.init();
                    }
                },
                error: function(response) {
                    //Mostar el error
                    self.mostrarError = true;
                    self.textoError = 'Error.';
                },
                complete: function(response) {
                    self.loading = false;
                }
            });
        },
        checkNew: function(){
            var self = this;
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "GET",             
                data: { 
                    method: 'getNews'
                },
                success: function(response) {
                    if (response.new) {
                        //Si hay reserva mostrar el link
                        self.show24Alert = true;
                    } else {
                        self.show24Alert = false;
                    }
                },
                error: function(response) {
                    self.show24Alert = false;
                    //Mostar el error
                    self.mostrarError = true;
                    self.textoError = 'Error.';
                }
            });
        },
    },
    async created() {
        this.limpiarMensajes();
        //Obtener datos
        this.init();
    },
    mounted: function () {
        window.setInterval(() => {
          this.checkNew();
        }, 1000)
    },
    computed: {
        //Filtros
        filterReservas: function(){
            let filteredReservas= this.reservas.filter(function (clave, indice) {
                //Nombre Completo
                let nombreCompleto = clave.nombre + ' ' + clave.apellidos;
                let found = false;
                //Validar la fecha
                let fechaInicial = this.filtroFechaInicial;
                let fechaFinal= this.filtroFechaFinal;
                if (this.filtroTexto == '' && this.filtroFechaInicial == '' && this.filtroFechaFinal == '') {
                    //Sin filtros
                    return true;
                } else if (this.filtroTexto != '' && (fechaInicial == '' || fechaFinal == '')) {
                    //Filtro de texto
                    return  nombreCompleto.toUpperCase().includes(this.filtroTexto.toUpperCase());
                } else if (this.filtroTexto == '' && fechaInicial != '' && fechaFinal != '') {
                    //Filtro de fecha
                    if (fechaInicial.length == 16 && fechaFinal.length == 16) {
                        fechaInicial = new Date(fechaInicial);
                        fechaFinal = new Date(fechaFinal);
                        //Validar las fechas
                        if (isDataValid(fechaInicial) && isDataValid(fechaFinal) && fechaInicial <= fechaInicial) {
                            //Las fechas son correctas
                            let fecha = new Date(clave.fecha.substr(0,10).split('/').reverse().join('-')+' '+clave.fecha.substr(11,5));
                            if (fecha >= fechaInicial && fechaFinal >= fecha) {
                                //Fecha correcta
                                return true;
                            }
                        }
                    }
                    return found;
                } else {
                    //Ambos
                    let textoFound = nombreCompleto.toUpperCase().includes(this.filtroTexto.toUpperCase());
                    let fechaFound = false;
                    if (fechaInicial.length == 16 && fechaFinal.length == 16) {
                        fechaInicial = new Date(fechaInicial);
                        fechaFinal = new Date(fechaFinal);
                        //Validar las fechas
                        if (isDataValid(fechaInicial) && isDataValid(fechaFinal) && fechaInicial <= fechaInicial ) {
                            //Las fechas son correctas
                            let fecha = new Date(clave.fecha.substr(0,10).split('/').reverse().join('-')+' '+clave.fecha.substr(11,5));
                            if (fecha >= fechaInicial && fechaFinal >= fecha) {
                                //Fecha correcta
                                fechaFound = true;
                            }
                        }
                    }
                    found = (textoFound & fechaFound);
                    return found;
                }
            },this);
            //Ordenar los datos
            filteredReservas.sort((a, b) => {
                if (this.orden == 'ASC') {
                    return (a[this.columnaOrden] < b[this.columnaOrden]) ? -1 : 1;
                } else {
                    return (b[this.columnaOrden] < a[this.columnaOrden]) ? -1 : 1;
                }
            });
            return filteredReservas;
        }
    }
});

/**
 * Rutas de la app
 */
const routes = [
  { path: '/', component: Reservas },
  { path: '/add', component: miReserva, name: 'add' },
  { path: '/edit/:id', component: miReserva, name: 'edit' },
  { path: '/show/:id', component: showReserva, name: 'show'  },
  { path: '/delete/:id', component: Reservas, name: 'delete' },
]

/**
 * Montar rutas
 */
const router = new VueRouter({
    routes 
})

/**
 * Crear la app
 */
const app = new Vue({
    router
}).$mount('#app');