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
const domekStartowy = {
  0: 41,
  1: 101,
  2: 201,
  3: 301
};
const poleZakretu = {
  0: 40,
  1: 10,
  2: 20,
  3: 30
};
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
  if (pozycja === 0) return false;

  let nowaPozycja = pozycja + wynik;
  if (nowaPozycja > 40) nowaPozycja %= 40;

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

  let nowaPozycja = pozycja + ostatniWynikKostki;

  if (pozycja <= poleZakretu[gracz] && nowaPozycja > poleZakretu[gracz]) {
    // Wchodzi do domku końcowego
    const indeksWDomku = nowaPozycja - poleZakretu[gracz];
    nowaPozycja = domekStartowy[gracz] + (indeksWDomku - 1); // np. 41 + 0
  }


  if (czyPionekMozeSieRuszyc(pozycja, ostatniWynikKostki, pionki[gracz])) {
  przeniesPionek(gracz, index, pozycja);
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
function przeniesPionek(gracz, index, pozycja) {
  const zakret = poleZakretu[gracz];
  const domekStart = domekStartowy[gracz];

  // 1. Jeśli pionek jest już w domku końcowym, nie może się ruszyć
  if (pozycja >= domekStart && pozycja <= domekStart + 3) {
    console.log("Pionek jest już w domku końcowym – nie może się ruszyć dalej.");
    return;
  }

  // 2. Oblicz docelową pozycję
  let nowaPozycja;
  if (pozycja <= zakret && pozycja + ostatniWynikKostki > zakret) {
    // Wejście do domku końcowego
    const offset = pozycja + ostatniWynikKostki - zakret;
    nowaPozycja = domekStart + offset - 1;
  } else {
    // Normalny ruch po planszy głównej
    nowaPozycja = pozycja + ostatniWynikKostki;
    if (nowaPozycja > 40) nowaPozycja -= 40;
  }

  // 3. Znajdź pionek i pole docelowe
  const pionek = document.querySelector(`img[data-player="${gracz}"][data-index="${index}"]`);
  const cel = document.getElementById(nowaPozycja);
  if (!pionek || !cel) {
    console.warn("Nie znaleziono pionka lub pola docelowego");
    return;
  }

  // 4. Sprawdź, czy na polu docelowym ktoś stoi
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
      const domek = document.getElementById(`home-${graczNaPolu}`);
      domek.appendChild(pionekNaPolu);
      pionekNaPolu.classList.remove("active");
    }
  }

  // 5. Przenieś pionek
  cel.appendChild(pionek);
  pionek.classList.add("active");
  pionki[gracz][index] = nowaPozycja;

  console.log(`Gracz ${nazwaGracza[gracz]} przesuwa pionek ${index} na pole ${nowaPozycja}`);

  sprawdzWygrana(gracz);

  // 6. Obsługa szóstki – dodatkowy rzut
  if (ostatniWynikKostki === 6) {
    licznikSzostek++;
    if (licznikSzostek < 3) {
      console.log(`Szóstka! Gracz ${nazwaGracza[gracz]} rzuca ponownie.`);
      ostatniWynikKostki = 0;
      czyMoznaRzucic = true;
      czyRzutPoWyjsciu = false;
      return;
    } else {
      console.log(`3 szóstki z rzędu – tura gracza ${nazwaGracza[gracz]} kończy się.`);
    }
  }

  // 7. Reset stanu po ruchu i zmiana gracza
  licznikSzostek = 0;
  ostatniWynikKostki = 0;
  czyMoznaRzucic = true;
  czyRzutPoWyjsciu = false;
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

function wyjdzZDomku(gracz) {
  const start = poleStartowe[gracz];
  const pozycje = pionki[gracz];

  for (let i = 0; i < 4; i++) {
    if (pozycje[i] === 0) {
      const pionek = document.querySelector(`img[data-player="${gracz}"][data-index="${i}"]`);
      const pole = document.getElementById(start);

      if (pionek && pole) {
        // Sprawdź, czy na polu startowym stoi pionek przeciwnika
        const pionekNaPolu = pole.querySelector("img[data-player]");
        if (pionekNaPolu) {
          const graczNaPolu = parseInt(pionekNaPolu.dataset.player);
          const indexNaPolu = parseInt(pionekNaPolu.dataset.index);

          if (graczNaPolu === gracz) {
            // Stoi własny pionek → nie można wyjść
            console.log("Nie możesz wyjść, bo pole startowe jest zajęte przez Twój pionek.");
            return;
          } else {
            // Stoi przeciwnik → bijemy
            console.log(`Gracz ${nazwaGracza[gracz]} bije pionek gracza ${nazwaGracza[graczNaPolu]} przy wyjściu z domku.`);

            const domekPrzeciwnika = document.getElementById(`home-${graczNaPolu}`);
            domekPrzeciwnika.appendChild(pionekNaPolu);
            pionekNaPolu.classList.remove("active");
            pionki[graczNaPolu][indexNaPolu] = 0;
          }
        }

        // Wyprowadź pionek
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
  const koncowe = {
    0: [41, 42, 43, 44],
    1: [101, 102, 103, 104],
    2: [201, 202, 203, 204],
    3: [301, 302, 303, 304]
  };

  const graczowe = pionki[gracz].slice().sort((a, b) => a - b);
  const docelowe = koncowe[gracz].slice().sort((a, b) => a - b);

  const wygral = graczowe.every(p => docelowe.includes(p));
  if (wygral) {
    alert(`🎉 Gracz ${nazwaGracza[gracz]} WYGRYWA!`);
    czyMoznaRzucic = false;
  }
}





document.querySelectorAll(`img[data-player]`).forEach(pionek => {
  pionek.addEventListener(`click`, () => pionekKlikniety(pionek));
})