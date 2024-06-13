//import { saveAs } from './JS/FileSaver.min.js';

//Clase datosEntrada: Representa los datos del carro y su dueño para el parqueo
class datosEntrada{
    constructor(duenio, carro, matricula, horaEntrada){
        this.duenio = duenio;
        this.carro = carro;
        this.matricula = matricula; 
        this.horaEntrada = horaEntrada; 
    }
}
//Clase UI: Maneja las tareas de interfaz de usuario
class UI{
    static mostrarEntradas(){
   
        const entradas = Almac.getEntradas();
        entradas.forEach((entrada) => UI.agregarEntradaATabla(entrada));
    }
    static agregarEntradaATabla(entrada){
        const cuerpoTabla=document.querySelector('#tableBody');
        const fila = document.createElement('tr');
        fila.innerHTML = `  <td>${entrada.duenio}</td>
                            <td>${entrada.carro}</td>
                            <td>${entrada.matricula}</td>
                            <td>${entrada.horaEntrada}</td>
                            <td><button class="btn btn-danger delete" data-bs-toggle="modal" data-bs-target="#exampleModal" >X</button></td>
                        `;
        cuerpoTabla.appendChild(fila);
    }
    static limpiarTxts(){
        //Selecciona todas las cajas de texto con la clase form-control
        const txts = document.querySelectorAll('.form-control');
        //limpia el contenido de cada caja de texto
        txts.forEach((txt)=>txt.value="");
    }
    static borrarEntrada(target){
        if(target.classList.contains('delete')){
            target.parentElement.parentElement.remove();
        }
    }
    static mostrarAlert(mensaje,nombreClase){
        const div = document.createElement('div');
        div.className=`alert alert-${nombreClase} w-50 mx-auto`;
        div.appendChild(document.createTextNode(mensaje));
        const formContainer = document.querySelector('.form-container');
        const form = document.querySelector('#formEntrada');
        formContainer.insertBefore(div,form);
        setTimeout(() => document.querySelector('.alert').remove(),3000);
    }
    static validarTxts(){
        const duenio = document.querySelector('#duenio').value;
        const carro = document.querySelector('#carro').value;
        const matricula = document.querySelector('#matricula').value;
        //var matriculaRegex = /^(?:[A-Z]{2}-\d{2}-\d{2})|(?:\d{2}-[A-Z]{2}-\d{2})|(?:\d{2}-\d{2}-[A-Z]{2})$/;
        if(duenio === '' || carro === '' || matricula === ''){
            UI.mostrarAlert('Todos los campos deben ser completados!','danger');
            return false;
        }
        return true;
    }
}
//Clase Almac: Almacena datos localmente
class Almac{
    static getEntradas(){
        let entradas;
        if(localStorage.getItem('entradas') === null){
            entradas = [];
        }
        else{
            entradas = JSON.parse(localStorage.getItem('entradas'));
        }
        return entradas;
    }
    static addEntradas(entrada){
        const entradas = Almac.getEntradas();
        entradas.push(entrada);
        localStorage.setItem('entradas', JSON.stringify(entradas));
    }
    static removeEntradas(matricula){
        const entradas = Almac.getEntradas();
        entradas.forEach((entrada,index) => {
            if(entrada.matricula === matricula){
                entradas.splice(index, 1);
            }
        });
        localStorage.setItem('entradas', JSON.stringify(entradas));
    }
}
//Evento Display o Load
    document.addEventListener('DOMContentLoaded',UI.mostrarEntradas);
//Evento Agregar
    document.querySelector('#formEntrada').addEventListener('submit',(e)=>{
        e.preventDefault();
        
        const duenio = document.querySelector('#duenio').value;
        const carro = document.querySelector('#carro').value;
        const matricula = document.querySelector('#matricula').value;
        const horaEntrada = new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'America/El_Salvador' });
        if(!UI.validarTxts()){
            return;
        }
        //Instanciando la clase datosEntrada
        const entrada = new datosEntrada(duenio, carro, matricula, horaEntrada);
        UI.agregarEntradaATabla(entrada);
        Almac.addEntradas(entrada);
        UI.limpiarTxts();
        UI.mostrarAlert('Coche agregado con éxito al estacionamiento','success');
    });
