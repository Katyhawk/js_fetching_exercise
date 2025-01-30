import key from "./key.mjs";
/* NS-API key wordt geïmporteerd van een ander bestand die niet in git staat.
Als je de code moet testen, voeg dan je eigen NS-API key toe aan key.mjs.example en hernoem het bestand naar `key.mjs`. */
const apiKey = key();
const body = document.querySelector('body');
const persons = document.querySelector('.persons');

async function fetchData() {
    const requestUrl = 'https://randomuser.me/api/?results=6';
    const response = await fetch(requestUrl);
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }

    const jsonData = await response.json();
    return jsonData.results;
}

async function fetchFlag(country) {
    const requestUrl = `https://restcountries.com/v3.1/name/${country}`;
    const response = await fetch(requestUrl);
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }

    const jsonData = await response.json();
    return jsonData[0].flags.png;
}

async function fetchStation(stationUIC) {
    const requestUrl =
        `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/departures?uicCode=${stationUIC}&maxJourneys=1`;
    const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
            "Ocp-Apim-Subscription-Key": apiKey,
        },
    });
    const jsonData = await response.json();
    return jsonData.payload.departures[0].direction;
}




await fetchData().then(jsonData => {
    jsonData.forEach(p => {
        let card = document.createElement('div');
        card.classList.add('profiles');

        let name = document.createElement('h3');
        name.textContent = `${p.name.first} ${p.name.last}`;

        let image = document.createElement('img');
        // console.log('1', p.picture.large);
        image.src = p.picture.large;
        image.setAttribute('Selected', '');

        image.classList.add('profile');

        let email = document.createElement('p');
        email.textContent = `Email: ${p.email}`;

        let country = document.createElement('p');
        country.classList.add('countryname');
        // console.log(p.location.country);
        country.textContent = `Country: ${p.location.country}`;

        body.appendChild(card);
        card.appendChild(name);
        // console.log('2', p.picture.large);
        card.appendChild(image);
        card.appendChild(email);
        card.appendChild(country);
    });
}).then(() => {
    let profiles = document.querySelectorAll('.profiles');
    profiles.forEach((p, index) => {
        const profileImage = p.querySelector('.profile');
        let nationalities = p.querySelector('.countryname').textContent;
        let country = nationalities.replace('Country: ', '');

        fetchFlag(country).then(jsonData => {
            let countryFlag = jsonData;
            let flagElement = document.createElement('img');
            flagElement.classList.add('flag');
            flagElement.src = countryFlag;
            p.appendChild(flagElement);
        });
    });
}).then(() => {
    const divs = document.querySelectorAll('.profiles');
    // console.log(divs[0]);
    const trainStations = [
        ["Delft", 8400170],
        ["Amsterdam", 8400058],
        ["Alkmaar", 8400050],
        ["Deventer", 8400173],
        ["Venlo", 8400644],
        ["Utrecht", 8400621],
    ];

    trainStations.forEach((s, index) => {
        fetchStation(s[1]).then((jsonData) => {
            let departureElement = document.createElement('p');
            departureElement.textContent = `Op bezoek in ${s[0]}`;
            divs[index].appendChild(departureElement);
            let destinationElement = document.createElement('p');
            destinationElement.textContent = `Eindbestemming: ${jsonData}`;
            divs[index].appendChild(destinationElement);
        });
    });
});

