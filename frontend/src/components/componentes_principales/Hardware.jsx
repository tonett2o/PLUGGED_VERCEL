import {React} from "react";


const Hardware = (props) => {
    const {id, nombre, imagen} = props.datosHardware;
    return (
        <>
            <article className='tarjeta-hardware' id={id ? id : crypto.randomUUID()}>
                <img src={imagen} alt="Imagen Libro" />
                <div className='nombre-hardware'>{nombre ? nombre : 'Nombre no disponible'}</div>
            </article>
        </>
    );
}

export default Hardware;