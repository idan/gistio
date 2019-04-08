import React, { useState, useEffect } from "react"

const useFetch = (url: string, defaultData?: string) => {
  const [data, updateData] = useState(defaultData)
  
  useEffect(() => {
    let stale = false
    async function fetchData() {
      if (!url) {
        return
      }
      const resp = await fetch(url)
      const text = await resp.text()
      if (!stale) {
        updateData(text)    
      }
    }
    fetchData()
    return () => {
      stale = true
    }
  }, [ url ])
  
  return data
}

export default useFetch
