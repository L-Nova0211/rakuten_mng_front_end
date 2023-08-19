import Pagination from 'rc-pagination';


export default function PaginationComponent({itemPerPage, counts, current, itemPerPageValue, onSelectChange, onPaginationChange}){
    return(
        <div className='pagination'>
            <select onChange={onSelectChange}>
                {itemPerPage.map((item, index) => (
                    <option key={index} value={item}>{item}</option>
                ))}
            </select>

            <Pagination 
                nextIcon="次 >"
                prevIcon="< 以前"
                total={counts}
                current={current}
                defaultPageSize={itemPerPage[0]}
                pageSize={itemPerPageValue}
                showLessItems={true}
                onChange={onPaginationChange}
                jumpPrevIcon={'...'}
                jumpNextIcon={'...'}
            />
        </div>
    )
}