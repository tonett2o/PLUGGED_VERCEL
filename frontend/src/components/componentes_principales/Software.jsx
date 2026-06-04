import {React} from "react";


const Software = (props) => {
    const {id, nombre, imagen} = props.datosSoftware;
    return (
        <>
            <article className='tarjeta-software' id={id ? id : crypto.randomUUID()}>
                <img src={imagen} alt="Imagen Software" />
                <div className='nombre-hardware'>{nombre ? nombre : 'Nombre no disponible'}</div>
            </article>
        </>
    );
}

export default Software;