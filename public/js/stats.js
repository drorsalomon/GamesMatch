import axios from 'axios';
import { showAlert } from './alerts';

export const getGameStats = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/games/getGameStats',
    });

    if (res.data.status === 'success') {
      location.assign(`/games/game-stats`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const getUserStats = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/users/getUserStats',
    });

    if (res.data.status === 'success') {
      location.assign(`/users/user-stats`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
