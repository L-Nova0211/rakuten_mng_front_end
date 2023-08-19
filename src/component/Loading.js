export default function Loading({loading}){
    return (
        <div className={loading ? 'loading active': 'loading'}>
            <div className='dot-spin'></div>
            <span><b>進行中</b></span>
        </div>
    )
}