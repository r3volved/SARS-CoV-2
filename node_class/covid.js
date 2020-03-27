const defaultUrl = `https://beta.ctvnews.ca/content/dam/common/exceltojson/COVID-19%20Canada.txt`
const node_fetch = require('node-fetch')
const fetchJSON = ( url ) => node_fetch(url).then(data => data.json())

class Covid {
    constructor ( url ) {
        this.url = url || defaultUrl
        this.data = []
    }

    update () {
        return fetchJSON(this.url).then(data => this.data = data)
    }

    groupBy ( group, key ) {
        return group.reduce((acc,item) => {
            item[key] = item[key] || 'pending'
            acc[item[key]] = acc[item[key]] || []
            acc[item[key]].push(item)
            return acc
        },{})
    }

    countBy ( group, key ) {
        return group.reduce((sum,item) => {
            sum[item[key]] = sum[item[key]] || 0
            sum[item[key]]++
            return sum
        },{})
    }

    async canada () {
        if( !this.data.length ) await this.update()
        var dateKey = 'date_start'
        var statusKey = 'status'
        this.data.sort((a,b) => a[dateKey] - b[dateKey])
        var provinces = this.groupBy( this.data, 'province' )
        Object.keys(provinces).forEach(province => {
            provinces[province] = this.groupBy( provinces[province], 'region' )
            Object.keys(provinces[province]).forEach(region => {
                provinces[province][region] = this.countBy( provinces[province][region], statusKey )
            })
        })
        return provinces
    }

    async province ( prov ) {
        return this.roundup().then(r => r[prov])
    }

}

module.exports = Covid
