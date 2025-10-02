const API_KEY = "ebc3aa367c8eaa429590b9281059bc37"; // 🔑 Substitua
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Enviar mensagem
sendBtn.addEventListener('click', () => {
    const pergunta = userInput.value.trim();
    if (!pergunta) return;
    addMessage(pergunta, 'user-message');
    userInput.value = '';
    processMessage(pergunta);
});

// Enter envia mensagem
userInput.addEventListener("keypress", e => {
    if(e.key === "Enter") sendBtn.click();
});

// Adiciona mensagem com delay simulando digitação
function addMessage(text, className, type='') {
    const message = document.createElement('div');
    message.className = `message ${className} ${type}`;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;

    let i = 0;
    const icon = (type === 'clima') ? '🌤️' : (type==='hora') ? '⏰' : (type==='cep') ? '📍' : '';
    const textToShow = icon ? icon + ' ' + text : text;

    const interval = setInterval(() => {
        message.textContent += textToShow[i];
        i++;
        if(i >= textToShow.length) clearInterval(interval);
    }, 20);
}

// Processa pergunta
function processMessage(pergunta) {
    pergunta = pergunta.toLowerCase();

    if(pergunta.includes('clima') || pergunta.includes('tempo')) {
        const regex = /em ([a-zA-ZÀ-ÿ\s]+)/i;
        const match = pergunta.match(regex);
        if(match && match[1]) getWeather(match[1].trim());
        else addMessage("Diga 'clima em [cidade]'.", 'bot-message');
    }
    else if(pergunta.includes('hora') || pergunta.includes('horário')) {
        const now = new Date();
        const hora = now.toLocaleTimeString('pt-BR');
        addMessage(`Agora são ${hora}.`, 'bot-message', 'hora');
    }
    else if(pergunta.includes('cep')) {
        const regex = /cep ([0-9]{5}-?[0-9]{3})/;
        const match = pergunta.match(regex);
        if(match && match[1]) getCEP(match[1].replace('-', ''));
        else addMessage("Informe assim: 'cep 12345-678'.", 'bot-message');
    }
    else addMessage("Posso responder sobre clima, hora ou CEP.", 'bot-message');
}

// Função Clima
async function getWeather(cidade) {
    const proxyUrl = "https://api.allorigins.win/get?url=";
    const apiUrl = encodeURIComponent(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`);

    try {
        const response = await fetch(proxyUrl + apiUrl);
        const dataWrapped = await response.json();
        const data = JSON.parse(dataWrapped.contents);

        if(data.cod && data.cod !== 200) {
            addMessage(`Cidade "${cidade}" não encontrada.`, 'bot-message', 'clima');
            return;
        }

        const temp = data.main.temp;
        const desc = data.weather[0].description;
        const cidadeNome = data.name;
        const pais = data.sys.country;

        addMessage(`O clima em ${cidadeNome}, ${pais} é ${temp}°C com ${desc}.`, 'bot-message', 'clima');
    } catch (error) {
        addMessage(`Erro ao obter o clima.`, 'bot-message', 'clima');
    }
}

// Função CEP
async function getCEP(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if(data.erro) {
            addMessage(`CEP ${cep} não encontrado.`, 'bot-message', 'cep');
            return;
        }

        addMessage(`CEP ${cep}: ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`, 'bot-message', 'cep');
    } catch (error) {
        addMessage(`Erro ao buscar CEP.`, 'bot-message', 'cep');
    }
}
