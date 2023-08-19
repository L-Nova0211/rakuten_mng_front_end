import { useState } from 'react';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

import Button from '../component/Button';
import Input from "../component/Input";
import Loading from '../component/Loading';
import isValidEmail from '../util/isValidEmail';
import endpoints from '../util/apiCall';


export default function Login(){
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const [warning, setWarning] = useState({
        email: false,
        password: false
    });
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(e){
        const target = e.currentTarget;
        if(target.value !== ""){
            setWarning({
                ...warning,
                [target.name]: false
            });
        }
        setLoginData({
            ...loginData,
            [target.name]: target.value
        });
    }

    function callHandleSubmit(e){
        if(e.which === 13){
            handleSubmit();
        }
    }

    function handleSubmit(){
        if(loginData['email'] === ''){
            setWarning({
                ...warning,
                email: true
            });
            return;
        }
        else if(isValidEmail(loginData['email']) === false){
            setWarning({
                ...warning,
                email: true
            });
            return;
        }
        else if(loginData['password'] === ''){
            setWarning({
                ...warning,
                password: true
            });
            return;
        }
        else{
            setLoading(true);
            endpoints.login(loginData['email'], loginData['password']).then((response) => {
                setLoading(false);
                localStorage.setItem('token', response.data['token']);
                localStorage.setItem('user', JSON.stringify(response.data['user']));
                window.location.href = '/home';
            }).catch((error) => {
                setLoading(false);
                setLoginError(error.response['data']);
            });
        }
    }

    return (
        <div className='login-wrapper'>
            <div className='container login'>
                <h1>ログイン</h1>
                <Input
                    className="row"
                    type="text"
                    placeholder="メールを入力してください。"
                    name="email"
                    label="メール"
                    icon={faEnvelope}
                    warning={warning['email']}
                    onChange={handleChange}
                />
                <Input
                    className="row"
                    type="password"
                    placeholder="パスワードを入力してください。"
                    name="password"
                    label="パスワード"
                    icon={faLock}
                    warning={warning['password']}
                    onChange={handleChange}
                    onKeyUp={callHandleSubmit}
                />
                <div className='row red'>
                    {loginError}
                </div>
                <Button
                    className="row"
                    text="ログイン"
                    onClick={handleSubmit}
                />
                <div className='row not-register'>
                    <span>未登録？</span>
                    <span>
                        <a href="/register">アカウントを作成する</a>
                    </span>
                </div>
            </div>
            <Loading 
                loading={loading}
            />

        </div>
    )
}