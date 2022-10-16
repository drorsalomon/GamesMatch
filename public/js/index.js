/* eslint-disable */
import * as config from './config';
import { signup, login, logout } from './registration';
import { forgotPassword, resetPassword, updatePassword } from './password';
import { updateSettings, deleteAccount } from './account';
import { filterGames } from './games';
import { getGameStats, getUserStats } from './stats';
import { startSurvey, nextQuestion, previousQuestion } from './survey';

if (config.Elements.signupForm)
  config.Elements.signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });

// Use this code only if the 'form' element exist on the page.
if (config.Elements.loginForm)
  config.Elements.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (config.Elements.forgotPasswordForm)
  config.Elements.forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgotPassword(email);
  });

if (config.Elements.resetPasswordForm)
  config.Elements.resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const token = document.getElementById('token').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    resetPassword(token, password, passwordConfirm);
  });

// Trigger logout function.
if (config.Elements.logoutBtn) config.Elements.logoutBtn.addEventListener('click', logout);

// Trigger user name and email update on the user account page.
if (config.Elements.updateUserDataForm)
  config.Elements.updateUserDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('.update__settings__btn').textContent = 'Updating...';

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });

// Trigger password update on the user account page.
if (config.Elements.updatePasswordForm)
  config.Elements.updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.update__password__btn').textContent = 'Updating...';

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    updatePassword(currentPassword, newPassword, confirmPassword);
  });

if (config.Elements.deleteAccountForm)
  config.Elements.deleteAccountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.delete__account__btn').textContent = 'Deleting...';
    deleteAccount();
  });

if (config.Elements.recGamesLink)
  config.Elements.recGamesLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const origin = 'account';
    localStorage.setItem(config.ORIGIN_KEY, JSON.stringify(origin));
    localStorage.setItem(config.QUERY_KEY, JSON.stringify(config.DEFAULT_QUERY));
    localStorage.setItem(config.SORT_KEY, JSON.stringify(config.DEFAULT_SORT));
    localStorage.setItem(config.TYPE_KEY, JSON.stringify(config.DEFAULT_TYPE));
    localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(config.DEFAULT_PAGE_NUM));
    localStorage.setItem(config.RES_PER_PAGE, JSON.stringify(config.DEFAULT_RES_PER_PAGE));
    localStorage.setItem(config.FILTER_KEY, config.DEFAULT_FILTER);

    filterGames(
      JSON.parse(localStorage.getItem(config.ORIGIN_KEY)),
      JSON.parse(localStorage.getItem(config.QUERY_KEY)),
      JSON.parse(localStorage.getItem(config.SORT_KEY)),
      JSON.parse(localStorage.getItem(config.TYPE_KEY)),
      JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)),
      JSON.parse(localStorage.getItem(config.RES_PER_PAGE)),
      localStorage.getItem(config.FILTER_KEY)
    );
  });

if (config.Elements.gameStatsLink)
  config.Elements.gameStatsLink.addEventListener('click', async (e) => {
    e.preventDefault();
    getGameStats();
  });

if (config.Elements.userStatsLink)
  config.Elements.userStatsLink.addEventListener('click', async (e) => {
    e.preventDefault();
    getUserStats();
  });

if (config.Elements.gameSearchForm)
  config.Elements.gameSearchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('userInput').value;
    localStorage.setItem(config.ORIGIN_KEY, JSON.stringify(config.DEFAULT_ORIGIN_KEY));
    localStorage.setItem(config.QUERY_KEY, JSON.stringify(query));
    localStorage.setItem(config.SORT_KEY, JSON.stringify(config.DEFAULT_SORT));
    localStorage.setItem(config.TYPE_KEY, JSON.stringify(config.DEFAULT_TYPE));
    localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(config.DEFAULT_PAGE_NUM));
    localStorage.setItem(config.RES_PER_PAGE, JSON.stringify(config.DEFAULT_RES_PER_PAGE));
    localStorage.setItem(config.FILTER_KEY, config.DEFAULT_FILTER);
    filterGames(
      JSON.parse(localStorage.getItem(config.ORIGIN_KEY)),
      JSON.parse(localStorage.getItem(config.QUERY_KEY)),
      JSON.parse(localStorage.getItem(config.SORT_KEY)),
      JSON.parse(localStorage.getItem(config.TYPE_KEY)),
      JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)),
      JSON.parse(localStorage.getItem(config.RES_PER_PAGE)),
      localStorage.getItem(config.FILTER_KEY)
    );
  });

