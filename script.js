const API_KEY = "c2ecc90239ecd0fe49bdd963092e4f44";
let myChart = null;

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
        <h2 style="justify-self: center;">Previsão ao longo do dia</h2>
        <canvas id="grafico" class="grafico"></canvas>
    <h3>Previsão para 5 dias</h3>
    <div class="days-container" id="diasPrevisao"></div> 
    </div>

    `;
    
    /***********      LOCALIZAÇÃO                      *************/

    var map = L.map('map').setView([data.coord.lat, data.coord.lon], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var marker = L.marker([data.coord.lat, data.coord.lon]).addTo(map);
marker.bindPopup(data.name).openPopup();
aplicarTemaMapa(document.body.classList.contains('dark'));
}


/**************** PREVISÃO DAS PROXIMAS 24h */
async function buscarPrevisao5Dias(cidade) {
    const urlPrev = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`;

    try {
        const respPrev = await fetch(urlPrev);
        const dataPrev = await respPrev.json();
        
        const hoje = new Date().toLocaleDateString('en-CA'); 
    
        const listaHoje = dataPrev.list.filter(item => item.dt_txt.includes(hoje));


        let labelsGrafico = [];
        let tempsGrafico = [];

        if (listaHoje.length > 0) {

            labelsGrafico = listaHoje.map(item => {
                const date = new Date(item.dt * 1000);
                return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            });
            tempsGrafico = listaHoje.map(item => item.main.temp);
        } else {
            labelsGrafico = ["Fim do dia"];
            tempsGrafico = [null]; 
        }

        renderizarGrafico(labelsGrafico, tempsGrafico);


        const diasDiv = document.getElementById("diasPrevisao");
        const listaParaCards = dataPrev.list.filter(i => i.dt_txt.includes("12:00:00"));

        diasDiv.innerHTML = "";

        for (let i = 0; i <= 5; i++) {
            const dia = listaParaCards[i];
            if (!dia) break;

            const desc = dia.weather[0].description;
            const emoji = escolherEmoji(desc);
            const dataDia = new Date(dia.dt * 1000);
            const nomeDia = dataDia.toLocaleString("pt-BR", { weekday: "long" });
            const umidade = dia.main.humidity;

            diasDiv.innerHTML += `
                <div class="day-card">
                    <h4>${nomeDia.toUpperCase()}</h4>
                    <p>${emoji} ${desc}</p>
                    <p>${dia.main.temp}°C</p>
                    <p>Umidade: ${umidade}%</p>
                </div>
            `;
        }

    } catch (error) {
        console.error(error);
        const result = document.getElementById("weatherResult");
        if (result) result.innerHTML += "<p>Erro ao gerar previsão!</p>";
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

// ---                   Lógica de Tema             ---/

const button = document.getElementById("toggle-theme");
const body = document.getElementById("body");

if (button) {
    button.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        button.classList.toggle("dark");

        const bola = document.getElementById("bola");
        bola.classList.toggle("dark");
        if (body.classList.contains("dark")) {
            bola.textContent = "🌑";
            bola.style.transform = "translateX(16px)";
            aplicarTemaMapa(true);
        } else {
            bola.textContent = "🌕";
            bola.style.transform = "translateX(-2px)";
            aplicarTemaMapa(false);
        }
    }); 
}
function aplicarTemaMapa(ativarDark) {
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


/******         CÓDIGO DO GRÁFICO que mostra a previsão das 00 ás 23h do dia de hoje */
function renderizarGrafico(labels, temps) {
    const ctx = document.getElementById("grafico");

    if (myChart !== null) {
        myChart.destroy();
    }

    // Define cores baseadas no tema atual
    const isDark = document.body.classList.contains('dark');
    const corTexto = isDark ? '#ffffff' : '#333333';
    const corLinha = isDark ? '#ffffff' : '#555555';
    const corFundo = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';

    myChart = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: temps,
                borderWidth: 2,
                borderColor: corLinha,
                backgroundColor: corFundo,
                tension: 0.3, 
                fill: true,
                pointBackgroundColor: corLinha
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: corTexto }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: { color: corTexto },
                    grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                },
                x: {
                    ticks: { color: corTexto },
                    grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                }
            }
        }
    });
}