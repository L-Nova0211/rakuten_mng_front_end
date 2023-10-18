import { useEffect, useState } from "react";
import { faAdd, faEdit } from "@fortawesome/free-solid-svg-icons";

import Button from "../component/Button";
import endpoints from "../util/apiCall";


export default function Setting() {
    const [state, setState] = useState({
        apiKey: '',
        serviceSecret: '',
        shippingMail: '',
        shipping60: '',
        shipping80: '',
        shipping100: '',
        shipping120: '',
        updateAmazon: '',
        updateOroshi: '',
        updateTajimaya: '',
        rakutenFee: "0"
    });
    const [existSetting, setExistSetting] = useState(false);

    useEffect(() => {
        endpoints.getSetting().then((response) => {
            if(response.data.length > 0) {
                setExistSetting(true);
                setState({
                    ...state,
                    apiKey: response.data[0]['license_key'],
                    serviceSecret: response.data[0]['service_secret'],
                    shippingMail: (response.data[0]['shipping_mail_fee']).toString(),
                    shipping60: (response.data[0]['shipping_60_fee']).toString(),
                    shipping80: (response.data[0]['shipping_80_fee']).toString(),
                    shipping100: (response.data[0]['shipping_100_fee']).toString(),
                    shipping120: (response.data[0]['shipping_120_fee']).toString(),
                    updateAmazon: (response.data[0]['scraping_update_amazon_from']).toString(),
                    updateOroshi: (response.data[0]['scraping_update_oroshi_from']).toString(),
                    updateTajimaya: (response.data[0]['scraping_update_tajimaya_from']).toString(),
                    rakutenFee: (response.data[0]['rakuten_fee']).toString(),
                });
            }
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    function handleChange(e){
        const target = e.currentTarget;
        setState({
            ...state,
            [target.name]: target.value
        });
    }

    function handleRegister(){
        endpoints.registerSetting(state).then((_) => {
            window.location.href = '';
        }).catch((error) => {
            console.log(error);
        });
    }

    function handleUpdate(){
        endpoints.updateSetting(state).then((_) => {
            window.location.href = '';
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <div className="container">
            <div>
                <div className="border-b py-1 font-bold">データ設定</div>
                <div className="input flex-wrap">
                    <div className="input w-50 p-1">
                        <label>APIキー:</label>
                        <input type="text" name="apiKey" value={state['apiKey']} onChange={handleChange}/>
                    </div>
                    <div className="input w-50 p-1">
                        <label>パスワード:</label>
                        <input type="text" name="serviceSecret" value={state['serviceSecret']} onChange={handleChange}/>
                    </div>
                </div>
            </div>
            <div>
                <div className="border-b py-1 font-bold">送料設定</div>
                <div className="input flex-wrap">
                    <div className="input w-50 p-1">
                        <label>送料メール便</label>
                        <input type="number" name="shippingMail" value={state['shippingMail']} onChange={handleChange}/>
                    </div>
                    <div className="input w-50 p-1">
                        <label>送料60サイズ</label>
                        <input type="number" name="shipping60" value={state['shipping60']} onChange={handleChange}/>
                    </div>
                    <div className="input w-50 p-1">
                        <label>送料80サイズ</label>
                        <input type="number" name="shipping80" value={state['shipping80']} onChange={handleChange}/>
                    </div>
                    <div className="input w-50 p-1">
                        <label>送料100サイズ</label>
                        <input type="number" name="shipping100" value={state['shipping100']} onChange={handleChange}/>
                    </div>
                    <div className="input w-50 p-1">
                        <label>送料120サイズ</label>
                        <input type="number" name="shipping120" value={state['shipping120']} onChange={handleChange}/>
                    </div>
                </div>
            </div>
            <div>
                <div className="border-b py-1 font-bold">データ取得</div>
                <div className="input flex-wrap">
                    <div className="input w-50 p-1">
                        <label>Amazon</label>
                        <input type="number" name="updateAmazon" value={state['updateAmazon']} onChange={handleChange}/>
                        <span className="w-20 px-1">時から</span>
                    </div>
                    <div className="input w-50 p-1">
                        <label>卸売ドットコム</label>
                        <input type="number" name="updateOroshi" value={state['updateOroshi']} onChange={handleChange}/>
                        <span className="w-20 px-1">時から</span>
                    </div>
                    <div className="input w-50 p-1">
                        <label>タジマヤ</label>
                        <input type="number" name="updateTajimaya" value={state['updateTajimaya']} onChange={handleChange}/>
                        <span className="w-20 px-1">時から</span>
                    </div>
                </div>
            </div>
            <div>
                <div className="border-b py-1 font-bold">その他設定</div>
                <div className="input p-1">
                    <div className="input">
                        <label>楽天手数料</label>
                        <select style={{padding: "10px 7px"}} name="rakutenFee" value={state['rakutenFee']} onChange={handleChange}>
                            <option value="0">0</option>
                            <option value="8">8</option>
                            <option value="10">10</option>
                        </select>
                        <span>%</span>
                    </div>
                </div>
            </div>
            <Button 
                className='flex justify-end px-1'
                btnClassName='btn btn-green w-20'
                text={existSetting ? '更新': '登録'}
                icon={existSetting ? faEdit: faAdd}
                onClick={existSetting ? handleUpdate: handleRegister}
            />
        </div>
    );
}
