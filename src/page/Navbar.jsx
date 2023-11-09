import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

import endpoints from "../util/apiCall";


export default function Navbar(){
    const [active, setActive] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    function logout(e){
        e.preventDefault();
        endpoints.logout().then(response=>{
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }).catch(error=>{
            console.log(error);
        });
    }

    return (
        <div>
            <nav>
                <ul>
                    <li>
                        <NavLink to='home'>
                            Home    
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='productManager'>
                            商品管理
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='setting'>
                            設定
                        </NavLink>
                    </li>
                </ul>

                <div className="user" onClick={() => setActive(true)}>
                    <span>Hi {user['username']}</span>
                    <FontAwesomeIcon icon={faAngleDown} />
                </div>
            </nav>

            <div className={active ? "logout-wrapper active" : "logout-wrapper"} onClick={() => {setActive(false)}}>
                <div className="logout">
                    <a href="/logout" onClick={logout}>
                        ログアウト
                    </a>
                </div>
            </div>

        </div>
    )
}