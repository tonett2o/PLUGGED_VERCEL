import {React} from "react";


const Evento = (props) => {
    const {id, nombre, nombre_sala, imagen} = props.datosEvento;
    return (
        <>
            <article className='tarjeta-evento' id={id ? id : crypto.randomUUID()}>
                <img src={imagen} alt="Imagen Evento" />
                <div className='nombre-evento'>{nombre ? nombre : 'Nombre no disponible'}</div>
                <div className='nombre-sala'>{nombre_sala ? nombre_sala : 'Nombre Sala no disponible'}</div>
            </article>
        </>
    );
}

export default Evento;