//Evento Remove
    document.querySelector('#tableBody').addEventListener('click',(e)=>{
        if (e.target.classList.contains('delete')) {
            
            var duennio = e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
            //Se obtiene le texto de la matrícula
            var matricula = e.target.parentElement.previousElementSibling.previousElementSibling.textContent;
            //Se obtiene el texto de la hora de entrada
            var horaI = e.target.parentElement.previousElementSibling.textContent;
            let horaSalida = new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'America/El_Salvador' });
            // Calcular el tiempo de permanencia
            var tiempoPermanencia = calcularDiferenciaHorasMinutos(horaI, horaSalida);
            //console.log(tiempoPermanencia);
            // Calcular el costo basado en el tiempo de permanencia
            var costoTotal = calcularCostoEstacionamiento(tiempoPermanencia);
            document.getElementById('dueno').innerText = duennio;
            document.getElementById('placa').innerText = matricula;
            document.getElementById('hora-inicio').innerText = horaI;
            document.getElementById('hora-final').innerText = horaSalida;
            document.getElementById('horas-parqueadas').innerText = tiempoPermanencia;
            document.getElementById('precio-total').innerText = "$"+costoTotal;
            //UI.mostrarAlert(`dueño: ${duennio}\nMatrícula: ${matricula}\nHora de entrada: ${horaI}\nHora de salida: ${horaSalida}\nTiempo en el parqueo: ${tiempoPermanencia}\nCosto: $${costoTotal}`,'success');
            //Elimina una fila
            UI.borrarEntrada(e.target);

            //Elimia el registro del almacenamiento
            Almac.removeEntradas(matricula);
            UI.mostrarAlert('Coche eliminado con éxito de la lista de estacionamiento','success');
        }
    })

//Evento Buscar
    document.querySelector('#txtBuscar').addEventListener('keyup', function searchTable(){
        //Se obtiene el valor de la caja de texto
        const valorBusqueda = document.querySelector('#txtBuscar').value.toUpperCase();
        //Se obtiene todas las lineas de la tabla
        const tablaLinea = (document.querySelector('#tableBody')).querySelectorAll('tr');
  
        for(let i = 0; i < tablaLinea.length; i++){
            var count = 0;
            //Obtener todas las columnas de la fila
            const valoresLinea = tablaLinea[i].querySelectorAll('td');

            for(let j = 0; j < valoresLinea.length - 1; j++){
                //Verificar si existe la letra que se empiece a digitar en alguna de las columnas
                if((valoresLinea[j].innerHTML.toUpperCase()).startsWith(valorBusqueda)){
                    count++;
                }
            }
            if(count > 0){
                //Si alguna columna contiene el valor de búsqueda, el bloque se visualizará
                tablaLinea[i].style.display = '';
            }else{
                //De lo contrario mostrar ninguno 
                tablaLinea[i].style.display = 'none';
            }
        }
    });
