// Estancia do Framework Express utilizado
const express = require('express');
const path = require('path');

// Criacao da estancia do servidor HTTP, necessário para o funcionamento da aplicacao
const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server);

// Configuracoes para atrelar o que esta em funcionamento aqui no backend com o que esta no frontend
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Quando o app é iniciado a renderezicao do frontend tambem é iniciada
app.use('/', (req, res) => {
    res.render('index.html');
});

// Listas auxiliares
let messages = [];
let users = [];

// Configuracoes do Socket.io
io.on('connect', socket => {
    // Assim que um usuario se conecta na aplicacao, uma mensagem é exibida no terminal do lado do backend
    // com o id do socket conectado
    console.log(`Socket conectado: ${socket.id}`);

    // Quando um socket é disconectado, ou seja, quando um usuario fecha a aplicacao, uma mensagem no lado
    // do backend tambem é exibida
    socket.on('disconnect', () => {
        console.log(`Socket disconectado: ${socket.id}`)
        socket.emit('usuarioDesconectado', socket.id)
    });

    // Momento em que o backend transmite via socket para o frontend o historico de mensagens enviadas
    // e tambem de usuarios quando um novo usuario entra na sala
    socket.emit('previousMessages', messages);
    socket.emit('previousUsers', users);

    // Momento em que o usuario entra na sala e todos os outros podem ver quem entrou
    socket.on('sendUsername', user => {
        if (users.indexOf(user) < 0) {
            users.push(user);
            socket.broadcast.emit('receivedUser', user);
        } else {
            socket.broadcast.emit('userExists', user);
        }
    });

    // Envio da mensagem de um usuario para todos os outros via socket
    socket.on('sendMessage', data => {
        messages.push(data);
        socket.broadcast.emit('receivedMessage', data);
    });
});

// Configura nosso servidor http na porta 3000 e exibe uma mensagem
server.listen(3000, function() {
    console.log('Listening on port 3000*')
});