import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { faDownload, faEdit, faFileExport, faRemove } from "@fortawesome/free-solid-svg-icons";
import Modal from 'react-awesome-modal';

import Input from '../component/Input';
import Button from '../component/Button';
import Loading from '../component/Loading';
import PaginationComponent from '../component/Pagination';
import endpoints from '../util/apiCall';
import sortSiteByUrl from '../util/sourceSite';


export default function Home(){
    const [searchParams, setSearchParams] = useSearchParams();
    const [state, setState] = useState({
        id: '',
        scrapeURL: '',
        editTitle: '',
        editSellPrice: '',
        editPoint: '',
        editQuantity: '',
        editShippingMethod: ''
    });
    const shippingMethod = {
        shipping_mail: '送料メール便',
        shipping_60: '送料60サイズ',
        shipping_80: '送料80サイズ',
        shipping_100: '送料100サイズ',
        shipping_120: '送料120サイズ'
    };
    const [shippingMethodDom, setShippingMethodDom] = useState([]);
    const [product, setProduct] = useState([]);
    const [warning, setWarning] = useState({
        scrapeURL: false,
        editTitle: false,
        editSellPrice: false,
        editPoint: false,
        editQuantity: false
    });
    const [bulkProductId, setBulkProductId] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState({
        success: false,
        error: false,
        edit: false,
        enableRakuten: true
    });
    const [message, setMessage] = useState('');
    const itemPerPage = [20, 50, 100, 200];
    const [counts, setCounts] = useState(0);
    const [current, setCurrent] = useState(1);
    const [itemPerPageValue, setItemPerPageValue] = useState(itemPerPage[0]);

    useEffect(() => {
        const options = Object.entries(shippingMethod).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
        ));
        setShippingMethodDom(options);
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
                setMessage('操作が失敗しました。もう一度お試しください。');
                setShowModal({
                    ...showModal,
                    error: true
                });
            });
        }
    }

    function handleSellProduct(id){
        setLoading(true);
        endpoints.bulkInsertProduct([id]).then((response) => {
            let data = response.data;
            let message = '';
            if(data['success'].length > 0) {
                message += `${data['success'].length}件の商品が正常に登録されました。\n`
            }
            if(data['failed'].length > 0) {
                message += `${data['failed'].length}件の商品登録が失敗しました。\n`
            }
            setLoading(false);
            setMessage(message);
            setShowModal({
                ...showModal,
                success: true
            });
        }).catch((error) => {
            setLoading(false);
            setMessage('操作が失敗しました。もう一度お試しください。');
            setShowModal({
                ...showModal,
                error: true
            });
        });
    }
    
    function callEditModal(id, title, sellPrice, point, quantity, editShippingMethod){
        setState({
            ...state,
            id: id,
            editTitle: title,
            editSellPrice: sellPrice,
            editPoint: point,
            editQuantity: quantity,
            editShippingMethod: editShippingMethod
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
        else if(state['editPoint'] === ''){
            setWarning({
                ...warning, editPoint: true
            });
            return;
        }
        else if(state['editQuantity'] === ''){
            setWarning({
                ...warning, editQuantity: true
            });
            return;
        }
        else{
            const data = {
                title: state['editTitle'],
                sell_price: state['editSellPrice'],
                point: state['editPoint'],
                quantity: state['editQuantity'],
                shipping_method: state['editShippingMethod']
            };
            endpoints.updateProduct(state['id'], data).then((response) => {
                window.location.href = '';
            }).catch((error) => {
                setMessage('操作が失敗しました。もう一度お試しください。');
                setShowModal({
                    ...showModal,
                    edit: false,
                    error: true
                });
            });
        }
    }

    function handleRemoveProduct(id){
        setLoading(true);
        endpoints.bulkRemoveProduct([id]).then((response) => {
            window.location.href = '';
        }).catch((error) => {
            setMessage('操作が失敗しました。もう一度お試しください。');
            setLoading(false);
            setShowModal({
                ...showModal,
                error: true
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
        endpoints.bulkInsertProduct(bulkProductId).then((response) => {
            let data = response.data;
            let message = '';
            if(data['success'].length > 0) {
                message += `${data['success'].length}件の商品が正常に登録されました。\n`
            }
            if(data['failed'].length > 0) {
                message += `${data['failed'].length}件の商品登録が失敗しました。\n`
            }
            setLoading(false);
            setMessage(message);
            setShowModal({
                ...showModal,
                success: true
            });
        }).catch((error) => {
            setLoading(false);
            setMessage('操作が失敗しました。もう一度お試しください。');
            setShowModal({
                ...showModal,
                error: true
            });
        })
    }
    
    function handleBulkRemoveProducts(){
        setLoading(true);
        endpoints.bulkRemoveProduct(bulkProductId).then((response) => {
            setLoading(false);
            setMessage(response.data);
            setShowModal({
                ...showModal, error: true
            });
        }).catch((error) => {
            setLoading(false);
            setMessage('操作が失敗しました。もう一度お試しください。');
            setShowModal({
                ...showModal,
                error: true
            });
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
                        text='一括出品'
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
                            <th className='checkbox'>
                                <input type="checkbox" onChange={handleSelectAllChange} />
                            </th>
                            <th className='number'>No</th>
                            <th className='main-image'>メイン画像</th>
                            <th className='product-jan'>JAN</th>
                            <th className='product-title'>商品名</th>
                            <th className='product-site'>販売元</th>
                            <th className='product-quantity'>在庫数</th>
                            <th className='sell-price'>販売価格(円)</th>
                            <th className='unit-price'>一つ当たり の値段 (円)</th>
                            <th className='count-set'>入数</th>
                            <th className='buy-price'>原価(円)</th>
                            <th className='shipping-fee'>送料(円)</th>
                            <th className='price-fee'>手数料(円)</th>
                            <th className='point'>ポイント</th>
                            <th className='profit'>粗利額(円)</th>
                            <th className='profit-rate'>粗利率(%)</th>
                            <th className='roi'>ROI(%)</th>
                            <th className='product-edit'>編集</th>
                            <th className='product-export'>出品</th>
                            <th className='product-remove'>削除</th>
                        </tr>
                    </thead>

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
                                <td>
                                    {item['jan']}
                                </td>
                                <td>
                                    {item['title']}
                                </td>
                                <td className='product-site'>
                                    <a href={item['source_url']} target='_blank'>{sortSiteByUrl(item['source_url'])}</a>
                                </td>
                                <td>
                                    {item['quantity']}
                                </td>
                                <td>
                                    {item['sell_price']}
                                </td>
                                <td>
                                    {item['buy_price']}
                                </td>
                                <td>
                                    {item['count_set']}
                                </td>
                                <td>
                                    {item['buy_price']*item['count_set']}
                                </td>
                                <td>
                                    {item['shipping_fee']}
                                </td>
                                <td>{item['rakuten_fee']}</td>
                                <td>{item['point']}</td>
                                <td>{item['profit']}</td>
                                <td>{(item['profit']*100/item['sell_price']).toFixed(2)}</td>
                                <td>{(item['profit']*100/(item['buy_price']*item['count_set']*1.1)).toFixed(2)}</td>
                                <td>
                                    <Button 
                                        text='編集'
                                        onClick={() => {callEditModal(item['id'], item['title'], item['sell_price'], item['point'], item['quantity'], item['shipping_method'])}}
                                    />
                                </td>
                                <td>
                                    <Button 
                                        text='出品'
                                        onClick={() => {handleSellProduct(item['id'])}}
                                    />
                                </td>
                                <td>
                                    <Button 
                                        text='削除'
                                        onClick={() => {handleRemoveProduct(item['id'])}}
                                    />
                                </td>
                            </tr>
                        ))}
                        
                    </tbody>
                </table>
            </div>
            
            <Loading 
                loading={loading}
            />

            {/* Edit Modal */}
            <Modal visible={showModal['edit']} width="600" height="500" onClickAway={() => {setShowModal({...showModal, edit: false})}}>
                <div className='modal edit'>
                    <Input 
                        className='row'
                        type='text'
                        name='editTitle'
                        label='商品名'
                        value={state['editTitle']}
                        warning={warning['editTitle']}
                        onChange={handleChange}
                    />
                    <Input 
                        className='row'
                        type='number'
                        name='editSellPrice'
                        label='販売価格'
                        value={state['editSellPrice']}
                        warning={warning['editSellPrice']}
                        onChange={handleChange}
                    />
                    <Input 
                        className='row'
                        type='number'
                        name='editPoint'
                        label='ポイント'
                        value={state['editPoint']}
                        warning={warning['editPoint']}
                        onChange={handleChange}
                    />
                    <Input 
                        className='row'
                        type='number'
                        name='editQuantity'
                        label='在庫数'
                        value={state['editQuantity']}
                        warning={warning['editQuantity']}
                        onChange={handleChange}
                    />
                    <div className="row">
                        <div className="label">発送方法</div>
                        <select name="editShippingMethod" value={state['editShippingMethod']} onChange={handleChange}>
                            {shippingMethodDom}
                        </select>
                    </div>
                    <Button 
                        className='row'
                        btnClassName='btn btn-green'
                        text='変更'
                        icon={faEdit}
                        onClick={handleProductUpdate}
                    />
                </div>            
            </Modal>                    

            {/* Success Modal */}
            <Modal visible={showModal['success']} width="400" height="200" onClickAway={() => {setShowModal({...showModal, success: false})}}>
                <div className='modal result'>
                    <div className='message row'>
                        {message}
                    </div>
                    <Button 
                        className='row'
                        btnClassName='btn btn-green'
                        text='確認'
                        onClick={() => {window.location.href = '/productManager'}}
                    />
                </div>
            </Modal>

            {/* Error Modal */}
            <Modal visible={showModal['error']} width="400" height="200" onClickAway={() => {setShowModal({...showModal, error: false})}}>
                <div className='modal result'>
                    <div className='message row'>
                        {message}
                    </div>
                    <Button 
                        className='row'
                        btnClassName='btn btn-green'
                        text='確認'
                        onClick={() => {window.location.href = ''}}
                    />
                </div>
            </Modal>

            {/* Enable Rakuten */}
            <Modal visible={!showModal['enableRakuten']} width="400" height="200">
                <div className='modal result'>
                    <div className='message row'>
                        設定ページで「RakutenCredential」情報を入力します。
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