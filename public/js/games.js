import axios from 'axios';
import { showAlert } from './alerts';

export const filterGames = async (origin, query, sort, type, pageNumber, resPerPage, filter) => {
  if (query) {
    try {
      const res = await axios({
        method: 'POST',
        url: `/games/passQuery/${query}`,
        data: { origin, query, sort, type, pageNumber, resPerPage, filter },
      });

      if (res.data.status === 'success') {
        location.assign(`/games/search/${res.data.data.query}`);
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  } else {
    try {
      const res = await axios({
        method: 'POST',
        url: '/games/getGames',
        data: { origin, sort, type, pageNumber, resPerPage, filter },
      });

      if (res.data.status === 'success') {
        location.assign('/games/recommended-games');
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  }
};
