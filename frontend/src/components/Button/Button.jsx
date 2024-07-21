import "./Button.css"

const Button = (props) => {

    return(
        <button
        type="submit"
        name="button"
        className="custom-button"
        onClick={props.onClick}>{props.value}
        </button>
    );

}

export default Button;