//Evento exportar archivo csv
    document.getElementById('btnDescargar').addEventListener('click',()=>{

        const txtHeader = document.querySelectorAll('.modal-body p strong');
        const datospSpan = document.querySelectorAll('.modal-body p span');
        //const duenoH = document.getElementById('duenoHeader').querySelector('strong').textContent.trim();
        const datos = [];

        for (let i = 0; i < txtHeader.length; i++){
            let header = txtHeader[i].textContent.trim();
            header = header.substring(0,header.length-1);
            const valor = datospSpan[i].textContent.trim();
            
            datos.push({header, valor});
            console.log(datos);
        }
        if (datos.length === 0 || datos.length!== txtHeader.length || datos.length!== datospSpan.length) {
            console.error('Número incorrecto de encabezados o valores.');
            return;
        }
        const csvHeaders = datos.map(obj => `${obj.header}`).join(';');
        const csvRows = datos.map(obj => `"${obj.valor}"`).join(';');
        const csvContent = `${csvHeaders}\n${csvRows}`;

        //const currentLocale = navigator.language || navigator.userLanguage;
        //const listItemSeparator = getListItemSeparator(currentLocale);
        //console.log(`Lista Item Separator: ${listItemSeparator}`);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'test.csv');
        //downloadLink.href = URL.createObjectURL(blob);
        //downloadLink.click();
    });
    function calcularCostoEstacionamiento(diferenciaHoras) {
        // Costo base por una hora será de 1 dólar o fracción si es hora y fracción o sólo fracción
        let matches = diferenciaHoras.match(/\d+/g);
        //const [horasStr, minutosStr] = diferenciaHoras.split(':');
        const horas = parseInt(matches[0]); // Convertir a entero para asegurar operaciones aritméticas correctas
        const minutos = parseInt(matches[1]); // Convertir a entero para asegurar operaciones aritméticas correctas
        const fraccionHora = parseFloat(minutos / 60);// Convertir a punto flotante para asegurar operaciones aritméticas correctas
        let costoTotal = horas + fraccionHora;
    
        // Verificar si costoTotal es un número antes de llamar a toFixed
        if (isNaN(costoTotal)) {
            console.error("Error: costoTotal no es un número");
            return "0.00";
        }
        return costoTotal.toFixed(2);
    }
    function calcularDiferenciaHorasMinutos(horaInicio12H, horaFin12H) { 
        // Extrae las horas y minutos de horaInicio
        const horaInicio = convertirAFormato24Horas(horaInicio12H);
        const horaFin = convertirAFormato24Horas(horaFin12H);
        
        //const [horaMinutos,...resto] = tiempoConAmPm.split(/\s+/);
        const [hInicio, mInicio] = horaInicio.split(':'); 
        const [hFin, mFin] = horaFin.split(':');
        // Crea un nuevo objeto Date con solo horas y minutos para horaInicio
        const fechaInicio = new Date(); 
        const fechaFin = new Date();
        fechaInicio.setHours(hInicio, mInicio);
        fechaFin.setHours(hFin, mFin); 
        // Calcula la diferencia en milisegundos
        const milisegundosDiferencia = fechaFin.getTime() - fechaInicio.getTime(); // Convierte los milisegundos a horas y minutos
        const segundos = milisegundosDiferencia / 1000; 
        const horas = Math.floor(segundos / 3600); 
        const minutos = Math.floor((segundos % 3600) / 60); // Devuelve un objeto con la diferencia en horas y minutos
        let horaDiferencia;
        let strH, strM;
        strH = horas == 1? "hora" : horas > 1? "horas" : "hora";
        strM = minutos == 1? "minuto" : minutos > 1? "minutos" : "minuto";
        horaDiferencia = `${horas} ${strH} y ${minutos} ${strM}`;
        return  horaDiferencia;
    }
    function convertirATiempoDe12Horas(tiempo24Horas) {
        let [horaStr, minutoStr] = tiempo24Horas.split(':');
        let hora = parseInt(horaStr);
        let minuto = parseInt(minutoStr);
        let tiempoFormateado;
        if(hora > 12 ){
            hora = hora - 12;
            tiempoFormateado = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')} p. m.`;
        } else{
            tiempoFormateado = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')} a. m.`;
        }
        return tiempoFormateado;
    }
    function convertirAFormato24Horas(hora12Horas) {
        let [horaMinutos, ...resto] = hora12Horas.split(/\s+/);
        let periodo = resto.join(' ').trim();
        let [horaStr, minutoStr] = horaMinutos.split(':');
        let hora = parseInt(horaStr);
        let minuto = parseInt(minutoStr);
        let hora24Horas;
        
        if (hora === 12 && periodo === "a. m.") {
            hora24Horas = '00';
        } else if (hora > 9 && periodo === "a. m.") {
            hora24Horas = `${hora}`;
        } else if (hora < 10 && periodo === "a. m.") {
            hora24Horas = `0${hora}`;
        } else if (hora < '12' && periodo === "p. m.") {
            hora24Horas = `${hora + 12}`;
        }
        
        return `${hora24Horas}:${minuto}`;
    }
    function getListItemSeparator(locale) {
        const items = ['item1', 'item2', 'item3'];
        const listFormatter = new Intl.ListFormat(locale);
        const formattedList = listFormatter.format(items);
        // Buscar el primer carácter después del último elemento de la lista
        const separator = formattedList.lastIndexOf(',') + 1 === formattedList.length? '' : ',';
        return separator;
    }
    
    