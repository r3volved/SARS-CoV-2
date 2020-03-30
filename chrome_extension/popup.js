var covid19Data = null

const total     = document.getElementById('total')
const confirmed = document.getElementById('confirmed')
const recovered = document.getElementById('recovered')
const deceased  = document.getElementById('deceased')
const report    = document.getElementById('report')
const rrate    = document.getElementById('rrate')
const drate    = document.getElementById('drate')
const countrySelect = document.getElementById('country')
const provinceSelect = document.getElementById('province')

const url = `https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/stats`
const options = { headers:{
    "x-rapidapi-host": "covid-19-coronavirus-statistics.p.rapidapi.com",
    "x-rapidapi-key": "56d7428a39msh84b7715564fae12p1aa2a8jsn006633b8ab7a"
} }

const color = { confirmed:'#CA4', recovered:'#8AF', deceased:'#E45', pending:'#EEE' }

const update = () => fetch(url, options)
    .then(r => r.json())
    .then(r => covid19Data = r.data)
    .catch(console.error)

const loadAll = async ( data ) => {
    if( !data ) data = covid19Data || await update()
    var { covid19Stats } = data || {}
    var sum = { confirmed:0, recovered:0, deceased:0 }
    var countries = covid19Stats.reduce((acc,item) => {
        var { country, confirmed = 0, recovered = 0, deaths = 0 } = item
        acc[country] = acc[country] || { confirmed:0, recovered:0, deaths:0, total:0 }
        acc[country].confirmed += confirmed || 0
        acc[country].recovered += recovered || 0
        acc[country].deaths += deaths || 0
        acc[country].total += (confirmed + recovered + deaths) || 0

        sum.confirmed += confirmed || 0
        sum.recovered += recovered || 0
        sum.deceased  += deaths || 0
        return acc
    },{})

    confirmed.value = sum.confirmed.toLocaleString()
    recovered.value = sum.recovered.toLocaleString()
    deceased.value  = sum.deceased.toLocaleString()
    total.value     = (sum.confirmed + sum.recovered + sum.deceased).toLocaleString()
    rrate.value     = (sum.recovered / (sum.confirmed + sum.recovered + sum.deceased) * 100).toFixed(2)
    drate.value     = (sum.deceased / (sum.confirmed + sum.recovered + sum.deceased) * 100).toFixed(2)

    var countryKeys = Object.keys(countries)
        .sort((a,b) => countries[b].deaths - countries[a].deaths)

    countrySelect.innerHTML = [`<option value="">Country ...</option>`]
        .concat( countryKeys.map(c => `<option value="${c}">${c} (${countries[c].deaths.toLocaleString()})</option>`) )
        .join("")

    countrySelect.classList.remove('hidden')
    provinceSelect.classList.add('hidden')

}

const loadCountry = async ( country, data ) => {
    if( !data ) data = covid19Data || await update()
    var { covid19Stats } = data || {}
    var sum = { confirmed:0, recovered:0, deceased:0 }
    var provinces = covid19Stats
        .filter(d => d.country == country)
        .reduce((acc,prov) => {
            var { confirmed = 0, recovered = 0, deaths = 0 } = prov
            acc[prov.province] = { confirmed, recovered, deaths, total:(confirmed + recovered + deaths) }
            sum.confirmed += confirmed
            sum.recovered += recovered
            sum.deceased  += deaths
            return acc
        },{})

    confirmed.value = sum.confirmed.toLocaleString()
    recovered.value = sum.recovered.toLocaleString()
    deceased.value  = sum.deceased.toLocaleString()
    total.value     = (sum.confirmed + sum.recovered + sum.deceased).toLocaleString()
    rrate.value    = (sum.recovered / (sum.confirmed + sum.recovered + sum.deceased) * 100).toFixed(2)
    drate.value    = (sum.deceased / (sum.confirmed + sum.recovered + sum.deceased) * 100).toFixed(2)

    var provinceKeys = Object.keys(provinces)
        .sort((a,b) => provinces[b].deaths - provinces[a].deaths)

    provinceSelect.innerHTML = [`<option value="">Provnce / State ...</option>`]
        .concat( provinceKeys.map(c => `<option value="${c}">${c} (${provinces[c].deaths.toLocaleString()})</option>`) )
        .join("")

    provinceSelect.classList.remove('hidden')
    report.classList.remove('hidden')

    draw( sum, sum.confirmed + sum.recovered + sum.deceased )
}

const loadProvince = async ( country, province, data ) => {
    if( !data ) data = covid19Data || await update()
    var { covid19Stats } = data || {}
    var sum = { confirmed:0, recovered:0, deceased:0 }
    covid19Stats
        .filter(d => d.country == country && d.province == province)
        .forEach(prov => {
            var { confirmed = 0, recovered = 0, deaths = 0 } = prov
            sum.confirmed += confirmed
            sum.recovered += recovered
            sum.deceased  += deaths
        })

    confirmed.value = sum.confirmed.toLocaleString()
    recovered.value = sum.recovered.toLocaleString()
    deceased.value  = sum.deceased.toLocaleString()
    total.value     = (sum.confirmed + sum.recovered + sum.deceased).toLocaleString()
    rrate.value    = (sum.recovered / (sum.confirmed + sum.recovered + sum.deceased) * 100).toFixed(2)
    drate.value    = (sum.deceased / (sum.confirmed + sum.recovered + sum.deceased) * 100).toFixed(2)

    report.classList.remove('hidden')

    draw( sum, sum.confirmed + sum.recovered + sum.deceased )
}

const draw = ( sum, total ) => {

    var pad = 1
    var step = 5
    var newW = Math.ceil(Math.sqrt(total))
        newW = newW > 100 ? 100 : newW

    const canvas = report
    canvas.width  = newW * (step + pad) + pad
    canvas.height = Math.ceil(total / newW) * (step + pad) + pad

    const checkHeight = ( vert ) => (vert + pad + step) > canvas.height
    const checkWidth = ( horz ) => (horz + pad + step) > canvas.width
    const ctx = canvas.getContext('2d')
    
    var x = pad
    var y = pad
    
    var data = new Array(sum.deceased).fill('deceased')
        .concat( new Array(sum.recovered).fill('recovered') )
        .concat( new Array(sum.confirmed).fill('confirmed') )
    
    data.forEach(d => {
        ctx.fillStyle = color[d||'pending']
        ctx.fillRect(x,y,step,step)
        x += pad + step
        if( checkWidth(x) ) {
            x = pad
            y += pad + step
        }
    })

}

new Promise(done => setTimeout(done, 200))
    .then(() => loadAll( covid19Data ))
    .then(() => {
        countrySelect.onchange = function(ev) {
            if( this.value ) loadCountry(this.value, covid19Data)
            else loadAll( covid19Data )
        }
        provinceSelect.onchange = function(ev) {
            if( this.value ) loadProvince(countrySelect.value, this.value, covid19Data)
            else loadCountry(countrySelect.value, covid19Data)
        }
        return
    })
    .catch(console.error)
