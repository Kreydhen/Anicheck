
/* CARRUSEL */

const btnLeft = document.querySelector(".btn-left"),
      btnRight = document.querySelector(".btn-right"),
      slider = document.querySelector("#slider"),
      sliderSection = document.querySelectorAll(".slider-section");


btnLeft.addEventListener("click", e => moveToLeft())
btnRight.addEventListener("click", e => moveToRight())

setInterval(() => {
    moveToRight()
}, 7000);


let operacion = 0,
    counter = 0,
    widthImg = 100 / sliderSection.length; //Es el tamaño de cada imagen (33.3%)

function moveToRight() {
    if (counter >= sliderSection.length-1) {
        counter = 0;
        operacion = 0;
        slider.style.transform = `translate(-${operacion}%)`;        
        return;
    } 
    counter++;
    operacion = operacion + widthImg;
    slider.style.transform = `translate(-${operacion}%)`;
    slider.style.transition = "all ease .6s" 
}  

function moveToLeft() {
    counter--;
    if (counter < 0 ) {
        counter = sliderSection.length-1;
        operacion = widthImg * (sliderSection.length-1)
        slider.style.transform = `translate(-${operacion}%)`;
        return;
    } 
    operacion = operacion - widthImg;
    slider.style.transform = `translate(-${operacion}%)`;
    slider.style.transition = "all ease .6s"
}   

/* SECCION DE ANIMES */

let currentPage = 1;  // Pagina inicial de la peticion
const perPage = 20;   // Numero de animes por pagina
let totalLoaded = 0;  // Contador de animes cargados
const maxAnimes = 50; // Limite maximo de animes a cargar pero siempre hace lo que quiere y carga 60 (por las peticiones cque son de a 20 creo)
let isFetching = false; // Controla si hay una peticion en curso para no mandar mas y mas xD


// Funcion para hacer la peticion a la API de AniList
async function fetchAnimes(page = 1, perPage = 10) {
  console.log("Cargando Pagina:", page); // Mira que pagina solicita (minimo 1 maximo la pag 10)

  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
          }
          coverImage {
            large
          }
          genres
        }
      }
    }
  `;

  const variables = {
    page: page,
    perPage: perPage
  };

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    if (!response.ok) {  //Para evitar que se rompa toda la pagina si la API
      throw new Error(`Error: ${response.status}`);
  }

    const json = await response.json();
    return json.data.Page.media; // Devuelve los datos del anime
  } catch (error) {
    console.error('Error fetching animes:', error);
    return [];
  }
}

// Funcion para mostrar los animes en la pagina (los contenedores)
function displayAnimes(animes) {
  const animeGrid = document.getElementById('anime-grid'); 

  let favorites = JSON.parse(localStorage.getItem('favorites')) || []; //Tengo los animes que estan en FAV en el LocalStorege
  
  // Agrega los nuevos animes al contenedor (sin limpiar los anteriores)
  animes.forEach(anime => { //Vamo' a iterar con animes en la API
    const animeCard = document.createElement('div');
    animeCard.classList.add('anime-card');

    let isFavorite = favorites.some(fav => fav.id === anime.id); //Verificacion de FAVS
    
    animeCard.innerHTML = ` 
      <img src="${anime.coverImage.large}" alt="${anime.title.romaji}">
      <h3>${anime.title.romaji}</h3>
      <p>Genres: ${anime.genres.join(', ')}</p>
      <i class='bx ${isFavorite ? "bxs-star" : "bx-star"} favorite-icon' data-id="${anime.id}"></i>
    `; //Uso "inner" porque chatgpt dice que es mas rapido que createElement si es algo simple
    
    animeGrid.appendChild(animeCard); //Grid es padre de CArd

    const favoriteIcon = animeCard.querySelector('.favorite-icon');
    favoriteIcon.addEventListener('click', () => toggleFavorite(anime, favoriteIcon)); //Cambia la estrellita
  });
}

function toggleFavorite(anime, icon) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const index = favorites.findIndex(fav => fav.id === anime.id);

  if (index !== -1) {
    // Si esta en favorito, lo saca
    favorites.splice(index, 1);  //.splice borra lo que hay en el array
    icon.classList.replace("bxs-star", "bx-star");
  } else {
    // Si no esta en favs, lo agrega izi
    favorites.push(anime); //.push Como dijo el mauro, el push te lo mete
    icon.classList.replace("bx-star", "bxs-star");
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Funcion para cargar los animes
async function loadAnimes(page = 1) {
  const animes = await fetchAnimes(page, perPage);  // Obtiene 'perPage' animes por página
  totalLoaded += animes.length; // Actualiza los animes cargados
  displayAnimes(animes);
}

// Cargar los animes de la primera pagina al cargar la pagina
document.addEventListener('DOMContentLoaded', () => {
  loadAnimes(currentPage);  // Cargar la primera pagina
});

// Scroll "infinito" con limite
window.addEventListener('scroll', async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isFetching) {
    if (totalLoaded >= maxAnimes) {
      console.log("Se alcanzó el límite de animes.");
      return;
    }

    isFetching = true; // Evita multiples llamadas mientras se cargan los datos
    currentPage++; // Incrementa la pagina
    console.log("Nueva página solicitada:", currentPage);

    const animes = await fetchAnimes(currentPage, perPage); // Agarra los nuevos anime de la nueva pagina
    totalLoaded += animes.length; // Actualiza el total de animes cargados (en este caso de a 20)
    displayAnimes(animes); // Muestra los nuevos animes
    isFetching = false; // Permite nuevas solicitudes
  }
});


/* FUNCION PARA GUARDAR LOS FAVORITOS */

function addToFavorites(anime) {
  // Obtener los favoritos que estan ahora en el Localstorafge
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  // Mira si el anime ya esta
  const isAlreadyFavorite = favorites.some(fav => fav.id === anime.id); //.some mira si algun anime coinciden ID para saber si esta o no esta

  if (!isAlreadyFavorite) {
    favorites.push(anime);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${anime.title.romaji} se ha añadido a favoritos.`);
  } else {
    alert(`${anime.title.romaji} ya está en favoritos.`);
  }
}