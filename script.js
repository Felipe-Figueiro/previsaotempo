const API_KEY = "c2ecc90239ecd0fe49bdd963092e4f44";


async function buscarClima(cidadeDireta = null) {
    const cidade = cidadeDireta || document.getElementById("cityInput").value;
    const result = document.getElementById("weatherResult");

    if (!cidade) {
        result.innerHTML = "<p>Digite uma cidade</p>"
        return;
    }

    const urlAtual = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`;

    try {
        const respAtual = await fetch(urlAtual);
        const climaAtual = await respAtual.json();

        if (climaAtual.cod == "404") {
            result.innerHTML = "<p>Cidade não encontrada</p>";
            return;
        }

        renderClimaAtual(climaAtual);
        buscarPrevisao5Dias(cidade);
    } catch (error) {
        result.innerHTML = "<p>Erro ao buscar dados!</p>";
    }
}

function renderClimaAtual(data) {
    const result = document.getElementById("weatherResult");
    const desc = data.weather[0].description;
    const emoji = escolherEmoji(desc);

    result.innerHTML = `
    <div style="display: flex; align-items: center;">
        <div class="current-weather">
            <h3>${data.name} - ${data.sys.country}</h3>
            <p><strong>${emoji} ${desc}</strong></p>
            <p>${data.main.temp}°C</p>
            <p>Umidade: ${data.main.humidity}%</p>
            <p>Vento: ${data.wind.speed}km/h</p>
        </div>  
        <div id="map" style="margin-top: 20px ;"></div>
    </div>
    <h3>Previsão para 5 dias</h3>
    <div class="days-container" id="diasPrevisao"></div> 
    </div>`;
    /***********      LOCALIZAÇÃO                      *************/

    var map = L.map('map').setView([data.coord.lat, data.coord.lon], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var marker = L.marker([data.coord.lat, data.coord.lon]).addTo(map);
marker.bindPopup(data.name).openPopup();
if (document.body.classList.contains("dark")) {
        aplicarTemaMapa(true);
    }
}
function aplicarTemaMapa(ativarDark) {
    // Seleciona as camadas do mapa que existem AGORA
    const mapLayers = document.querySelectorAll(".leaflet-layer");
    const mapZoomIn = document.querySelectorAll(".leaflet-control-zoom-in");
    const mapZoomOut = document.querySelectorAll(".leaflet-control-zoom-out");
    const mapAttrib = document.querySelectorAll(".leaflet-control-attribution");

    if (ativarDark) {
        mapLayers.forEach(l => l.classList.add("dark"));
        mapZoomIn.forEach(z => z.classList.add("dark"));
        mapZoomOut.forEach(z => z.classList.add("dark"));
        mapAttrib.forEach(a => a.classList.add("dark"));
    } else {
        mapLayers.forEach(l => l.classList.remove("dark"));
        mapZoomIn.forEach(z => z.classList.remove("dark"));
        mapZoomOut.forEach(z => z.classList.remove("dark"));
        mapAttrib.forEach(a => a.classList.remove("dark"));
    }
}

/*************************************** PREVISÃO 5DIAS ***********************/
async function buscarPrevisao5Dias(cidade) {
    const urlPrev = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`;

    try {
        const respPrev = await fetch(urlPrev);
        const dataPrev = await respPrev.json();

        const diasDiv = document.getElementById("diasPrevisao");

        const listaFiltrada = dataPrev.list.filter(i => i.dt_txt.includes("12:00:00"));

        let labels = [];
        let temps = [];

        diasDiv.innerHTML = "";

        for (let i = 0; i <= 5; i++) {
            const dia = listaFiltrada[i];
            if (!dia) break;

            const desc = dia.weather[0].description;
            const emoji = escolherEmoji(desc);

            const dataDia = new Date(dia.dt * 1000);
            const nomeDia = dataDia.toLocaleString("pt-BR", { weekday: "long" });

            labels.push(nomeDia);
            temps.push(dia.main.temp);

            diasDiv.innerHTML += `
                <div class="day-card">
                    <h4>${nomeDia.toUpperCase()}</h4>
                    <p>${emoji} ${desc}</p>
                    <p>${dia.main.temp}°C</p>
                </div>
        `;
        }
        renderChart(labels, temps);
    } catch (error) {
        result.innerHTML = "<p>Erro ao buscar dados!</p>";
    }


}
function escolherEmoji(desc) {
    if (desc.includes("nublado")) return "☁️☁️"
    if (desc.includes("nuvens dispersas")) return "☁️"
    if (desc.includes("chuva")) return "🌧️"
    if (desc.includes("algumas nuvens")) return "🌥️"
    if (desc.includes("céu limpo")) return "☀️"
    if (desc.includes("tempestade", "temporal")) return "🌩️"
    if (desc.includes("neve")) return "❄️"

}
/*****                  PREVISÃO MEIO DIA               */





// ---                   Lógica de Tema             ---/

const button = document.getElementById("toggle-theme");
const body = document.getElementById("body");

if (button) {
    button.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        button.classList.toggle("dark");

        const dayCards = document.querySelectorAll(".day-card");
        dayCards.forEach(card => {
            card.classList.toggle("dark");
        });
        
        const bola = document.getElementById("bola");
        bola.classList.toggle("dark");
        if (body.classList.contains("dark")) {
            bola.textContent = "🌑";
            bola.style.transform = "translateX(16px)";
        } else {
            bola.textContent = "🌕";
            bola.style.transform = "translateX(-2px)";
        }
    }); 
}




/****                       FORMULARIO DE COTATO             *********/

const formContato = document.getElementById('formContato');
const motivo = document.getElementById('motivo');
const nomesup = document.getElementById('nome');
const emailsup = document.getElementById('email');
const msgsup = document.getElementById('mensagem');

if (formContato) {
    formContato.addEventListener('submit', function (event) {

        event.preventDefault();


        const ticketSuporte = {

            motivo: motivo ? motivo.value : "Não especificado",
            nome: nomesup.value.trim(),
            email: emailsup.value.trim(),
            mensagem: msgsup.value.trim()
        };

        localStorage.setItem('ticketSuporte', JSON.stringify(ticketSuporte));

        alert('Suporte enviado com sucesso!');
        formContato.reset();


    });
}