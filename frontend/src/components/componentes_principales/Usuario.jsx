import {React} from "react";


const Usuario = (props) => {
    const {id, nick, nombre, avatar} = props.datosUsuario;
    return (
        <>
            <article className='tarjeta-usuario' id={id ? id : crypto.randomUUID()}>
                <img src={avatar} alt="Avatar Usuario" />
                <div className='nick-usuario'>{nick ? nick : 'Nick no disponible'}</div>
                <div className='nombre-usuario'>{nombre ? nombre : 'Nombre no disponible'}</div>
            </article>
        </>
    );
}

export default Usuario;