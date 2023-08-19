import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { faDownload, faEdit, faFileExport, faRemove } from "@fortawesome/free-solid-svg-icons";
import Modal from 'react-awesome-modal';

import Input from '../component/Input';
import Button from '../component/Button';
import Loading from '../component/Loading';
import PaginationComponent from '../component/Pagination';
import endpoints from '../util/apiCall';


export default function Home(){
    const [searchParams, setSearchParams] = useSearchParams();
    const [state, setState] = useState({
        id: '',
        scrapeURL: '',
        editTitle: '',
        editSellPrice: ''
    });
    const [product, setProduct] = useState([]);
    const [ng, setNg] = useState({});
    const [warning, setWarning] = useState({
        scrapeURL: false,
        editTitle: false,
        editSellPrice: false
    });
    const [bulkProductId, setBulkProductId] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState({
        result: false,
        edit: false,
        enableAmazon: true
    });
    const [message, setMessage] = useState('');
    const itemPerPage = [20, 50, 100, 200];
    const [counts, setCounts] = useState(0);
    const [current, setCurrent] = useState(1);
    const [itemPerPageValue, setItemPerPageValue] = useState(itemPerPage[0]);

    useEffect(() => {
        endpoints.getCredential().then((response) => {
            let credential = response.data;
            if(!credential['aws_access_key']){
                setShowModal({
                    ...showModal, enableAmazon: false
                });
            }
        }).catch((error) => {
            console.log(error);
        });
        let params = {
            is_active: true
        };
        params = new URLSearchParams(params);
        endpoints.getNG(params).then((response) => {
            let result = response.data;
            let ngs = {
                brand: [],
                maker: [],
                category: []
            };
            result.map((item) => {
                if(item['type'] == 'Brand'){
                    ngs['brand'].push(item['name']);
                }
                else if(item['type'] == 'Maker'){
                    ngs['maker'].push(item['name']);
                }
                else{
                    ngs['category'].push(item['name']);
                }
            });
            setNg(ngs);
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    useEffect(() => {
        if (!searchParams.get('page')){
            setSearchParams({page: 1, displays: itemPerPageValue});
        }
        setCurrent(parseInt(searchParams.get('page')));
        setItemPerPageValue(parseInt(searchParams.get('displays')));
        let params = {
            limit: searchParams.get('displays') || itemPerPageValue, 
            offset: searchParams.get('displays') * (searchParams.get('page') - 1),
            status: 'Draft'
        };
        params = new URLSearchParams(params);
        endpoints.getProduct(params).then((response) => {
            let counts = response.data.count;
            let products = response.data.results;
            setCounts(counts);
            setTimeout(() => {
                setProduct(products);
            }, 500);
        }).catch((error) => {
            console.log(error);
        });
    }, [searchParams.get('page'), searchParams.get('displays')]);
    
    function handlePageChange(e){
        setSearchParams({page: e, displays: itemPerPageValue});
    }

    function handleItemPerPageChange(e){
        setItemPerPageValue(e.target.value);
        setSearchParams({displays: e.target.value});
    }

    function handleChange(e){
        const target = e.currentTarget;
        if(target.value !== ""){
            setWarning({
                ...warning,
                [target.name]: false
            });
        }
        setState({
            ...state,
            [target.name]: target.value
        });
    }

    function handleScrapeProduct(){
        if(state['scrapeURL'] === ''){
            setWarning({
                ...warning,
                scrapeURL: true
            });
            return;
        }
        else{
            setLoading(true);
            endpoints.scrapeData(state['scrapeURL']).then((response) => {
                window.location.href = '';
            }).catch((error) => {
                setLoading(false);
                console.log(error);
            });
        }
    }

    function checkNg(product){
        let check = false;
        for(let i=0; i<ng['category'].length; i++){
            if(product['category'].includes(ng['category'][i]) || product['title'].includes(ng['category'][i])){
                check = true;
                break;
            }
        }
        if(check){
            return check;
        }
        for(let i=0; i<ng['maker'].length; i++){
            if(product['maker'].includes(ng['maker'][i])){
                check = true;
                break;
            }
        }
        if(check){
            return check;
        }
        for(let i=0; i<ng['brand'].length; i++){
            if(product['brand'].includes(ng['brand'][i])){
                check = true;
                break;
            }
        }
        return check;
    }

    function handleSellProduct(id){
        setLoading(true);
        endpoints.sellProduct(id).then((response) => {
            setLoading(false);
            setMessage(response.data);
            setShowModal(true);
        }).catch((error) => {
            setLoading(false);
            setMessage(error.response.data);
            setShowModal(true);
        });
    }
    
    function callEditModal(id, title, sellPrice){
        setState({
            ...state,
            id: id,
            editTitle: title,
            editSellPrice: sellPrice
        });
        setShowModal({
            ...showModal, edit: true
        });
    }

    function handleProductUpdate(){
        if(state['editTitle'] === ''){
            setWarning({
                ...warning, editTitle: true
            });
            return;
        }
        else if(state['editSellPrice'] === ''){
            setWarning({
                ...warning, editSellPrice: true
            });
            return;
        }
        else{
            const data = {
                title: state['editTitle'],
                sell_price: state['editSellPrice']
            }
            endpoints.updateProduct(state['id'], data).then((response) => {
                window.location.href = '/home';
            }).catch((error) => {
                setMessage('操作が失敗しました。もう一度お試しください。');
                setShowModal({
                    ...showModal,
                    edit: false,
                    result: true
                });
            });
        }
    }

    function handleRemoveProduct(id){
        setLoading(true);
        endpoints.removeProduct(id).then((response) => {
            window.location.href = '/home';
        }).catch((error) => {
            setMessage('操作が失敗しました。もう一度お試しください。');
            setLoading(false);
            setShowModal({
                ...showModal,
                result: true
            });
        });
    }

    function handleProductCheckedChange(e, id){
        if(e.target.checked){
            setBulkProductId([...bulkProductId, id]);
        }
        else{
            setBulkProductId((bulkProductId) => (bulkProductId.filter((itm) => itm !== id)))
        }
    }

    function handleSelectAllChange(e){
        let select_product = document.querySelector('#products').querySelectorAll('input');
        for(let i=0; i<select_product.length; i++){
            select_product[i].checked = e.target.checked;
        }
        if(e.target.checked){
            setBulkProductId([...bulkProductId, ...product.map((item) => (item['id']))]);
        }
        else{
            setBulkProductId([]);
        }
    }

    function handleBulkSellProducts(){
        setLoading(true);
        endpoints.downloadProducts(bulkProductId).then((response) => {
            setLoading(false);
            setMessage(response.data);
            setShowModal({
                ...showModal, result: true
            });
            window.location.href = `${process.env.REACT_APP_API}/media/Inventory.xlsm`;
        }).catch((error) => {
            setLoading(false);
            console.log(error);
        });
    }
    
    function handleBulkRemoveProducts(){
        setLoading(true);
        endpoints.bulkRemoveProduct(bulkProductId).then((response) => {
            setLoading(false);
            setMessage(response.data);
            setShowModal({
                ...showModal, result: true
            });
        }).catch((error) => {
            setLoading(false);
            console.log(error);
        });
    }

    return(
        <div className='container'>
            <div className='row input'>
                <Input
                    className='input-wrapper'
                    type='text'
                    placeholder='仕入元URLを入力してください。'
                    name='scrapeURL'
                    warning={warning['scrapeURL']}
                    onChange={handleChange}
                />
                <Button
                    btnClassName='btn btn-green'
                    text='取 得'
                    icon={faDownload}
                    onClick={handleScrapeProduct}
                />
            </div>

            <div className='row control'>
                <PaginationComponent
                    itemPerPage={itemPerPage}
                    counts={counts}
                    current={current}
                    itemPerPageValue={itemPerPageValue}
                    onSelectChange={handleItemPerPageChange}
                    onPaginationChange={handlePageChange}
                />
                <div className='product-action'>
                    <Button
                        btnClassName={bulkProductId.length > 0 ? 'btn btn-green' : 'btn btn-green btn-disabled'}
                        text='商品ダウンロード'
                        icon={faFileExport}
                        onClick={handleBulkSellProducts}
                    />
                    <Button 
                        btnClassName={bulkProductId.length > 0 ? 'btn btn-red' : 'btn btn-red btn-disabled'}
                        text='一括削除'
                        icon={faRemove}
                        onClick={handleBulkRemoveProducts}
                    />
                </div>
            </div>

            <div className="row">
                <table className='product collapse'>
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" onChange={handleSelectAllChange} />
                            </th>
                            <th>No</th>
                            <th className='main-image'>メイン画像</th>
                            <th className='product-url'>URL</th>
                            <th className='product-title'>タイトル</th>
                            {/* <th>説明</th> */}
                            <th className='buy-price'>原価(円)</th>
                            <th className='sell-price'>販売価(円)</th>
                            <th className='ng'>NG</th>
                            <th className='export-product'>出品</th>
                            <th className='edit-product'>編集</th>
                            <th className='remove-product'>削除</th>
                        </tr>
                    </thead>

                    {ng &&
                        <tbody id='products'>
                            {product.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <input type="checkbox" onChange={(e) => {handleProductCheckedChange(e, item['id'])}} />
                                    </td>
                                    <td>{index + 1 + (itemPerPageValue) * (current-1)}</td>
                                    <td className='main-image'>
                                        {
                                            item['productphoto_set'].length > 0 &&
                                            <img src={item['productphoto_set'][0]['path']} alt="Main Image" />
                                        }
                                    </td>
                                    <td className='product-url'>
                                        {item['source_url']}
                                    </td>
                                    <td className='product-title'>
                                        {item['title']}
                                    </td>
                                    {/* <td className='product-description'>
                                        {item['description']}
                                    </td> */}
                                    <td className='buy-price'>
                                        {item['buy_price']}
                                    </td>
                                    <td className='sell-price'>
                                        {item['sell_price']}
                                    </td>
                                    <td className='ng'>
                                        {checkNg(item) && 
                                            <span>NG</span>
                                        }
                                    </td>
                                    <td className='export-product'>
                                        <Button 
                                            text="出品"
                                            onClick={() => handleSellProduct(item['id'])}
                                        />
                                    </td>
                                    <td className='edit-product'>
                                        <Button 
                                            text='編集'
                                            onClick={() => {callEditModal(item['id'], item['title'], item['sell_price'])}}
                                        />
                                    </td>
                                    <td className='remove-product'>
                                        <Button 
                                            text='削除'
                                            onClick={() => {handleRemoveProduct(item['id'])}}
                                        />
                                    </td>
                                </tr>
                            ))}
                            
                        </tbody>
                    }
                </table>
            </div>
            
            <Loading 
                loading={loading}
            />

            {/* Edit Modal */}
            <Modal visible={showModal['edit']} width="600" height="300" onClickAway={() => {setShowModal({...showModal, edit: false})}}>
                <div className='modal edit'>
                    <Input 
                        className='row'
                        type='text'
                        name='editTitle'
                        label='タイトル'
                        value={state['editTitle']}
                        warning={warning['editTitle']}
                        onChange={handleChange}
                    />
                    <Input 
                        className='row'
                        type='number'
                        name='editSellPrice'
                        label='販売価'
                        value={state['editSellPrice']}
                        warning={warning['editSellPrice']}
                        onChange={handleChange}
                    />
                    <Button 
                        className='row'
                        btnClassName='btn btn-green'
                        text='変更'
                        icon={faEdit}
                        onClick={handleProductUpdate}
                    />
                </div>            
            </Modal>                    

            {/* Result Modal */}
            <Modal visible={showModal['result']} width="400" height="200" onClickAway={() => {setShowModal({...showModal, result: false})}}>
                <div className='modal result'>
                    <div className='message row'>
                        {message}
                    </div>
                    <Button 
                        className='row'
                        btnClassName='btn btn-green'
                        text='確認'
                        onClick={() => {window.location.href = '/home'}}
                    />
                </div>
            </Modal>

            {/* Enable Amazon */}
            <Modal visible={!showModal['enableAmazon']} width="400" height="200">
                <div className='modal result'>
                    <div className='message row'>
                        設定ページで「AmazonCredential」情報を入力します。
                    </div>
                    <Button 
                        className='row'
                        btnClassName='btn btn-green'
                        text='確認'
                        onClick={() => {window.location.href = '/setting'}}
                    />
                </div>
            </Modal>
        </div>
    )
}