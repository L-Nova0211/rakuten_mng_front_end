const SITE = {
    'amazon': 'Amazon',
    'tajimaya': 'タジマヤ',
    'oroshi': '卸売り'
}

export default function sortSiteByUrl(url) {
    let site = '';
    if(url.includes('amazon')) {
        site = SITE['amazon'];
    }
    else if(url.includes('tajimaya')) {
        site = SITE['tajimaya'];
    }
    else if(url.includes('oroshi')) {
        site = SITE['oroshi'];
    }
    return site;
}
