import axios from 'axios';
import { showAlert } from './alerts';
import { renderSpinner } from './spinner';

export const startSurvey = async (origin) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/survey/startSurvey',
      data: { origin },
    });

    if (res.data.status === 'success') {
      location.assign(`/survey/runSurvey/${res.data.data.slug}`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const nextQuestion = async (userInput, currentQuestionNum, nextQuestionNum, lastSurveyQuestion) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/survey/nextQuestion',
      data: {
        userInput,
        currentQuestionNum,
        nextQuestionNum,
      },
    });

    if (res.data.status === 'success' && currentQuestionNum !== lastSurveyQuestion) {
      location.assign(`/survey/runSurvey/${res.data.data.slug}`);
    } else {
      renderSpinner('matching games...');
      calcResults();
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const previousQuestion = async (previousQuestionNum) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/survey/previousQuestion',
      data: {
        previousQuestionNum,
      },
    });

    if (res.data.status === 'success') {
      location.assign(`/survey/runSurvey/${res.data.data.slug}`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const calcResults = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/survey/calcResults',
    });

    if (res.data.status === 'success') {
      location.assign('/games/recommended-games');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