if (config.Elements.searchOptionsBtn)
  config.Elements.searchOptionsBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const searchOptions = document.getElementById('searchOptions');
    if (searchOptions.style.display === '') {
      searchOptions.style.display = 'flex';
      if (config.Elements.searchOptionsBtn.classList.value === 'search__options__btn search__options__btn-rec') {
        config.Elements.searchOptionsBtn.style.backgroundColor = config.BG_COLOR_SECONDARY;
      } else {
        config.Elements.searchOptionsBtn.style.backgroundColor = config.BG_COLOR_PRIMARY;
      }
    } else {
      searchOptions.style.display = '';
      if (config.Elements.searchOptionsBtn.classList.value === 'search__options__btn search__options__btn-rec') {
        config.Elements.searchOptionsBtn.style.backgroundColor = config.BG_COLOR_PRIMARY;
      } else {
        config.Elements.searchOptionsBtn.style.backgroundColor = config.BG_COLOR_SECONDARY;
      }
    }
  });

if (config.Elements.sortDdBtn)
  config.Elements.sortDdBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const sortDisplay = document.getElementById('sortDropdown');
    const sortIconPath = document.querySelector('.search__sort__path');
    if (sortDisplay.style.display === '') {
      sortDisplay.style.display = 'flex';
      sortIconPath.attributes['d'].value = config.CHEVRON_UP_ICON_PATH;
    } else {
      sortDisplay.style.display = '';
      sortIconPath.attributes['d'].value = config.CHEVRON_DOWN_ICON_PATH;
    }

    config.Elements.sortBtn.forEach((el) => {
      if (
        el.dataset.sort === JSON.parse(localStorage.getItem(config.SORT_KEY)) &&
        parseInt(el.dataset.type) === JSON.parse(localStorage.getItem(config.TYPE_KEY))
      ) {
        el.style.backgroundColor = config.SELECTED_COLOR;
      }
    });
  });

if (config.Elements.sortBtn)
  config.Elements.sortBtn.forEach((el) => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      localStorage.setItem(config.SORT_KEY, JSON.stringify(el.dataset.sort));
      localStorage.setItem(config.TYPE_KEY, JSON.stringify(parseInt(el.dataset.type)));
      localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(config.DEFAULT_PAGE_NUM));
      filterGames(
        JSON.parse(localStorage.getItem(config.ORIGIN_KEY)),
        JSON.parse(localStorage.getItem(config.QUERY_KEY)),
        JSON.parse(localStorage.getItem(config.SORT_KEY)),
        JSON.parse(localStorage.getItem(config.TYPE_KEY)),
        JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)),
        JSON.parse(localStorage.getItem(config.RES_PER_PAGE)),
        localStorage.getItem(config.FILTER_KEY)
      );
    });
  });

if (config.Elements.limitDdBtn)
  config.Elements.limitDdBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const limitDisplay = document.getElementById('limitDropdown');
    const limitIconPath = document.querySelector('.search__limit__path');
    if (limitDisplay.style.display === '') {
      limitDisplay.style.display = 'flex';
      limitIconPath.attributes['d'].value = config.CHEVRON_UP_ICON_PATH;
    } else {
      limitDisplay.style.display = '';
      limitIconPath.attributes['d'].value = config.CHEVRON_DOWN_ICON_PATH;
    }

    config.Elements.limitBtn.forEach((el) => {
      if (parseInt(el.dataset.limit) === JSON.parse(localStorage.getItem(config.RES_PER_PAGE))) {
        el.style.backgroundColor = config.SELECTED_COLOR;
      }
    });
  });

