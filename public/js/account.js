import axios from 'axios';
import { showAlert } from './alerts';

// type is either password or data(name and email).
export const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/users/update-user-data',
      data,
    });

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        showAlert('success', `${type.toUpperCase()} updated successfully!`);
        document.querySelector('.update__settings__btn').textContent = 'Save Settings ';
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    document.querySelector('.update__settings__btn').textContent = 'Save Settings ';
  }
};

export const deleteAccount = async () => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: '/users/deleteMe',
    });

    if (res.data.status === 'success') {
      setTimeout(() => {
        showAlert('success', 'Account deleted successfully... Goodbye for now ✌️');
      }, 3000);
      window.setTimeout(() => {
        location.assign('/');
      }, 6000);
    }
  } catch (err) {
    document.querySelector('.delete__account__btn').textContent = 'Delete My Account';
    showAlert('error', err.response.data.message);
  }
};
