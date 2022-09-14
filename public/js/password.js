import axios from 'axios';
import { showAlert } from './alerts';

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/users/forgotPassword',
      data: {
        email,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Password reset link successfully sent to the specified email');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const resetPassword = async (token, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/users/resetPassword',
      data: {
        token,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Password changed successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/users/updatePassword',
      data: {
        currentPassword,
        newPassword,
        confirmPassword,
      },
    });
    if (res.data.status === 'success') {
      window.setTimeout(() => {
        showAlert('success', 'Password updated successfully!');
        document.querySelector('.update__password__btn').textContent = 'Update password';
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    document.querySelector('.update__password__btn').textContent = 'Update password';
  }
};
