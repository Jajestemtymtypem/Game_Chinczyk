let lastTap = 0;

document.addEventListener('touchend', function (e) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  if (tapLength < 300 && tapLength > 0) {
    e.preventDefault();
  }
  lastTap = currentTime;
});


let pionki = [
    [0, 0, 0, 0], //Czerwony
    [0, 0, 0, 0], //Niebieski
    [0, 0, 0, 0], //Zielony
    [0, 0, 0, 0]  //Żółty  
];
let wynik = [0, 0, 0, 0];
let obecnyGracz = 0;
let licznikSzostek = 0;
const poleStartowe = [1, 11, 21, 31];
let ostatniWynikKostki = 0;
const obrazki = [null, "icons/1.png", "icons/2.png", 
        "icons/3.png", "icons/4.png", "icons/5.png", "icons/6.png"];
const nazwaGracza = ["Czerwony", "Niebieski", "Zielony", "Żółty"];
const pionkiGracza = pionki[obecnyGracz];
let liczbaRzutowWTurze = 0;
let czyMoznaRzucic = true;
let czyRzutPoWyjsciu = false;

function czyPionekMozeSieRuszyc(pozycja, wynik, pionkiGracza) {
  if (pozycja === 0) return false; // pionek w domku

  const nowaPozycja = pozycja + wynik;

  // Jeśli na docelowym polu stoi własny pionek — blokada
  return !pionkiGracza.includes(nowaPozycja);
}



function pionekKlikniety(pionekHTML) {
  const gracz = parseInt(pionekHTML.dataset.player);
  const index = parseInt(pionekHTML.dataset.index);

  if (ostatniWynikKostki === 0) {
    console.log("Nie możesz się teraz ruszyć – musisz najpierw rzucić kostką");
    return;
  }

  if (czyRzutPoWyjsciu) {
    console.log("To rzut po wyjściu z domku – musisz najpierw rzucić kostką.");
    return;
  }

  if (gracz !== obecnyGracz) return;

  const pozycja = pionki[gracz][index];

  console.log(`Kliknięto pionek gracza ${gracz}, index ${index}`);
  console.log(`Pozycja pionka: ${pozycja}`);
  console.log(`Ruch o: ${ostatniWynikKostki}`);

  const nowaPozycja = pozycja + ostatniWynikKostki;

  if (czyPionekMozeSieRuszyc(pozycja, ostatniWynikKostki, pionki[gracz])) {
    przeniesPionek(gracz, index, nowaPozycja);
    console.log(`Gracz ${nazwaGracza[gracz]} przesuwa pionek ${index} z pola ${pozycja} na ${nowaPozycja}`);
  } else {
    console.log(`Pionek ${index} nie może się ruszyć z pozycji ${pozycja}`);
  }
}



function losowanieKostka(wynikKostki){
    const obrazKostki = document.querySelector(".dice");
    let i = 0;

    const interwal = setInterval(() => {
        const losowy = Math.floor(Math.random()*6) + 1;
        obrazKostki.src = `icons/${losowy}.png`;

        obrazKostki.classList.add('shake');
        setTimeout(() => {
        obrazKostki.classList.remove('shake');
        }, 300);

        i++;
        if (i >= 6) {
            clearInterval(interwal);
            obrazKostki.src = `icons/${wynikKostki}.png`;
        }
    }, 100);
}

function rzutKostkaLosowo(){ 
    return Math.floor(Math.random() * 6) + 1;
}
function rzutKostka() {
  if (!czyMoznaRzucic) {
    console.log(`Nie możesz rzucać kostką w tej chwili.`);
    return;
  }
    const wynikKostki = rzutKostkaLosowo();
    ostatniWynikKostki = wynikKostki;
    losowanieKostka(wynikKostki); // animacja + końcowy wynik
    setTimeout(() => {
    przetworzRzut(wynikKostki);
    }, 700);
}

//Krok3
function przetworzRzut(wynik) {
  const gracz = obecnyGracz;
  liczbaRzutowWTurze++;

  if (wynik === 6 && czyMoznaWyjscZDomku(gracz)) {
    wyjdzZDomku(gracz);
    czyRzutPoWyjsciu = true;
    czyMoznaRzucic = true;
    licznikSzostek++;
    ostatniWynikKostki = 0;
    console.log(`Gracz ${nazwaGracza[gracz]} wychodzi z domku - rzut ${licznikSzostek}/3`);
    return;
  }

  const mozliwyRuch = czyJestMozliwyRuch(gracz, wynik);

// 🔥 Najpierw obsłuż sytuację po wyjściu z domku
if (czyRzutPoWyjsciu) {
  if (!mozliwyRuch) {
    console.log(`Brak możliwego ruchu po wyjściu z domku – gracz ${nazwaGracza[gracz]} traci turę.`);
    czyRzutPoWyjsciu = false;
    licznikSzostek = 0;
    ostatniWynikKostki = 0;
    czyMoznaRzucic = true;
    nastepnyGracz();
    return;
  } else {
    // OK, można się ruszyć – zdejmujemy blokadę
    czyRzutPoWyjsciu = false;
  }
}

// Potem zwykła logika dla każdego innego rzutu
if (!mozliwyRuch) {
  licznikSzostek++;
  if (licznikSzostek < 3) {
    console.log(`Gracz ${nazwaGracza[gracz]} nie może się ruszyć - rzut ${licznikSzostek}/3`);
    return;
  } else {
    console.log(`Gracz ${nazwaGracza[gracz]} kończy turę`);
    licznikSzostek = 0;
    czyMoznaRzucic = true;
    nastepnyGracz();
    return;
  }
} else {
  licznikSzostek = 0;
  console.log(`Gracz ${nazwaGracza[gracz]} może ruszyć się o ${wynik}`);
  czyMoznaRzucic = false;
}

  if (czyRzutPoWyjsciu && !czyJestMozliwyRuch(gracz, wynik)) {
  console.log(`Brak możliwego ruchu po wyjściu z domku – koniec tury gracza ${nazwaGracza[gracz]}`);
  czyRzutPoWyjsciu = false;
  licznikSzostek = 0;
  ostatniWynikKostki = 0;
  czyMoznaRzucic = true;
  nastepnyGracz();
  return;
}

    if (czyRzutPoWyjsciu){
      console.log("Ro był dodatkowy rzut po wyjściu z domku.");
      czyRzutPoWyjsciu = false;
    }
    return;
  }

