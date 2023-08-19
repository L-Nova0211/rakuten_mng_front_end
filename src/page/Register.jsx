import { useState } from 'react';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

import Button from '../component/Button';
import Input from "../component/Input";
import Loading from '../component/Loading';
import isValidEmail from '../util/isValidEmail';
import endpoints from '../util/apiCall';


export default function Register(){
    const [registerData, setRegisterData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [warning, setWarning] = useState({
        email: false,
        username: false,
        password: false,
        confirmPassword: false
    });
    const [registerError, setRegisterError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(e){
        const target = e.currentTarget;
        if(target.value !== ""){
            setWarning({
                ...warning,
                [target.name]: false
            });
        }
        setRegisterData({
            ...registerData,
            [target.name]: target.value
        });
    }

    function callHandleSubmit(e){
        if(e.which === 13) {
            handleSubmit();
        }
    }

    function handleSubmit(){
        if(registerData['email'] === ''){
            setWarning({
                ...warning,
                email: true
            });
            return;
        }
        else if(isValidEmail(registerData['email']) === false){
            setWarning({
                ...warning,
                email: true
            });
            return;
        }
        else if(registerData['username'] === ''){
            setWarning({
                ...warning,
                username: true
            });
            return;
        }
        else if(registerData['password'] === ''){
            setWarning({
                ...warning,
                password: true
            });
            return;
        }
        else if(registerData['confirmPassword'] === '' || registerData['password'] !== registerData['confirmPassword'] ){
            setWarning({
                ...warning,
                confirmPassword: true
            });
            return;
        }
        else{
            setLoading(true);
            endpoints.register(registerData['email'], registerData['username'], registerData['password']).then((response) => {
                setLoading(false);
                window.location.href = '/';
            }).catch((error) => {
                setLoading(false);
                setRegisterError(error.response['data']);
            });
        }
    }

    return (
        <div className='register-wrapper'>
            <div className='container register'>
                <h1>新規登録</h1>
                <Input
                    className="row"
                    type="text"
                    placeholder="メール"
                    name="email"
                    icon={faEnvelope}
                    warning={warning['email']}
                    onChange={handleChange}
                />
                <Input
                    className="row"
                    type="text"
                    placeholder="ユーザー名"
                    name="username"
                    icon={faUser}
                    warning={warning['username']}
                    onChange={handleChange}
                />
                <Input
                    className="row"
                    type="password"
                    placeholder="パスワード"
                    name="password"
                    icon={faLock}
                    warning={warning['password']}
                    onChange={handleChange}
                />
                <Input
                    className="row"
                    type="password"
                    placeholder="パスワード確認"
                    name="confirmPassword"
                    icon={faLock}
                    warning={warning['confirmPassword']}
                    onChange={handleChange}
                    onKeyUp={callHandleSubmit}
                />
                <div className='row red'>
                    {registerError}
                </div>
                <Button
                    className="row"
                    text="新規登録"
                    onClick={handleSubmit}
                />
                <div className='row to-login'>
                    <span>すでに登録</span>
                    <span>
                        <a href="/">ログインページに移動</a>
                    </span>
                </div>
            </div>
            <Loading 
                loading={loading}
            />
        </div>
    )
}