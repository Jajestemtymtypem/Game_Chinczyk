let pionki = [
    [0, 0, 0, 0],//red
    [0, 0, 0, 0],//blue
    [0, 0, 0, 0],//green
    [0, 0, 0, 0]//yellow
];
let ostatniWynikKostki = 0;
let wyniki = [0, 0, 0, 0];//red, blue, green, yellow 
let obecnyGracz = 0; // 0-red, 1-blue, 3-green, 4-yellow.
let licznikSzostek = 0; // zlicza liczbę wyrzuconych 6
const poleStartowe = [1, 11, 21, 31];


function rzutKostkaLosowo(){ 
    return Math.floor(Math.random() * 6) + 1;
}
function pionekKlikniety(pionekHTML){
    const gracz = parseInt(pionekHTML.dataset.player);
    const index = parseInt(pionekHTML.dataset.index);

    if( gracz !== obecnyGracz) return;

    const pionkiGracza = pionki[gracz];
    const pozycja = pionkiGracza[index];
    const nowaPozycja = pozycja + ostatniWynikKostki;

    if (czyPionekMozeSieRuszyc(pozycja, ostatniWynikKostki, pionkiGracza)){
        wykonajRuch(gracz, index, ostatniWynikKostki);
    }
}

// sprawdzić i przeanalizować tą funkcje. 
function przeniesPionek(gracz, index, pozycja) {
  // Znajdź odpowiedni pionek danego gracza
  const pionek = document.querySelector(`img[data-player='${gracz}'][data-index='${index}']`);

  // Znajdź pole planszy, do którego chcemy go przenieść
  const pole = document.getElementById(pozycja);
  if (pionek && pole) {
    const obrazki = pole.querySelectorAll("img");
    obrazki.forEach(img => img.remove());
  }

  // Jeśli oba istnieją — przenieś pionek na pole
  if (pionek && pole) {
    pole.appendChild(pionek);
  } else {
    console.warn("Nie znaleziono pionka lub pola:", pionek, pole);
  }
}



function czyPionekMozeSieRuszyc(pozycja, wynikKostki, pionkiGracza){
    const nowaPozycja = pozycja + wynikKostki;
    return(pozycja !== 0 && nowaPozycja <= 44 && !pionkiGracza.includes(nowaPozycja));
}
function rzutKostka() {
  const wynikKostki = rzutKostkaLosowo();
  ostatniWynikKostki = wynikKostki;
  document.getElementById("wynik").textContent = wynikKostki;

  const pionkiGracza = pionki[obecnyGracz];
  const poleStart = poleStartowe[obecnyGracz];

  // Czy można się ruszyć pionkiem z planszy?
  const mozeRuszyc = pionkiGracza.some(p => czyPionekMozeSieRuszyc(p, wynikKostki, pionkiGracza));
  // Czy można wyjść pionkiem z domku?
  const mozeWyjsc = pionkiGracza.includes(0) && !pionkiGracza.includes(poleStart);

  if (wynikKostki === 6) {
    licznikSzostek++;

    // Wszyscy w domku – automatycznie wyjdź
    if (pionkiGracza.every(p => p === 0)) {
      pionkiGracza[0] = poleStart;
      przeniesPionek(obecnyGracz, 0, poleStart);
      rzutKostkaLosowo();
      return;
    }

    // Jeśli można wyjść lub się ruszyć – czekamy na kliknięcie
    if (mozeWyjsc || mozeRuszyc) return;

    // Nie da się nic zrobić – zmiana gracza
    if (licznikSzostek >= 3) {
      nastepnyGracz();
      licznikSzostek = 0;
    }
  } else {
    if (mozeRuszyc) return;

    // Nie ma ruchu – przechodzimy dalej
    nastepnyGracz();
    licznikSzostek = 0;
  }

  zaktualizujTekstGracza();
}


function wykonajRuch(gracz, indexPionka, wynikKostki){
    const pionkiGracza = pionki[gracz];
    const staraPozycja = pionkiGracza[indexPionka];
    const nowaPozycja = staraPozycja + wynikKostki;

    //1. zbija przeciwnika jeżeli stoi na nowej pozycji.
    for (let i = 0; i < pionki.length; i++){
        if (i === gracz) continue; // pomija siebie.
        const pionkiPrzeciwnika = pionki[i];
        for (let j = 0; j < 4; j++){
            if (pionkiPrzeciwnika[j] === nowaPozycja){
                pionkiPrzeciwnika[j] = 0; // wraca do domku.
                console.log(`Gracz ${i} traci pionek ${j}`);
                break;
            }
        }
    }
    //2.Przenieś pionek na planszy.
    pionkiGracza[indexPionka] = nowaPozycja;
    przeniesPionek(gracz, indexPionka, nowaPozycja);

    //3. Dodaj do wyniku
    wyniki[gracz] += wynikKostki;
    if (wyniki[gracz] === 170){
        alert(`Gracz ${gracz} wygrał!!!`);
        return;
    }
    // 4. Przejście do kolejnego gracza
  if (wynikKostki !== 6) {
    nastepnyGracz();
    licznikSzostek = 0;
  }

  zaktualizujTekstGracza();
}

function nastepnyGracz() {
  obecnyGracz++;
  if (obecnyGracz > 3) obecnyGracz = 0;
}

function zaktualizujTekstGracza() {
  const player = ["Czerwony", "Niebieski", "Zielony", "Żółty"];
  document.getElementById("gracz").textContent = player[obecnyGracz];
}

