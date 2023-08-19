import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default function Input({className, type, placeholder, name, label, value, icon, warning, onChange, onKeyUp}){
    return (
        <div className={className ? className : ''}>
            {label &&
                <div className='label'>{label}</div>
            }
            <input className={warning ? 'warning' : ''} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} onKeyUp={onKeyUp}/>
            {icon&&
                <FontAwesomeIcon icon={icon}/>
            }
        </div>
    )
}