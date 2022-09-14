export const Elements = {
  // Registration + Account
  signupForm: document.querySelector('.form--signup'),
  loginForm: document.querySelector('.form--login'),
  forgotPasswordForm: document.querySelector('.form--forgot__password'),
  resetPasswordForm: document.querySelector('.form--reset__password'),
  updateUserDataForm: document.querySelector('.form--update__user__data'),
  updatePasswordForm: document.querySelector('.form--update__password'),
  deleteAccountForm: document.querySelector('.form--delete__account'),
  logoutBtn: document.querySelector('.nav__el--logout'),

  // Stats
  gameStatsLink: document.querySelector('.account__nav-link-game'),
  userStatsLink: document.querySelector('.account__nav-link-user'),

  // Survey
  takeSurveyBtn: document.querySelector('.take__survey--btn '),
  nextQuestionBtn: document.querySelector('.question__next'),
  previousQuestionBtn: document.querySelector('.question__back'),

  // Search + Rec games
  searchOptionsBtn: document.querySelector('.search__options__btn'),
  recGamesLink: document.querySelector('.account__nav-link-rec '),
  gameSearchForm: document.querySelector('.game__search-form'),
  sortDdBtn: document.querySelector('.sort__dropdown__btn'),
  limitDdBtn: document.querySelector('.limit__dropdown__btn'),
  filterDdBtn: document.querySelector('.filter__dropdown__btn'),
  sortBtn: document.querySelectorAll('.sort__btn'),
  limitBtn: document.querySelectorAll('.limit__btn'),
  filterBtn: document.querySelectorAll('.filter__btn'),
  pageBtn: document.querySelectorAll('.pagination__page'),
  paginationBtn: document.querySelectorAll('.pagination__btn'),
};

export const LAST_SURVEY_QUESTION = 50;

export const ORIGIN_KEY = 'origin';
export const QUERY_KEY = 'query';
export const SORT_KEY = 'sort';
export const TYPE_KEY = 'type';
export const PAGE_NUMBER_KEY = 'pageNumber';
export const RES_PER_PAGE = 'resPerPage';
export const FILTER_KEY = 'filter';

export const DEFAULT_ORIGIN_KEY = 'search';
export const DEFAULT_QUERY = null;
export const DEFAULT_SORT = 'name';
export const DEFAULT_TYPE = 1;
export const DEFAULT_PAGE_NUM = 1;
export const DEFAULT_RES_PER_PAGE = 10;
export const DEFAULT_FILTER = '';

export const BG_COLOR_PRIMARY = '#444';
export const BG_COLOR_SECONDARY = '#f9f9f9';
export const SELECTED_COLOR = '#e9e8e8';
export const CHEVRON_DOWN_ICON_PATH = 'M19 9l-7 7-7-7';
export const CHEVRON_UP_ICON_PATH = 'M5 15l7-7 7 7';
