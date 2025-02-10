document.addEventListener('DOMContentLoaded', () => {  //DOMcontentloaded es para que cargue toda la pagina y pueda manipular las cosas con JS
    const favoritesGrid = document.getElementById('favorites-grid');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || []; //Si no hay favoritos es un array vacio
  
    if (favorites.length === 0) {
      favoritesGrid.innerHTML = '<p class=no-favorites">No tienes animes favoritos guardados.</p>';
    } else {
      favorites.forEach(anime => {
        const animeCard = document.createElement('div');
        animeCard.classList.add('anime-card');
        animeCard.setAttribute('data-id', anime.id); //La identifico a la carta dentro del HTML
        
        animeCard.innerHTML = `
          <img src="${anime.coverImage.large}" alt="${anime.title.romaji}">
          <h3>${anime.title.romaji}</h3>
          <p>Genres: ${anime.genres.join(', ')}</p>
          <i class='bx bxs-star favorite-icon' data-id="${anime.id}"></i> 
        `;
        
        favoritesGrid.appendChild(animeCard);
      });

      document.querySelectorAll('.favorite-icon').forEach(icon => {
        icon.addEventListener('click', (event) => {
          const animeId = parseInt(event.target.getAttribute('data-id'));
          removeFromFavorites(animeId);
        });
      });
    }
  });


function removeFromFavorites(animeId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  favorites = favorites.filter(anime => anime.id !== animeId); //Filtrar los anime con el ID correcto

  localStorage.setItem('favorites', JSON.stringify(favorites)); //.stringify Reemplaza los nuevos valores para eliminar los favoritos

  document.querySelector(`.anime-card[data-id="${animeId}"]`).remove(); //Elimina anime-card del HTML (elimina la tarjeta)

  if (favorites.length===0) {
    document.getElementById('favorites-grid').innerHTML = '<p class="no-favorites"> No tienes animes favoritos guardados</p>';
  }
}