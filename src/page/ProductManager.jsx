import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { faEdit, faSearch } from "@fortawesome/free-solid-svg-icons";
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
                    placeholder='商品名をご入力ください。'
                    name='scrapeURL'
                    warning={warning['scrapeURL']}
                    onChange={handleChange}
                />
                <Button
                    btnClassName='btn btn-green'
                    text='検 索'
                    icon={faSearch}
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
            </div>

            <div className="row">
                <table className='product collapse'>
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" onChange={handleSelectAllChange} />
                            </th>
                            <th className='number'>No</th>
                            <th className='flag'>フラグ</th>
                            <th className='product_name'>商品名</th>
                            <th className='product_SKU'>SKU</th>
                            <th className='update_flag'>更新フラグ</th>
                            <th className='super_flag'>仕入れ原価上限フラグ</th>
                            <th className='inventory'>在庫数設定</th>
                            <th className='sale_money'>販売価格(円)</th>
                            <th className='origin_money'>原価(円)</th>
                            <th className='send_money'>送料(円)</th>
                            <th className='rest_money'>手数料(円)</th>
                            <th className='point_back'>ポイント還元</th>
                            <th className='utility_money'>粗利額(円)</th>
                            <th className='utility_pro'>粗利率(%)</th>
                            <th className='product_ROI'>ROI(%)</th>
                        </tr>
                    </thead>

                    <tbody id='products'>
                        {/* {product.map((item, index) => ( */}
                            <tr>
                                <td>
                                    <input type="checkbox" onChange={(e) => {handleProductCheckedChange(e, ['id'])}} />
                                </td>
                                <td className='number'>{ 1 + (itemPerPageValue) * (current-1)}</td>
                                <td className='flag'>
                                    {/* {
                                        item['productphoto_set'].length > 0 &&
                                        <img src={item['productphoto_set'][0]['path']} alt="Main Image" />
                                    } */}
                                    true or false
                                </td>
                                <td className='product_name'>
                                    product_name
                                </td>
                                <td className='update_flag'>
                                    product_SKU
                                </td>
                                <td className=''>
                                    update_flag
                                </td>
                                <td className='super_flag'>
                                    super_flag
                                </td>
                                <td className='inventory'>
                                    {/* {item['sell_price']} */}
                                    inventory
                                </td>
                                <td className='sale_money'>
                                    {/* <Button 
                                        text="出品"
                                        onClick={() => handleSellProduct(item['id'])}
                                    /> */}
                                    sale_money
                                </td>
                                <td className='origin_money'>
                                    {/* <Button 
                                        text='編集'
                                        onClick={() => {callEditModal(item['id'], item['title'], item['sell_price'])}}
                                    /> */}
                                    origin_money
                                </td>
                                <td className='send_money'>
                                    {/* <Button 
                                        text='削除'
                                        onClick={() => {handleRemoveProduct(item['id'])}}
                                    /> */}
                                    send_money
                                </td>
                                <td className='rest_money'>rest_money</td>
                                <td className='point_back'>point_back</td>
                                <td className='utility_money'>gerchin_money</td>
                                <td className='utility_pro'>joryul</td>
                                <td className='product_ROI'>ROI(%)</td>
                            </tr>
                        {/* ))} */}
                        
                    </tbody>
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