if (config.Elements.limitBtn)
  config.Elements.limitBtn.forEach((el) => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(config.DEFAULT_PAGE_NUM));
      localStorage.setItem(config.RES_PER_PAGE, JSON.stringify(parseInt(el.dataset.limit), 10));

      filterGames(
        JSON.parse(localStorage.getItem(config.ORIGIN_KEY)),
        JSON.parse(localStorage.getItem(config.QUERY_KEY)),
        JSON.parse(localStorage.getItem(config.SORT_KEY)),
        JSON.parse(localStorage.getItem(config.TYPE_KEY)),
        JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)),
        JSON.parse(localStorage.getItem(config.RES_PER_PAGE)),
        localStorage.getItem(config.FILTER_KEY)
      );
    });
  });

if (config.Elements.filterDdBtn)
  config.Elements.filterDdBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const filterDisplay = document.getElementById('filterDropdown');
    const filterIconPath = document.querySelector('.search__filter__path');
    if (filterDisplay.style.display === '') {
      filterDisplay.style.display = 'flex';
      filterIconPath.attributes['d'].value = config.CHEVRON_UP_ICON_PATH;
    } else {
      filterDisplay.style.display = '';
      filterIconPath.attributes['d'].value = config.CHEVRON_DOWN_ICON_PATH;
    }

    config.Elements.filterBtn.forEach((el) => {
      if (el.dataset.filter === localStorage.getItem(config.FILTER_KEY)) {
        el.style.backgroundColor = config.SELECTED_COLOR;
      }
    });
  });

if (config.Elements.filterBtn)
  config.Elements.filterBtn.forEach((el) => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      localStorage.setItem(config.SORT_KEY, JSON.stringify(config.DEFAULT_SORT));
      localStorage.setItem(config.TYPE_KEY, JSON.stringify(config.DEFAULT_TYPE));
      localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(config.DEFAULT_PAGE_NUM));
      localStorage.setItem(config.RES_PER_PAGE, JSON.stringify(config.DEFAULT_RES_PER_PAGE));
      localStorage.setItem(config.FILTER_KEY, el.dataset.filter);

      filterGames(
        JSON.parse(localStorage.getItem(config.ORIGIN_KEY)),
        JSON.parse(localStorage.getItem(config.QUERY_KEY)),
        JSON.parse(localStorage.getItem(config.SORT_KEY)),
        JSON.parse(localStorage.getItem(config.TYPE_KEY)),
        JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)),
        JSON.parse(localStorage.getItem(config.RES_PER_PAGE)),
        localStorage.getItem(config.FILTER_KEY)
      );
    });
  });

if (config.Elements.pageBtn)
  config.Elements.pageBtn.forEach((el) => {
    if (parseInt(el.dataset.page) === JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY))) {
      el.style.backgroundColor = config.SELECTED_COLOR;
    }
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(parseInt(el.dataset.page)));

      filterGames(
        JSON.parse(localStorage.getItem(config.ORIGIN_KEY)),
        JSON.parse(localStorage.getItem(config.QUERY_KEY)),
        JSON.parse(localStorage.getItem(config.SORT_KEY)),
        JSON.parse(localStorage.getItem(config.TYPE_KEY)),
        JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)),
        JSON.parse(localStorage.getItem(config.RES_PER_PAGE)),
        localStorage.getItem(config.FILTER_KEY)
      );
    });
  });

