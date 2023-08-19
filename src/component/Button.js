import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default function Button({className, btnClassName, text, icon, onClick}){
    return (
        <div className={className ? className : ''}>
            <button className={btnClassName ? `${btnClassName}` : ''} onClick={onClick}>
                {icon &&
                    <FontAwesomeIcon icon={icon} />
                }
                {text}
            </button>
        </div>
    )
}