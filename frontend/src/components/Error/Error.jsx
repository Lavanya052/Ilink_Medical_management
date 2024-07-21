import "./Error.css"
import { useRouteError } from "react-router-dom"

const Error=()=>{
    const error =useRouteError()

    return(
        <div id="error">
             <img src="error.png" alt="Error" />
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occured</p>
            <p>
                <i>{error.statusText || error.message }</i>
            </p>
        </div>
    )
}

export default Error;