if (config.Elements.paginationBtn[0] && config.Elements.paginationBtn[1]) {
  if (JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)) === config.DEFAULT_PAGE_NUM) {
    config.Elements.paginationBtn[0].classList.add('not-allowed');
    config.Elements.paginationBtn[0].firstElementChild.style.color = config.SELECTED_COLOR;

    config.Elements.paginationBtn[1].addEventListener('click', async (e) => {
      e.preventDefault();
      localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)) + 1));
      filterGames(
        JSON.parse(localStorage.getItem(config.ORIGIN_KEY)),
        JSON.parse(localStorage.getItem(config.QUERY_KEY)),
        JSON.parse(localStorage.getItem(config.SORT_KEY)),
        JSON.parse(localStorage.getItem(config.TYPE_KEY)),
        JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)),
        JSON.parse(localStorage.getItem(config.RES_PER_PAGE)),
        localStorage.getItem(config.FILTER_KEY)
      );
    });
  } else if (JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)) === parseInt(config.Elements.paginationBtn[1].dataset.lastpage)) {
    config.Elements.paginationBtn[1].classList.add('not-allowed');
    config.Elements.paginationBtn[1].firstElementChild.style.color = config.SELECTED_COLOR;

    config.Elements.paginationBtn[0].addEventListener('click', async (e) => {
      e.preventDefault();
      localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)) - 1));
      filterGames(
        JSON.parse(localStorage.getItem(config.ORIGIN_KEY)),
        JSON.parse(localStorage.getItem(config.QUERY_KEY)),
        JSON.parse(localStorage.getItem(config.SORT_KEY)),
        JSON.parse(localStorage.getItem(config.TYPE_KEY)),
        JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)),
        JSON.parse(localStorage.getItem(config.RES_PER_PAGE)),
        localStorage.getItem(config.FILTER_KEY)
      );
    });
  } else {
    config.Elements.paginationBtn.forEach((el) => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        if (el.dataset.lastpage) {
          localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)) + 1));
        } else {
          localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)) - 1));
        }
        filterGames(
          JSON.parse(localStorage.getItem(config.ORIGIN_KEY)),
          JSON.parse(localStorage.getItem(config.QUERY_KEY)),
          JSON.parse(localStorage.getItem(config.SORT_KEY)),
          JSON.parse(localStorage.getItem(config.TYPE_KEY)),
          JSON.parse(localStorage.getItem(config.PAGE_NUMBER_KEY)),
          JSON.parse(localStorage.getItem(config.RES_PER_PAGE)),
          localStorage.getItem(config.FILTER_KEY)
        );
      });
    });
  }
}

if (config.Elements.takeSurveyBtn)
  config.Elements.takeSurveyBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const origin = 'survey';
    localStorage.setItem(config.ORIGIN_KEY, JSON.stringify(origin));
    localStorage.setItem(config.QUERY_KEY, JSON.stringify(config.DEFAULT_QUERY));
    localStorage.setItem(config.SORT_KEY, JSON.stringify(config.DEFAULT_SORT));
    localStorage.setItem(config.TYPE_KEY, JSON.stringify(config.DEFAULT_TYPE));
    localStorage.setItem(config.PAGE_NUMBER_KEY, JSON.stringify(config.DEFAULT_PAGE_NUM));
    localStorage.setItem(config.RES_PER_PAGE, JSON.stringify(config.DEFAULT_RES_PER_PAGE));
    localStorage.setItem(config.FILTER_KEY, config.DEFAULT_FILTER);
    startSurvey(JSON.parse(localStorage.getItem(config.ORIGIN_KEY)));
  });

if (config.Elements.nextQuestionBtn)
  config.Elements.nextQuestionBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    let userInput;
    let questionNum = document.querySelector('.question__content-number').textContent;

    if (questionNum.startsWith('0')) {
      questionNum = questionNum.substring(1, 2);
    }

    const currentQuestionNum = parseInt(questionNum);
    const nextQuestionNum = parseInt(questionNum) + 1;

    const userInputArray = document.querySelectorAll('.userInput');

    userInputArray.forEach((el) => {
      if (el.checked) userInput = el.value;
    });

    nextQuestion(userInput, currentQuestionNum, nextQuestionNum, config.LAST_SURVEY_QUESTION);
  });

if (config.Elements.previousQuestionBtn)
  config.Elements.previousQuestionBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    let questionNum = document.querySelector('.question__content-number').textContent;

    if (questionNum.startsWith('0')) {
      questionNum = questionNum.substring(1, 2);
    }

    const previousQuestionNum = parseInt(questionNum) - 1;

    previousQuestion(previousQuestionNum);
  });
