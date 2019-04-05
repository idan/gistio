import React, { useState, useEffect } from "react"

const useFetch = (url: string, defaultData?: string) => {
    const [data, updateData] = useState(defaultData)

    useEffect(() => {
        async function fetchData() {
            console.log('***** FETCHING URL: ', url)
            if (!url) {
                return
            }
            const resp = await fetch(url)
            console.log('***** FETCHED RESP: ', resp)

            const text = await resp.text()
            updateData(text)    
        }
        fetchData()
    })

    return data
}

export default useFetch
