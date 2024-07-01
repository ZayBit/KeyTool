const express = require('express');

const app = express();
const path = require('path')
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs')

app.engine('html', require('ejs').renderFile)
// routes
app.use('/', require('./routes/index'))

app.listen(3450, () => {
    console.log('Servidor iniciado en el puerto 3000');
});