function przeniesPionek(gracz, index, nowaPozycja){
  const pionek = document.querySelector(`img[data-player="${gracz}"][data-index="${index}"]`);
  const cel = document.getElementById(nowaPozycja);
  if(!pionek || !cel) {
    console.warn("Nie znaleziono pionka lub pola docelowego");
    return;
  }

  // Sprawdź, czy ktoś już stoi na tym polu
  const pionekNaPolu = cel.querySelector("img[data-player]");
  if (pionekNaPolu) {
    const graczNaPolu = parseInt(pionekNaPolu.dataset.player);
    const indexNaPolu = parseInt(pionekNaPolu.dataset.index);

    if (graczNaPolu === gracz) {
      console.log(`Pole ${nowaPozycja} zajęte przez własny pionek. Ruch zablokowany.`);
      return;
    } else {
      // Bijemy przeciwnika
      console.log(`Gracz ${nazwaGracza[gracz]} bije pionek gracza ${nazwaGracza[graczNaPolu]} na polu ${nowaPozycja}`);
      pionki[graczNaPolu][indexNaPolu] = 0;
      const domek = document.querySelectorAll(".home")[graczNaPolu];
      domek.appendChild(pionekNaPolu);
      pionekNaPolu.classList.remove("active");
    }
  }

  // Przeniesienie pionka
  cel.appendChild(pionek);
  pionek.classList.add("active");
  pionki[gracz][index] = nowaPozycja;

  console.log(`Gracz ${nazwaGracza[gracz]} przesuwa pionek ${index} na pole ${nowaPozycja}`);

  sprawdzWygrana(gracz);

  // Sprawdzamy: czy była szóstka?
  if (ostatniWynikKostki === 6 && licznikSzostek < 2) {
    licznikSzostek++;
    console.log(`Szóstka! Gracz ${nazwaGracza[gracz]} rzuca ponownie.`);
    czyMoznaRzucic = true;
    ostatniWynikKostki = 0;
    return;
  }

  // Koniec tury
  ostatniWynikKostki = 0;
  licznikSzostek = 0;
  czyMoznaRzucic = true;
  nastepnyGracz();
}


function nastepnyGracz(){
  obecnyGracz++
  if (obecnyGracz > 3) obecnyGracz = 0;
  document.getElementById("informations").textContent = `Kolor aktualnego gracza: ${nazwaGracza[obecnyGracz]}`;
}

function czyJestMozliwyRuch(gracz, wynik){
  const pozycje = pionki[gracz];
  const start = poleStartowe[gracz];
  const maPionekWDomku = pozycje.some(p=> p === 0);
  const poleStartoweZajete = pozycje.includes(start);

  if (wynik === 6 && maPionekWDomku && !poleStartoweZajete) {
    return true;
  }

  for (let i = 0; i<4; i++){
    const poz = pozycje[i];
    if (poz >= 1) {
      const nowaPozycja = poz + wynik;
    if (!pozycje.includes(nowaPozycja)){
      return true;
      }
    }
  }
  return false; // nie można wykonać żadnego ruchu.
}

function czyMoznaWyjscZDomku(gracz){
  const pozycja = pionki[gracz];
  const start = poleStartowe[gracz];

  const maWDomku = pozycja.some( p => p === 0);
  const startZajety = pozycja.includes(start);
  return maWDomku && !startZajety;
}

function wyjdzZDomku(gracz){
  const start = poleStartowe[gracz];
  const pozycje = pionki[gracz];

  for( let i = 0; i < 4; i++){
    if(pozycje[i] === 0) {
      const pionek = document.querySelector(`img[data-player="${gracz}"][data-index="${i}"]`);
      const pole = document.getElementById(start);
      if(pionek && pole) {
        pole.appendChild(pionek);
        pionek.classList.add("active");
        pionki[gracz][i] = start;
        console.log(`Gracz ${nazwaGracza[gracz]} wyprowadził pionek nr ${i} na pole ${start}`);
        console.log("Pozycje gracza po wyjściu:", pionki[gracz]);
        pionek.addEventListener("click", () => pionekKlikniety(pionek));
      }
      
      return;
    }
  }
}

function sprawdzWygrana(gracz) {
  const suma = pionki[gracz].reduce((a, b) => a + b, 0);
  const wymaganeSumy = [170, 410, 810, 1210];

  if (suma === wymaganeSumy[gracz]) {
    alert(`🎉 Gracz ${nazwaGracza[gracz]} WYGRYWA!`);
    czyMoznaRzucic = false;
  }
}




document.querySelectorAll(`img[data-player]`).forEach(pionek => {
  pionek.addEventListener(`click`, () => pionekKlikniety(pionek));
})