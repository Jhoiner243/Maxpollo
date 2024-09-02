const express = require('express');
const router = express.Router();

router.get("/",(req, res)=>{
    res.render('clientes');
});

module.exports = router;