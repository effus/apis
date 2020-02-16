const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
.get('/', (req, res) => {
    return {
        'api': {
            'title': 'meet',
            'vers': '1.0.0'
        }
    };
})
.listen(PORT, () => console.log(`Listening on ${ PORT }`))