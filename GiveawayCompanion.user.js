// ==UserScript==
// @name Giveaway Companion
// @description Saves your time on games giveaway sites
// @description:ru Экономит ваше время на сайтах с раздачами игр
// @author longnull
// @namespace longnull
// @version 1.7.4
// @homepage https://github.com/longnull/GiveawayCompanion
// @supportURL https://github.com/longnull/GiveawayCompanion/issues
// @updateURL https://raw.githubusercontent.com/longnull/GiveawayCompanion/master/GiveawayCompanion.user.js
// @downloadURL https://raw.githubusercontent.com/longnull/GiveawayCompanion/master/GiveawayCompanion.user.js
// @match *://*.grabfreegame.com/giveaway/*
// @match *://*.bananatic.com/*/giveaway/*
// @match *://*.gamingimpact.com/giveaway/*
// @match *://*.whosgamingnow.net/giveaway/*
// @match *://*.gamehag.com/*
// @match *://*.gleam.io/*/*
// @match *://*.chubkeys.com/giveaway/*
// @match *://*.giveaway.su/giveaway/view/*
// @match *://*.keyjoker.com/*
// @match *://*.key-hub.eu/giveaway/*
// @match *://*.givee.club/*/event/*
// @match *://*.opquests.com/*
// @match *://*.key.gift/*
// @connect steamcommunity.com
// @connect grabfreegame.com
// @connect bananatic.com
// @connect gamingimpact.com
// @connect *
// @grant GM_setValue
// @grant GM.setValue
// @grant GM_getValue
// @grant GM.getValue
// @grant GM_xmlhttpRequest
// @grant GM.xmlHttpRequest
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js
// ==/UserScript==

(async () => {
  'use strict';

  const version = {
    string: '1.7.4',
    changes: {
      default:
        `<ul>
          <li>Givee.club: added support for "follow a game" tasks</li>
        </ul>`,
      ru:
        `<ul>
          <li>Givee.club: добавлена поддержка заданий "подписаться на игру"</li>
        </ul>`
    }
  };

  const config = {
    // Output debug info into console (false - disabled, true - enabled)
    // Выводить отладочную информацию в консоль (false - выключено, true - включено)
    debug: false,
    // Features related to Steam groups (false - disabled, true - enabled)
    // Функционал связанный с группами Steam (false - выключено, true - включено)
    steamGroups: true,
    // Features related to Steam wishlist (false - disabled, true - enabled)
    // Функционал связанный со списком желаемого Steam (false - выключено, true - включено)
    steamAppWishlist: true,
    // Features related to application following in Steam (false - disabled, true - enabled)
    // Функционал связанный с подпиской на приложения в Steam (false - выключено, true - включено)
    steamAppFollow: true,
    // Features related to adding an application to Steam library (false - disabled, true - enabled)
    // Функционал связанный с добавлением приложения в библиотеку Steam (false - выключено, true - включено)
    steamAppAddToLibrary: true,
    // Size of the buttons (pixels)
    // Размер кнопок (пиксели)
    buttonsSize: 40,
    notifications: {
      // Maximum number of notifications
      // Максимальное количество уведомлений
      maxCount: 5,
      // Newest notifications on top (false - disabled, true - enabled)
      // Новые уведомления вверху (false - выключено, true - включено)
      newestOnTop: false,
      // Notifications width (pixels)
      // Ширина уведомлений (пиксели)
      width: 400,
      // How long the notification will display without user interaction (milliseconds, 0 - infinite, can be overridden)
      // Как долго будет отображаться уведомление без пользовательского взаимодействия (миллисекунды, 0 - бесконечно, может быть переопределено)
      timeout: 10000,
      // How long the notification will display after the user moves the mouse out of timed out notification (milliseconds)
      // Как долго будет отображаться "просроченное" уведомление после того, как пользователь убрал курсор (миллисекунды)
      extendedTimeout: 3000,
      // Close notification on click (can be overridden)
      // Закрывать уведомление по клику (может быть переопределено)
      closeOnClick: false
    },
    // Sites settings
    // Настройки сайтов
    sitesConfig: {
      // Settings for Gleam
      // Настройки для Gleam
      gleam: {
        // Completion of tasks that require input from the user
        // Выполнение заданий, требующих ввода от пользователя
        answerQuestions: {
          // false - disabled, true - enabled
          // false - выключено, true - включено
          enabled: false,
          // Text
          // Текст
          answer: 'Yes'
        },
        // Completion of tasks that require a correct answer from the user (client-side verification)
        // Выполнение заданий, требующих правильного ответа от пользователя (проверка на стороне клиента)
        answerQuestionsWithCheck: {
          // false - disabled, true - enabled
          // false - выключено, true - включено
          enabled: false
        },
        // Fill in username in Twitter tasks
        // Заполнить имя пользователя в Twitter заданиях
        twitterSetUsername: {
          // false - disabled, true - enabled
          // false - выключено, true - включено
          enabled: false,
          // Username (if empty, the script will take the username from the email)
          // Имя (если пусто, то скрипт возьмёт имя из email)
          username: ''
        },
        // Fill in username in TikTok tasks
        // Заполнить имя пользователя в TikTok заданиях
        tiktokSetUsername: {
          // false - disabled, true - enabled
          // false - выключено, true - включено
          enabled: false,
          // Username (if empty, the script will take the username from the email)
          // Имя (если пусто, то скрипт возьмёт имя из email)
          username: ''
        },
      }
    },
    sites: [
      {
        host: ['grabfreegame.com', 'bananatic.com', 'gamingimpact.com'],
        element: 'a[href*="logout"]',
        steamKeys: '.code:visible',
        conditions: [
          {
            element: '.tasks li:has(.banicon-steam2)',
            steamGroups() {
              const tasks = $J('.tasks li:has(.banicon-steam2) .buttons button:first-child');
              const groups = [];

              for (const task of tasks) {
                const val = $J(task).attr('onclick');

                if (val) {
                  const url = val.match(/'(.+)'/);

                  if (url) {
                    groups.push(url[1]);
                  }
                }
              }

              return groups;
            }
          },
          {
            element: '.tasks li:not(:has(.completed)):not(:has(.banicon-twitter)):not(.tasks li:has(.banicon-youtube):not(:has([data-ytid])))',
            buttons: [
              {
                type: 'tasks',
                cancellable: true,
                click(params) {
                  const tasks = $J(params.self.element);

                  log.debug(`tasks found : ${tasks.length}`);

                  if (tasks.length) {
                    return new Promise(async (resolve) => {
                      let done = 0;

                      for (let i = 0; i < tasks.length; i++) {
                        if (params.cancelled) {
                          log.debug('cancelled');

                          break;
                        }

                        const buttons = $J(tasks.get(i)).find('.buttons button');

                        if (buttons.length < 2) {
                          continue;
                        }

                        if (!$J(buttons.get(0)).attr('data-ytid')) {
                          const val = $J(buttons.get(0)).attr('onclick');

                          if (val) {
                            let url = val.match(/'(.+)'/);

                            if (!url) {
                              log.debug(`${i + 1} : cannot extract url : ${val}`);

                              continue;
                            }

                            url = url[1];

                            log.debug(`${i + 1} : making action request to ${url}`);

                            try {
                              await $J.get(url);
                            } catch (e) {}
                          }
                        }

                        const val = $J(buttons.get(1)).attr('onclick');
                        if (val) {
                          let url = val.match(/'(.+)'/);

                          if (!url) {
                            log.debug(`${i + 1} : cannot extract url : ${val}`);

                            continue;
                          }

                          url = url[1];

                          log.debug(`${i + 1} : making verify request to ${url}`);

                          try {
                            await $J.get(url);
                          } catch (e) {}
                        }

                        params.button.progress(tasks.length, i + 1);

                        done++;

                        log.debug(`${i + 1} : done`);
                      }

                      if (done) {
                        notifications.success(i18n.get('reload-to-see-changes'), {timeout: 0});
                      }

                      resolve();
                    });
                  }
                }
              }
            ]
          }
        ]
      },
      {
        host: 'whosgamingnow.net',
        element: 'a[href*="logout"]',
        steamKeys: '.SteamKey:visible',
        steamGroups: '.action[href*="steamcommunity.com/groups/"]',
        conditions: [
          {
            element: '.action:not(:has(.fa-check-square-o))',
            buttons: [
              {
                type: 'tasks',
                click(params) {
                  const tasks = unsafeWindow.$(params.self.element);

                  log.debug(`tasks found : ${tasks.length}`);

                  tasks.trigger('click');
                }
              }
            ]
          }
        ]
      },
      {
        host: 'gamehag.com',
        console: true,
        element: '!#login-tools',
        steamKeys: '.response-key .code-text:visible',
        conditions: [
          {
            path: /\/giveaway\//,
            steamKeys: '.giveaway-key input:visible%val',
            steamGroups() {
              const groups = [];

              $J('.single-giveaway-task').each((i, el) => {
                const href = $J(el).find('.task-icon use').attr('xlink:href');

                if (href && href.includes('nc-logo-steam')) {
                  const url = $J(el).find('.task-actions a').attr('href');

                  if (url) {
                    groups.push(url);
                  }
                }
              });

              return groups;
            },
            conditions: [
              {
                elementAnd: ['.single-giveaway-task:has(.notdone):has(.task-actions a):has(.task-actions button),.single-giveaway-task:has(.notdone):has(.task-actions .giveaway-survey)', '!.giveaway-content .alert-danger:visible', '!.giveaway-key input:visible'],
                buttons: [
                  {
                    type: 'tasks',
                    cancellable: true,
                    click(params) {
                      const tasks = $J(params.self.elementAnd[0]);

                      log.debug(`tasks found : ${tasks.length}`);

                      if (tasks.length) {
                        return new Promise((resolve) => {
                          const completeTask = async (el) => {
                            const task = $J(el);
                            const action = task.find('.task-actions a');
                            const verify = task.find('.task-actions button');

                            if (action.length && verify.length) {
                              let href = action.attr('href');

                              log.debug(`${i + 1} : completeTask() : making action request : ${href}`);

                              try {
                                let response = await $J.get(href);
                                let lnk = $J(response.content).find('.game-list .col:not(:first-child) .game-tile .actions .btn-primary');

                                if (lnk.length) {
                                  href = lnk.attr('href');

                                  log.debug(`${i + 1} : completeTask() : it looks like a "play game" task, making "/play" request : ${href}`);

                                  response = await $J.get(href);

                                  log.debug(`${i + 1} : completeTask() : "/play" request done`);

                                  lnk = $J(response).find('#single-game-play');

                                  if (lnk.length) {
                                    href = lnk.attr('href');

                                    log.debug(`${i + 1} : completeTask() : making "/redirect" request : ${href}`);

                                    await $J.get(href);

                                    log.debug(`${i + 1} : completeTask() : "/redirect" request done`);
                                  }
                                }
                              } catch (e) {}

                              log.debug(`${i + 1} : completeTask() : clicking verify button...`);

                              verify.trigger('click');
                            } else {
                              const survey = task.find('.task-actions .giveaway-survey');

                              if (survey.length) {
                                const id = survey.attr('data-task_id');

                                if (id) {
                                  log.debug(`${i + 1} : completeTask() : survey task : ${id}`);

                                  unsafeWindow.currentSurveyId = id;
                                  unsafeWindow.giveawaySurvCompleted();
                                }
                              }
                            }
                          };

                          let i = 0;

                          const ajaxComplete = (e, xhr, settings) => {
                            if (settings.url.includes('/giveaway/sendtask')) {
                              log.debug(`${i + 1} : ajaxComplete() : /giveaway/sendtask`);

                              i++;
                              params.button.progress(tasks.length, i);

                              if (i >= tasks.length) {
                                log.debug('all tasks done');

                                unsafeWindow.$(document).unbind('ajaxComplete', ajaxComplete);
                                return resolve();
                              }

                              if (params.cancelled) {
                                log.debug('cancelled');

                                unsafeWindow.$(document).unbind('ajaxComplete', ajaxComplete);
                                return resolve();
                              }

                              completeTask(tasks.get(i));
                            }
                          };

                          unsafeWindow.$(document).ajaxComplete(ajaxComplete);

                          completeTask(tasks.get(i));
                        });
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        host: 'gleam.io',
        check(params) {
          const container = $J('.popup-blocks-container');

          if (!container.length) {
            return false;
          }

          params.self._gleam = unsafeWindow.angular.element(container.get(0)).scope();
          return !!params.self._gleam;
        },
        ready(params) {
          for (const entry of params.self._gleam.entry_methods) {
            if (params.self._gleam.isTimerAction(entry)) {
              entry.timePassed = true;
            }
          }
        },
        steamKeys(params) {
          return params.self._gleam.bestCouponCode();
        },
        steamGroups(params) {
          const groups = [];

          for (const entry of params.self._gleam.entry_methods) {
            if (entry.entry_type === 'steam_join_group') {
              groups.push(entry.config3);
            }
          }

          return groups;
        },
        conditions: [
          {
            getEntries(params) {
              return $J('.entry-method:visible:not(.completed-entry-method)').filter((i, e) => {
                const scope = unsafeWindow.angular.element(e).scope();

                return scope &&
                  params.site._gleam.canEnter(scope.entry_method) &&
                  !params.site._gleam.isEntered(scope.entry_method) &&
                  params.site._gleam.enoughUserDetails(scope.entry_method) &&
                  (/(custom_action|_view|_visit|blog_comment|twitter_tweet|twitter_retweet|twitter_follow|tiktok_visit|tiktok_follow)/.test(scope.entry_method.entry_type) || (
                    params.site._gleam.enoughEntryDetails(scope.entry_method) &&
                    (!scope.entry_method.requires_authentication || params.site._gleam.isAuthenticated(scope.entry_method, scope.entry_method.provider))
                  ));
              });
            },
            check(params) {
              return params.site._gleam.contestantState.contestant.id &&
                !params.site._gleam.bestCouponCode() &&
                params.self.getEntries(params).length;
            },
            buttons: [
              {
                type: 'tasks',
                cancellable: true,
                click(params) {
                  const tasks = params.self.getEntries(params);

                  log.debug(`tasks found : ${tasks.length}`);

                  if (tasks.length) {
                    return new Promise(async (resolve) => {
                      const emailName = params.site._gleam.contestantState.contestant.email.match(/[^@]+/)[0].replace(/[\.\+]/g, '_').slice(-15);

                      for (let i = 0; i < tasks.length; i++) {
                        if (params.cancelled) {
                          log.debug('cancelled');

                          return resolve();
                        }
                        if (params.site._gleam.bestCouponCode()) {
                          log.debug('key is available');

                          return resolve();
                        }

                        const scope = unsafeWindow.angular.element(tasks[i]).scope();

                        try {
                          if (/(custom_action|_view|_visit|blog_comment|tiktok_visit|tiktok_follow)/.test(scope.entry_method.entry_type)) {
                            log.debug(`${i + 1} : visit :`, scope.entry_method.action_description);

                            params.site._gleam.triggerVisit(scope.entry_method);

                            await utils.sleep(300);
                          }

                          if ((scope.entry_method.entry_type === 'custom_action' && /(Ask a question|Allow question or tracking)/.test(scope.entry_method.method_type)) ||
                              scope.entry_method.entry_type === 'blog_comment' || scope.entry_method.config3 === 'Question' || scope.entry_method.config5 === 'Question'
                          ) {
                            let answer;

                            if (scope.entry_method.config5 === '1') {
                              if (config.sitesConfig.gleam.answerQuestionsWithCheck.enabled) {
                                answer = decodeURIComponent(atob(scope.entry_method.config8).replace(/\+/g, ' ')).split(/\r|\n/).find((v) => !!v);
                              }
                            } else if (config.sitesConfig.gleam.answerQuestions.enabled && config.sitesConfig.gleam.answerQuestions.answer) {
                              answer = config.sitesConfig.gleam.answerQuestions.answer;
                            }

                            if (answer) {
                              log.debug(`${i + 1} : details :`, answer, ':', scope.entry_method.action_description);

                              params.site._gleam.entryDetailsState[scope.entry_method.id] = answer;
                              params.site._gleam.entryState.formData[scope.entry_method.id] = answer;
                            }
                          }

                          if (scope.entry_method.entry_type === 'tiktok_follow' && config.sitesConfig.gleam.tiktokSetUsername.enabled &&
                            !params.site._gleam.entryState.formData[scope.entry_method.id]
                          ) {
                            const tiktokName = config.sitesConfig.gleam.tiktokSetUsername.username ? config.sitesConfig.gleam.tiktokSetUsername.username : emailName;

                            log.debug(`${i + 1} : tiktok username :`, tiktokName, ':', scope.entry_method.action_description);

                            params.site._gleam.entryDetailsState[scope.entry_method.id] = tiktokName;
                            params.site._gleam.entryState.formData[scope.entry_method.id] = tiktokName;
                          }

                          if (/(twitter_tweet|twitter_retweet|twitter_follow)/.test(scope.entry_method.entry_type)) {
                            log.debug(`${i + 1} : twitter attempt :`, scope.entry_method.action_description);

                            params.site._gleam.attemptEntry(scope.entry_method);

                            await utils.sleep(200);

                            if (config.sitesConfig.gleam.twitterSetUsername.enabled && !params.site._gleam.entryState.formData[scope.entry_method.id]) {
                              const twitterName = config.sitesConfig.gleam.twitterSetUsername.username ? config.sitesConfig.gleam.twitterSetUsername.username : emailName;

                              log.debug(`${i + 1} : twitter username :`, twitterName, ':', scope.entry_method.action_description);

                              scope.entry_method.show_extra = true;
                              params.site._gleam.entryDetailsState[scope.entry_method.id] = {twitter_username: twitterName};
                              params.site._gleam.entryState.formData[scope.entry_method.id] = {twitter_username: twitterName};
                            }
                          }

                          if (params.site._gleam.enoughEntryDetails(scope.entry_method) &&
                            (!scope.entry_method.requires_authentication || params.site._gleam.isAuthenticated(scope.entry_method, scope.entry_method.provider))
                          ) {
                            log.debug(`${i + 1} : confirm :`, scope.entry_method.action_description);

                            params.site._gleam.resumeEntry(scope.entry_method);

                            while (scope.entry_method.entering) {
                              await utils.sleep(500);
                            }
                          }
                        } catch (e) {
                          log.debug(`${i + 1} : task error :`, e);
                        }

                        params.button.progress(tasks.length, i + 1);
                      }

                      log.debug('all tasks done');

                      resolve();
                    });
                  }
                }
              }
            ]
          }
        ]
      },
      {
        host: 'chubkeys.com',
        steamKeys: '#gameKey:visible:not(:empty)',
        steamGroups: 'form[action*="steamcommunity.com/groups/"]@action',
        conditions: [
          {
            elementAnd: ['.task-item .btn-check:not(.btn-success)', '!#gameKey:visible:not(:empty):not(:contains("XXXX-XXXX-XXXX"))'],
            buttons: [
              {
                type: 'tasks',
                cancellable: true,
                click(params) {
                  // They make synchronous requests and the page hangs when you click "verify" buttons,
                  // so we make the requests ourselves and change the style of the buttons

                  const tasks = $J('.task-item:not(:has(.btn-check.btn-success))');

                  log.debug(`tasks found : ${tasks.length}`);

                  if (tasks.length) {
                    return new Promise(async (resolve) => {
                      for (let i = 0; i < tasks.length; i++) {
                        if (params.cancelled) {
                          break;
                        }

                        const task = $J(tasks.get(i));
                        const icon = task.find('.btn-verify-task i');
                        const verify = task.find('.btn-check');

                        if (icon.length && verify.length) {
                          const match = verify.attr('id').match(/verifyTaskBtn(\d+)/);

                          if (match) {
                            const type = icon.hasClass('la-steam') ? 'steam' : 'chain';
                            const url = `${window.location.origin}/${type}/check/giveaway/${match[1]}`;

                            log.debug(`${i + 1} : making request : ${url}`);

                            try {
                              const response = await $J.get(url);

                              if (response === 'success') {
                                log.debug(`${i + 1} : task done`);

                                verify.removeClass('btn-danger');
                                verify.addClass('btn-success');
                                verify.html('<i class="la la-check"></i>&nbsp;DONE');
                              } else {
                                log.debug(`${i + 1} : task error : ${response.content}`);

                                verify.removeClass('btn-primary');
                                verify.addClass('btn-danger');
                                verify.html('<i class="la la-close"></i>&nbsp;ERROR');
                              }
                            } catch (e) {}
                          }
                        }

                        params.button.progress(tasks.length, i + 1);
                      }

                      if (params.cancelled) {
                        log.debug('cancelled');
                      } else {
                        log.debug('all tasks done');
                      }

                      resolve();
                    });
                  }
                }
              }
            ]
          }
        ]
      },
      {
        host: 'giveaway.su',
        element: 'a[href*="logout"]',
        steamKeys: '.giveaway-key input%val',
        steamGroups() {
          const groups = [];

          $J('#actions tr:has(.fa-steam-symbol)').each((i, el) => {
            const btn = $J(el).find('button[data-type="action.universal"]');

            if (btn.length) {
              const action = JSON.parse(window.atob(btn.attr('data-action')));

              if (action.task.includes('steamcommunity.com/groups/') || action.task.includes('bit.ly/')) {
                groups.push(action.task);
              }
            }
          });

          return groups;
        }
      },
      {
        host: 'keyjoker.com',
        element: 'a[href*="logout"]',
        conditions: [
          {
            path: /^\/entries/,
            steamGroups: '.list-complete-item:has(.fa-steam) a.btn-primary'
          },
          {
            path: /^\/account\/keys/,
            steamKeys: '[id^="key-"]',
            ready() {
              $J('.card-body .col-auto img').on('click', (e) => {
                const key = steam.extractKeys($J(e.currentTarget).parents('.card-body').find('[id^="key-"]').text());

                if (key) {
                  steam.openKeyActivationPage(key[0]);
                }
              });

              $J('head').append(
                `<style>
                  .card-body .col-auto img {
                    cursor: pointer;
                  }
                </style>`
              );
            }
          }
        ]
      },
      {
        host: 'key-hub.eu',
        element: 'a[href*="logout"]',
        steamGroups: ['.task a[href*="steamcommunity.com/gid/"]', '.task a[href*="steamcommunity.com/groups/"]'],
        steamAppWishlist: '.task a[href*="store.steampowered.com/app/"]',
        conditions: [
          {
            element: '.task:not(:has(.task-result.fa-check-circle[style*="display: flex"])) a[href*="/away?data="]',
            buttons: [
              {
                type: 'tasks',
                cancellable: true,
                click(params) {
                  const tasks = $J(params.self.element);

                  log.debug(`tasks found : ${tasks.length}`);

                  if (tasks.length) {
                    return new Promise(async (resolve) => {
                      for (let i = 0; i < tasks.length; i++) {
                        if (params.cancelled) {
                          break;
                        }

                        const url = $J(tasks.get(i)).attr('href');

                        log.debug(`${i + 1} : making request : ${url}`);

                        try {
                          await $J.get(url);
                        } catch (e) {}

                        log.debug(`${i + 1} : task done`);

                        params.button.progress(tasks.length, i + 1);
                      }

                      if (params.cancelled) {
                        log.debug('cancelled');
                      } else {
                        log.debug('all tasks done');
                      }

                      resolve();
                    });
                  }
                }
              }
            ]
          }
        ]
      },
      {
        host: 'givee.club',
        element: 'a[href*="logout"]',
        steamGroups: '.event-actions tr:has(.fa-steam-symbol) .event-action-label a:not([href*="#"])',
        steamAppWishlist: ['.event-actions tr:has(.fa-plus-circle) .event-action-label a:not([href*="#"])', '.event-actions tr:has(.fa-plus-circle) .event-action-label a[href="#"]@data-steam-wishlist-appid'],
        steamAppFollow: '.event-actions tr:has(.fa-heart) .event-action-label a:not([href*="#"])',
        conditions: [
          {
            element: '.event-action-buttons .glyphicon-refresh',
            buttons: [
              {
                type: 'tasks',
                cancellable: true,
                click(params) {
                  const tasks = $J(params.self.element);

                  log.debug(`tasks found : ${tasks.length}`);

                  if (tasks.length) {
                    return new Promise(async (resolve) => {
                      for (let i = 0; i < tasks.length; i++) {
                        if (params.cancelled) {
                          break;
                        }

                        log.debug(`${i + 1} : click`);

                        const task = tasks.get(i);

                        task.click();
                        await utils.waitForElement('.event-action-checking .glyphicon-refresh', false, false, task.parent);

                        log.debug(`${i + 1} : task done`);

                        params.button.progress(tasks.length, i + 1);
                      }

                      if (params.cancelled) {
                        log.debug('cancelled');
                      } else {
                        log.debug('all tasks done');
                      }

                      resolve();
                    });
                  }
                }
              }
            ]
          }
        ]
      },
      {
        host: 'opquests.com',
        element: 'form[action*="logout"]',
        conditions: [
          {
            path: /^\/quests\//,
            steamGroups: '.items-center:has(.fa-users):has(.submit-loader) a[href*="steamcommunity.com/groups/"]',
            steamAppWishlist: '.items-center:has(.fa-list):has(.submit-loader) a[href*="store.steampowered.com/app/"]',
            steamAppFollow: '.items-center:has(.fa-gamepad):has(.submit-loader) a[href*="store.steampowered.com/app/"]',
            steamAppAddToLibrary: '.items-center:has(.fa-plus-square):has(.submit-loader) a[href*="store.steampowered.com/app/"]',
            conditions: [
              {
                element: '.items-center .submit-loader',
                buttons: [
                  {
                    type: 'tasks',
                    cancellable: true,
                    click(params) {
                      const tasks = $J(params.self.element);

                      log.debug(`tasks found : ${tasks.length}`);

                      if (tasks.length) {
                        return new Promise(async (resolve) => {
                          const m = window.location.pathname.match(/\/quests\/(\d+)/);

                          log.debug('making confirm request');

                          try {
                            await $J.get(`https://opquests.com/quests/${m[1]}?confirm=1`);
                          } catch (e) {}

                          let done = 0;

                          for (let i = 0; i < tasks.length; i++) {
                            if (params.cancelled) {
                              break;
                            }

                            const task = $J(tasks.get(i));
                            const token = task.parent().find('input[name="_token"]').val();
                            const taskId = task.parent().find('input[name="task_id"]').val();

                            log.debug(`${i + 1} : making request`);

                            try {
                              await $J.post('https://opquests.com/entries', {_token: token, task_id: taskId});
                            } catch (e) {}

                            params.button.progress(tasks.length, i + 1);

                            done++;

                            log.debug(`${i + 1} : done`);
                          }

                          if (params.cancelled) {
                            log.debug('cancelled');
                          } else {
                            log.debug('all tasks done');
                          }

                          if (done) {
                            notifications.success(i18n.get('reload-to-see-changes'), {timeout: 0});
                          }

                          resolve();
                        });
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            path: /^\/keys/,
            steamKeys: ['button[data-clipboard-text]@data-clipboard-text', '.w-full .mb-2'],
            ready() {
              const imgs = $J('.items-center .p-4 img');

              if (imgs.length) {
                imgs.on('click', (e) => {
                  steam.openKeyActivationPage($J(e.currentTarget).parents('.items-center').find('.mb-2:nth-child(2)').text().trim());
                });

                $J('head').append(
                  `<style>
                    .items-center .p-4 img {
                      cursor: pointer;
                    }
                  </style>`
                );
              }
            }
          },
        ]
      },
      {
        host: 'key.gift',
        element: 'div[class*="_navbarSection_"] span[class*="_username_"]',
        conditions: [
          {
            path: /^\/giveaway/,
            steamKeys: 'div[class*="_gameContainer_"] div[class*="_key_"]',
            steamGroups: 'div[class*="_tasksContainer_"] a[href*="steamcommunity.com/groups/"]'
          },
          {
            path: /^\/profile/,
            steamKeys: 'div[class*="_keyCardsCointainer_"] span[class*="_key_"]',
            ready() {
              $J('div[class*="_keyCardsCointainer_"] div[class*="_cardInfo_"] img').on('click', (e) => {
                const key = steam.extractKeys($J(e.currentTarget).parents('div[class*="_keycard_"]').find('span[class*="_key_"]').text());

                if (key) {
                  steam.openKeyActivationPage(key[0]);
                }
              });

              $J('head').append(
                `<style>
                  div[class*="_keyCardsCointainer_"] div[class*="_cardInfo_"] img {
                    cursor: pointer;
                  }
                </style>`
              );
            }
          }
        ]
      }
    ]
  };

  // https://materialdesignicons.com
  const icons = {
    checkmark: '<svg viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>',
    key: '<svg viewBox="0 0 24 24"><path d="M7,14A2,2 0 0,1 5,12A2,2 0 0,1 7,10A2,2 0 0,1 9,12A2,2 0 0,1 7,14M12.65,10C11.83,7.67 9.61,6 7,6A6,6 0 0,0 1,12A6,6 0 0,0 7,18C9.61,18 11.83,16.33 12.65,14H17V18H21V14H23V10H12.65Z" /></svg>',
    group: '<svg viewBox="0 0 24 24"><path d="M19 17V19H7V17S7 13 13 13 19 17 19 17M16 8A3 3 0 1 0 13 11A3 3 0 0 0 16 8M19.2 13.06A5.6 5.6 0 0 1 21 17V19H24V17S24 13.55 19.2 13.06M18 5A2.91 2.91 0 0 0 17.11 5.14A5 5 0 0 1 17.11 10.86A2.91 2.91 0 0 0 18 11A3 3 0 0 0 18 5M8 10H5V7H3V10H0V12H3V15H5V12H8Z" /></svg>',
    wishlist: '<svg viewBox="0 0 24 24"><path d="M17,14H19V17H22V19H19V22H17V19H14V17H17V14M5,3H19C20.11,3 21,3.89 21,5V12.8C20.39,12.45 19.72,12.2 19,12.08V5H5V19H12.08C12.2,19.72 12.45,20.39 12.8,21H5C3.89,21 3,20.11 3,19V5C3,3.89 3.89,3 5,3M7,7H17V9H7V7M7,11H17V12.08C16.15,12.22 15.37,12.54 14.68,13H7V11M7,15H12V17H7V15Z" /></svg>',
    follow: '<svg viewBox="0 0 24 24"><path d="M23.5 17L18.5 22L15 18.5L16.5 17L18.5 19L22 15.5L23.5 17M22 13.5L22 13.8C21.37 13.44 20.67 13.19 19.94 13.07C19.75 12.45 19.18 12 18.5 12H17V7H12V5.5C12 4.67 11.33 4 10.5 4C9.67 4 9 4.67 9 5.5V7H4L4 9.12C5.76 9.8 7 11.5 7 13.5C7 15.5 5.75 17.2 4 17.88V20H6.12C6.8 18.25 8.5 17 10.5 17C11.47 17 12.37 17.3 13.12 17.8L13 19C13 20.09 13.29 21.12 13.8 22H13.2V21.7C13.2 20.21 12 19 10.5 19C9 19 7.8 20.21 7.8 21.7V22H4C2.9 22 2 21.1 2 20V16.2H2.3C3.79 16.2 5 15 5 13.5C5 12 3.79 10.8 2.3 10.8H2V7C2 5.9 2.9 5 4 5H7.04C7.28 3.3 8.74 2 10.5 2C12.26 2 13.72 3.3 13.96 5H17C18.1 5 19 5.9 19 7V10.04C20.7 10.28 22 11.74 22 13.5Z" /></svg>',
    library: '<svg viewBox="0 0 24 24"><path d="M13 3V11H21V3H13M3 21H11V13H3V21M3 3V11H11V3H3M13 16H16V13H18V16H21V18H18V21H16V18H13V16Z" /></svg>',
    cancel: '<svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12C4,13.85 4.63,15.55 5.68,16.91L16.91,5.68C15.55,4.63 13.85,4 12,4M12,20A8,8 0 0,0 20,12C20,10.15 19.37,8.45 18.32,7.09L7.09,18.32C8.45,19.37 10.15,20 12,20Z" /></svg>',
    success: '<svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" /></svg>',
    info: '<svg viewBox="0 0 24 24"><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" /></svg>',
    info2: '<svg viewBox="0 0 24 24"><path d="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.14,8.77C11.95,8.87 8.7,11.46 8.7,11.46C8.5,11.61 8.56,11.6 8.72,11.88C8.88,12.15 8.86,12.17 9.05,12.04C9.25,11.91 9.58,11.7 10.13,11.36C12.25,10 10.47,13.14 9.56,18.43C9.2,21.05 11.56,19.7 12.17,19.3C12.77,18.91 14.38,17.8 14.54,17.69C14.76,17.54 14.6,17.42 14.43,17.17C14.31,17 14.19,17.12 14.19,17.12C13.54,17.55 12.35,18.45 12.19,17.88C12,17.31 13.22,13.4 13.89,10.71C14,10.07 14.3,8.67 13.14,8.77Z" /></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" /></svg>',
    error: '<svg viewBox="0 0 24 24"><path d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" /></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M19,3H16.3H7.7H5A2,2 0 0,0 3,5V7.7V16.4V19A2,2 0 0,0 5,21H7.7H16.4H19A2,2 0 0,0 21,19V16.3V7.7V5A2,2 0 0,0 19,3M15.6,17L12,13.4L8.4,17L7,15.6L10.6,12L7,8.4L8.4,7L12,10.6L15.6,7L17,8.4L13.4,12L17,15.6L15.6,17Z" /></svg>'
  };

  const i18n = {
    format(str, vars) {
      const replaceStringIds = (s) => {
        return s.replace(/\[([a-z0-9\-]+)\]/g, (m, id) => {
          return this.lang[id] ? replaceStringIds(this.lang[id]) : m;
        });
      };

      str = replaceStringIds(str);

      if (typeof vars === 'object') {
        Object.keys(vars).forEach((item) => {
          str = str.replace(new RegExp(`{${item}}`, 'g'), utils.encodeEntities(vars[item]));
        });
      }

      return str;
    },
    get(id, vars) {
      if (!this.lang) {
        return;
      }

      let res = this.lang[id];

      if (typeof res === 'undefined' && this.lang !== this.langs.default) {
        res = this.langs.default[id];
      }

      return this.format(res, vars);
    },
    lang: null,
    langs: {
      default: {
        'confirm-tasks': 'Confirm tasks',
        'cancel': 'Cancel',
        'useful-info': 'Useful information',
        'reload-to-see-changes': '<a href="javascript:window.location.reload(false)">Reload</a> the page to see changes.',
        'steam-activate-key': 'Open Steam key activation page ({key})',
        'steam-loading-tasks': 'Loading Steam tasks...',
        'steam-group-join': 'Join Steam group "{group}" (Ctrl+Click - open the group in a new tab)',
        'steam-group-leave': 'Leave Steam group "{group}" (Ctrl+Click - open the group in a new tab)',
        'steam-init-groups-request-failed': 'Failed to load <a href="https://steamcommunity.com/my/groups" target="_blank">your groups</a>. <a href="https://steamcommunity.com" target="_blank">Steam Community</a> is probably down.',
        'steam-init-store-request-failed': 'Failed to get information from your Steam account. <a href="https://store.steampowered.com" target="_blank">Steam Store</a> is probably down.',
        'steam-join-group-failed': 'Failed to join the <a href="{groupLink}" target="_blank">group</a>. <a href="https://steamcommunity.com" target="_blank">Steam Community</a> is probably experiencing some issues.',
        'steam-join-group-join-request-sent': 'Join request sent. To join the <a href="{groupLink}" target="_blank">group</a>, your join request must be approved by the group administrator.',
        'steam-join-group-not-logged': 'Failed to join the <a href="{groupLink}" target="_blank">group</a>. [steam-community-not-logged]',
        'steam-join-group-not-found': 'Failed to join the <a href="{groupLink}" target="_blank">group</a>. Looks like the group does not exist.',
        'steam-leave-group-failed': 'Failed to leave the <a href="{groupLink}" target="_blank">group</a>. <a href="https://steamcommunity.com" target="_blank">Steam Community</a> is probably experiencing some issues.',
        'steam-leave-group-not-logged': 'Failed to leave the <a href="{groupLink}" target="_blank">group</a>. [steam-community-not-logged]',
        'steam-app-wishlist-add': 'Add game #{appId} to Steam wishlist (Ctrl+Click - open the game in a new tab)',
        'steam-app-wishlist-remove': 'Remove game #{appId} from Steam wishlist (Ctrl+Click - open the game in a new tab)',
        'steam-app-wishlist-add-failed': 'Failed to add to Steam wishlist. [steam-store-issues]',
        'steam-app-wishlist-remove-failed': 'Failed to remove from Steam wishlist. [steam-store-issues]',
        'steam-app-follow': 'Follow game #{appId} on Steam (Ctrl+Click - open the game in a new tab)',
        'steam-app-unfollow': 'Unfollow game #{appId} on Steam (Ctrl+Click - open the game in a new tab)',
        'steam-app-follow-failed': 'Failed to follow a game on Steam. [steam-store-issues]',
        'steam-app-unfollow-failed': 'Failed to unfollow a game on Steam. [steam-store-issues]',
        'steam-app-add-to-library': 'Add game #{appId} to Steam library (Ctrl+Click - open the game in a new tab)',
        'steam-app-add-to-library-failed': 'Failed to add a game to Steam library. [steam-store-issues]',
        'steam-community-not-logged': 'It looks like you are not logged in to <a href="https://steamcommunity.com" target="_blank">Steam Community</a>.',
        'steam-store-not-logged': 'It looks like you are not logged in to <a href="https://store.steampowered.com" target="_blank">Steam Store</a>.',
        'steam-store-issues': 'Perhaps you are not logged in to <a href="https://store.steampowered.com" target="_blank">Steam Store</a> or Steam is experiencing some issues.',
        'gc-updated': `Giveaway Companion has been updated to version ${version.string}.<br><br><b>Changes:</b>`
      },
      ru: {
        'confirm-tasks': 'Подтвердить задания',
        'cancel': 'Отмена',
        'useful-info': 'Полезная информация',
        'reload-to-see-changes': '<a href="javascript:window.location.reload(false)">Обновите</a> страницу, чтобы увидеть изменения.',
        'steam-activate-key': 'Открыть страницу активации Steam ключа ({key})',
        'steam-loading-tasks': 'Загрузка заданий Steam...',
        'steam-group-join': 'Вступить в Steam группу "{group}" (Ctrl+Клик - открыть группу в новой вкладке)',
        'steam-group-leave': 'Выйти из Steam группы "{group}" (Ctrl+Клик - открыть группу в новой вкладке)',
        'steam-init-groups-request-failed': 'Не удалось загрузить <a href="https://steamcommunity.com/my/groups" target="_blank">ваши группы</a>. <a href="https://steamcommunity.com" target="_blank">Сообщество Steam</a>, возможно, неактивно.',
        'steam-init-store-request-failed': 'Не удалось загрузить информацию из вашего аккаунта Steam. <a href="https://store.steampowered.com" target="_blank">Магазин Steam</a>, возможно, неактивен.',
        'steam-join-group-failed': 'Не удалось вступить в <a href="{groupLink}" target="_blank">группу</a>. <a href="https://steamcommunity.com" target="_blank">Сообщество Steam</a>, возможно, испытывает какие-то проблемы.',
        'steam-join-group-join-request-sent': 'Заявка на вступление отправлена. Чтобы вступить в <a href="{groupLink}" target="_blank">группу</a>, вашу заявку должен одобрить администратор группы.',
        'steam-join-group-not-logged': 'Не удалось вступить в <a href="{groupLink}" target="_blank">группу</a>. [steam-community-not-logged]',
        'steam-join-group-not-found': 'Не удалось вступить в <a href="{groupLink}" target="_blank">группу</a>. Похоже, группа не существует.',
        'steam-leave-group-failed': 'Не удалось выйти из <a href="{groupLink}" target="_blank">группы</a>. <a href="https://steamcommunity.com" target="_blank">Сообщество Steam</a>, возможно, испытывает какие-то проблемы.',
        'steam-leave-group-not-logged': 'Не удалось выйти из <a href="{groupLink}" target="_blank">группы</a>. [steam-community-not-logged]',
        'steam-app-wishlist-add': 'Добавить в список желаемого Steam игру #{appId} (Ctrl+Клик - открыть игру в новой вкладке)',
        'steam-app-wishlist-remove': 'Удалить из списка желаемого Steam игру #{appId} (Ctrl+Клик - открыть игру в новой вкладке)',
        'steam-app-wishlist-add-failed': 'Не удалось добавить в список желаемого Steam. [steam-store-issues]',
        'steam-app-wishlist-remove-failed': 'Не удалось удалить из списка желаемого Steam. [steam-store-issues]',
        'steam-app-follow': 'Подписаться в Steam на игру #{appId} (Ctrl+Клик - открыть игру в новой вкладке)',
        'steam-app-unfollow': 'Отписаться в Steam от игры #{appId} (Ctrl+Клик - открыть игру в новой вкладке)',
        'steam-app-follow-failed': 'Не удалось подписаться на Steam игру. [steam-store-issues]',
        'steam-app-unfollow-failed': 'Не удалось отписаться от Steam игры. [steam-store-issues]',
        'steam-app-add-to-library': 'Добавить игру #{appId} в библиотеку Steam (Ctrl+Клик - открыть игру в новой вкладке)',
        'steam-app-add-to-library-failed': 'Не удалось добавить игру в библиотеку Steam. [steam-store-issues]',
        'steam-community-not-logged': 'Похоже, вы не авторизованы в <a href="https://steamcommunity.com" target="_blank">Сообществе Steam</a>.',
        'steam-store-not-logged': 'Похоже, вы не авторизованы в <a href="https://store.steampowered.com" target="_blank">Магазине Steam</a>.',
        'steam-store-issues': 'Возможно, вы не авторизованы в <a href="https://store.steampowered.com" target="_blank">Магазине Steam</a> или Steam испытывает какие-то проблемы.',
        'gc-updated': `Giveaway Companion был обновлён до версии ${version.string}.<br><br><b>Изменения:</b>`
      }
    }
  };

  const state = {
    host: window.location.hostname.replace(/^www\./, ''),
    site: null
  };

  const utils = {
    _resolvedUrl: {},
    randomString(length) {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';

      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }

      return result;
    },
    scrollTo(element) {
      const el = $J(element);

      if (!el.length || !el.is(':visible')) {
        return;
      }

      $J('html, body').animate({
        scrollTop: parseInt(el.offset().top)
      }, 500);
    },
    async resolveUrl(url) {
      log.debug(`utils.resolveUrl("${url}")`);

      const cached = this.getResolvedUrl(url);

      if (cached) {
        log.debug(`utils.resolveUrl() : url found in the cache : ${cached}`);

        return cached;
      }

      log.debug(`utils.resolveUrl() : making request : ${url}`);

      const response = await $GM.xmlHttpRequest({
        method: 'GET',
        url: url
      });

      if (response.status !== 200) {
        log.debug(`utils.resolveUrl() : request failed : ${response.status}`);

        return false;
      }

      this._resolvedUrl[url] = response.finalUrl;

      log.debug(`utils.resolveUrl() : final url : ${response.finalUrl}`);

      return response.finalUrl;
    },
    getResolvedUrl(url) {
      return this._resolvedUrl[url];
    },
    // https://github.com/angular/angular.js/blob/26a5779cddf70944b7548e3a6410d35237a516e5/src/ngSanitize/sanitize.js#L577
    encodeEntities(value) {
      const SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
      const NON_ALPHANUMERIC_REGEXP = /([^#-~ |!])/g;
      return value.
          replace(/&/g, '&amp;').
          replace(SURROGATE_PAIR_REGEXP, function(value) {
            const hi = value.charCodeAt(0);
            const low = value.charCodeAt(1);
            return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
          }).
          replace(NON_ALPHANUMERIC_REGEXP, function(value) {
            return '&#' + value.charCodeAt(0) + ';';
          }).
          replace(/</g, '&lt;').
          replace(/>/g, '&gt;');
    },
    async waitForElement(selectors, waitForExistence = true, visible = false, parent = document, interval = 250, seconds = 0) {
      const isVisible = (e) => {
        return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
      };

      return new Promise((resolve) => {
        if (!Array.isArray(selectors)) {
          selectors = [selectors];
        }

        seconds = seconds * 1000;

        const startTime = Date.now();
        const check = () => {
          let found = true;
          let el;

          for (const s of selectors) {
            el = parent.querySelector(s);

            if ((waitForExistence && (!el || (visible && !isVisible(el)))) || (!waitForExistence && el)) {
              found = false;
              break;
            }
          }

          if (found) {
            return resolve(el);
          }

          if (seconds > 0 && Date.now() - startTime > seconds) {
            return resolve(false);
          }

          setTimeout(check, interval);
        };

        check();
      });
    },
    async sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }
  };

  const overlay = {
    _element: null,
    visible(value) {
      if (typeof value === 'undefined') {
        return this._element !== null;
      }

      if (value) {
        this._element = $J(`<div style="z-index: 9999998; position: fixed; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,.5);"></div>`)
            .appendTo('body');
      } else {
        if (this._element) {
          this._element.remove();
          this._element = null;
        }
      }
    }
  };

  const steam = {
    initFailed: false,
    _sessionId: null,
    _userId: null,
    _processUrl: null,
    _userGroups: [],
    _userWishlistedApps: [],
    _userFollowedApps: [],
    _userOwnedApps: [],
    _idCache: {},
    _activateKeyUrl: 'https://store.steampowered.com/account/registerkey?key=',
    _userGroupsUrl: 'https://steamcommunity.com/my/groups',
    _userDataUrl: 'https://store.steampowered.com/dynamicstore/userdata/?v=275&id=',
    _groupUrl: 'https://steamcommunity.com/groups/',
    _appUrl: 'https://store.steampowered.com/app/',
    _addToWishlistUrl: 'https://store.steampowered.com/api/addtowishlist',
    _removeFromWishlistUrl: 'https://store.steampowered.com/api/removefromwishlist',
    _followAppUrl: 'https://store.steampowered.com/explore/followgame/',
    _addToLibraryUrl: 'https://store.steampowered.com/freelicense/addfreelicense/',
    _groupRegex: /steamcommunity\.com\/groups\/([a-zA-Z0-9\-_]{2,32})/,
    _appRegex: /store\.steampowered\.com\/app\/(\d+)/,
    _keyRegex: /[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}(-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})?/g,
    _initPromise: null,
    openGroupPage(group) {
      if (typeof group !== 'string') {
        return;
      }

      log.debug(`steam.openGroupPage("${group}")`);

      window.open(this._groupUrl + group, '_blank');
    },
    openKeyActivationPage(key) {
      if (typeof key !== 'string') {
        return;
      }

      log.debug(`steam.activateKey("${key}")`);

      window.open(this._activateKeyUrl + key, '_blank');
    },
    openAppPage(id) {
      if (typeof id !== 'string' && typeof id !== 'number') {
        return;
      }

      log.debug(`steam.openAppPage(${id})`);

      window.open(this._appUrl + id, '_blank');
    },
    extractKeys(txt) {
      if (typeof txt !== 'string') {
        return false;
      }

      const match = txt.match(this._keyRegex);

      if (match) {
        return match;
      }

      return false;
    },
    extractGroupName(url) {
      if (typeof url !== 'string') {
        return false;
      }

      const match = url.match(this._groupRegex);

      if (match) {
        return match[1];
      }

      return false;
    },
    extractAppId(url) {
      if (typeof url !== 'string') {
        return false;
      }

      const match = url.match(this._appRegex);

      if (match) {
        return match[1];
      }

      return false;
    },
    async init() {
      if (!config.steamGroups || this.initFailed) {
        return false;
      }
      if (this._sessionId) {
        return true;
      }
      if (this._initPromise) {
        return this._initPromise;
      }

      this._initPromise = new Promise(async (resolve) => {
        log.debug('steam.init()');
        log.debug(`steam.init() : making request : ${this._userGroupsUrl}`);

        let response;

        for (let i = 0; i < 2; i++) {
          response = await $GM.xmlHttpRequest({
            method: 'GET',
            url: this._userGroupsUrl
          });

          if (response.status !== 200) {
            log.debug(`steam.init() : request failed : ${response.status}`);

            notifications.error(i18n.get('steam-init-groups-request-failed'));

            this.initFailed = true;
            return resolve(false);
          }

          if (response.finalUrl.includes('/login/')) {
            log.debug('steam.init() : redirected to login');

            if (i == 0) {
              log.debug('steam.init() : making request : https://login.steampowered.com/jwt/refresh');

              response = await $GM.xmlHttpRequest({
                method: 'GET',
                url: 'https://login.steampowered.com/jwt/refresh?redir=https%3A%2F%2Fsteamcommunity.com%2Fmy%2Fgroups'
              });
            } else {
              log.debug('steam.init() : user not logged');

              notifications.error(i18n.get('steam-community-not-logged'));

              this.initFailed = true;
              return resolve(false);
            }
          } else {
            break;
          }
        }

        const responseDom = $J(response.responseText);
        const userUrl = responseDom.find('.friends_header_name a').attr('href');
        this._sessionId = response.responseText.match(/g_sessionID\s*=\s*"(.+?)"/);

        if (!userUrl || !this._sessionId) {
          log.debug('steam.init() : user data not found');

          notifications.error(i18n.get('steam-community-not-logged'));

          this.initFailed = true;
          return resolve(false);
        }

        this._processUrl = userUrl + '/home_process';
        this._sessionId = this._sessionId[1];

        responseDom.find('.groupTitle a').each((i, e) => {
          const m = this.extractGroupName($J(e).attr('href'));

          if (m) {
            this._userGroups.push(m.toLowerCase());
          }
        });

        this._userId = responseDom.find('a[data-miniprofile]').attr('data-miniprofile');

        log.debug(`steam.init() : making request : ${this._userDataUrl + this._userId}`);

        response = await $GM.xmlHttpRequest({
          method: 'GET',
          url: this._userDataUrl + this._userId + '&t=' + Date.now()
        });

        if (response.status !== 200) {
          log.debug(`steam.init() : request failed : ${response.status}`);

          notifications.error(i18n.get('steam-init-store-request-failed'));

          this.initFailed = true;
          return resolve(false);
        }

        const json = JSON.parse(response.responseText);

        this._userWishlistedApps = json.rgWishlist;
        this._userFollowedApps = json.rgFollowedApps;
        this._userOwnedApps = json.rgOwnedApps;

        log.debug('steam.init() : done');

        resolve(true);
      });

      return this._initPromise;
    },
    async joinGroup(groupName) {
      if (!config.steamGroups || !this._sessionId) {
        return false;
      }

      groupName = groupName.toLowerCase();

      log.debug(`steam.joinGroup(${groupName})`);

      let groupInfo = await this.getGroupInfo(groupName);

      if (!groupInfo) {
        notifications.error(i18n.get('steam-join-group-failed', {'groupLink': this._groupUrl + groupName}));

        return false;
      }

      log.debug(`steam.joinGroup() : making join request : ${this._groupUrl}${groupName}`);

      const response = await $GM.xmlHttpRequest({
        method: 'POST',
        url: this._groupUrl + groupName,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $J.param({action: 'join', sessionID: groupInfo.sessionId})
      });

      if (response.status !== 200) {
        log.debug(`steam.joinGroup() : request failed : ${response.status}`);

        notifications.error(i18n.get('steam-join-group-failed', {'groupLink': this._groupUrl + groupName}));

        return false;
      }

      groupInfo = await this.getGroupInfo(groupName, response.responseText);

      if (!groupInfo) {
        notifications.error(i18n.get('steam-join-group-failed', {'groupLink': this._groupUrl + groupName}));

        return false;
      }

      if (groupInfo.status === 'joined') {
        this._userGroups.push(groupName);

        return true;
      }

      notifications.error(i18n.get('steam-join-group-failed', {'groupLink': this._groupUrl + groupName}));

      return false;
    },
    async leaveGroup(groupName) {
      if (!config.steamGroups || !this._sessionId || !this._processUrl) {
        return false;
      }

      groupName = groupName.toLowerCase();

      log.debug(`steam.leaveGroup(${groupName})`);

      const groupInfo = await this.getGroupInfo(groupName);

      if (!groupInfo) {
        notifications.error(i18n.get('steam-leave-group-failed', {'groupLink': this._groupUrl + groupName}));

        return false;
      }

      if (groupInfo.status === 'not_logged' || groupInfo.status === 'wrong_page') {
        notifications.error(i18n.get('steam-leave-group-not-logged', {'groupLink': this._groupUrl + groupName}));

        return false;
      } else if (groupInfo.status === 'not_joined') {
        return true;
      }

      log.debug(`steam.leaveGroup() : making request : ${this._processUrl}`);

      const response = await $GM.xmlHttpRequest({
        method: 'POST',
        url: this._processUrl,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $J.param({action: 'leaveGroup', sessionID: groupInfo.sessionId, groupId: groupInfo.id})
      });

      if (response.status !== 200) {
        log.debug(`steam.leaveGroup() : request failed : ${response.status}`);

        notifications.error(i18n.get('steam-leave-group-failed', {'groupLink': this._groupUrl + groupName}));

        return false;
      }

      if (!response.finalUrl.includes('/groups')) {
        log.debug('steam.leaveGroup() : user is not logged in');

        notifications.error(i18n.get('steam-leave-group-not-logged', {'groupLink': this._groupUrl + groupName}));

        return false;
      }

      if (response.responseText.includes(groupInfo.id)) {
        log.debug('steam.leaveGroup() : not left');

        notifications.error(i18n.get('steam-leave-group-failed', {'groupLink': this._groupUrl + groupName}));

        return false;
      }

      log.debug('steam.leaveGroup() : left');

      const idx = this._userGroups.indexOf(groupName);

      if (idx !== -1) {
        this._userGroups.splice(idx, 1);
      }

      return true;
    },
    async getGroupInfo(groupName, groupPage) {
      let groupPageJ;

      groupName = groupName.toLowerCase();

      if (groupPage) {
        groupPageJ = $J(groupPage);
      } else {
        log.debug(`steam.getGroupInfo() : making request : ${this._groupUrl}${groupName}`);

        const response = await $GM.xmlHttpRequest({
          method: 'GET',
          url: this._groupUrl + groupName
        });

        if (response.status !== 200) {
          log.debug(`steam.getGroupInfo() : request failed : ${response.status}`);

          return false;
        }

        groupPage = response.responseText;
        groupPageJ = $J(response.responseText);
      }

      const result = {
        id: null,
        sessionId: null
      };

      if (groupPageJ.find('.supernav_container').length) {
        if (groupPageJ.find('#account_pulldown').length) {
          if (groupPageJ.find('.grouppage_header_name').length) {
            if (groupPageJ.find('a[href*="ConfirmLeaveGroup"]').length) {
              log.debug('steam.getGroupInfo() : joined');

              result.status = 'joined';
            } else {
              if (groupPageJ.find('a[href*="ConfirmCancelJoinRequest"]').length) {
                log.debug('steam.getGroupInfo() : waiting for approval');

                result.status = 'approval';
              } else {
                log.debug('steam.getGroupInfo() : not joined');

                result.status = 'not_joined';
              }
            }
          } else {
            log.debug('steam.getGroupInfo() : group not found');

            result.status = 'not_found';
          }
        } else {
          log.debug('steam.getGroupInfo() : user is not logged in');

          result.status = 'not_logged';
        }
      } else {
        log.debug('steam.getGroupInfo() : wrong page');

        result.status = 'wrong_page';
      }

      const groupId = groupPageJ.find('input[name="groupId"]').val();

      if (groupId) {
        log.debug(`steam.getGroupInfo() : group id found : ${groupId}`);

        this._idCache[groupName] = groupId;
        result.id = groupId;
      } else {
        log.debug('steam.getGroupInfo() : group id not found');
      }

      const sessionId = groupPage.match(/g_sessionID\s*=\s*"(.+?)"/);

      if (sessionId) {
        log.debug(`steam.getGroupInfo() : g_sessionID found : ${sessionId[1]}`);
      } else {
        log.debug('steam.getGroupInfo() : g_sessionID not found');
      }

      result.sessionId = sessionId[1];

      return result;
    },
    async getSessionId(url) {
      log.debug(`steam.getSessionId() : making request : ${url}`);

      let response = await $GM.xmlHttpRequest({
        method: 'GET',
        url: url
      });

      if (response.status !== 200) {
        log.debug(`steam.getSessionId() : request failed : ${response.status}`);

        return false;
      }

      const sessionId = response.responseText.match(/g_sessionID\s*=\s*"(.+?)"/);

      if (!sessionId) {
        log.debug('steam.getSessionId() : g_sessionID not found');

        return false;
      }

      return sessionId[1];
    },
    isJoinedGroup(groupName) {
      if (!config.steamGroups) {
        return false;
      }

      groupName = groupName.toLowerCase();
      return this._userGroups.indexOf(groupName) !== -1;
    },
    isAppWishlisted(appId) {
      if (!config.steamAppWishlist) {
        return false;
      }

      appId = parseInt(appId);

      return this._userWishlistedApps.indexOf(appId) !== -1 || this._userOwnedApps.indexOf(appId) !== -1;
    },
    isAppFollowed(appId) {
      if (!config.steamAppFollow) {
        return false;
      }

      appId = parseInt(appId);

      return this._userFollowedApps.indexOf(appId) !== -1;
    },
    isAppOwned(appId) {
      appId = parseInt(appId);

      return this._userOwnedApps.indexOf(appId) !== -1;
    },
    async addToWishlist(appId) {
      if (!this._sessionId) {
        return false;
      }

      log.debug(`steam.addToWishlist(${appId})`);

      const sessionId = await this.getSessionId(`https://store.steampowered.com/app/${appId}/`);

      if (!sessionId) {
        notifications.error(i18n.get('steam-store-not-logged'));

        return false;
      }

      log.debug(`steam.addToWishlist() : making request : ${this._addToWishlistUrl}`);

      const response = await $GM.xmlHttpRequest({
        method: 'POST',
        url: this._addToWishlistUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': `https://store.steampowered.com/app/${appId}/`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        data: $J.param({sessionid: sessionId, appid: appId})
      });

      if (response.status !== 200) {
        log.debug(`steam.addToWishlist() : request failed : ${response.status}`);

        notifications.error(i18n.get('steam-app-wishlist-add-failed'));

        return false;
      }

      if (!JSON.parse(response.responseText).success) {
        log.debug('steam.addToWishlist() : not success');

        notifications.error(i18n.get('steam-app-wishlist-add-failed'));

        return false;
      }

      this._userWishlistedApps.push(parseInt(appId));

      return true;
    },
    async removeFromWishlist(appId) {
      if (!this._sessionId) {
        return false;
      }

      log.debug(`steam.removeFromWishlist(${appId})`);

      const sessionId = await this.getSessionId(`https://store.steampowered.com/app/${appId}/`);

      if (!sessionId) {
        notifications.error(i18n.get('steam-store-not-logged'));

        return false;
      }

      log.debug(`steam.removeFromWishlist() : making request : ${this._removeFromWishlistUrl}`);

      const response = await $GM.xmlHttpRequest({
        method: 'POST',
        url: this._removeFromWishlistUrl,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $J.param({sessionid: sessionId, appid: appId})
      });

      if (response.status !== 200) {
        log.debug(`steam.removeFromWishlist() : request failed : ${response.status}`);

        notifications.error(i18n.get('steam-app-wishlist-remove-failed'));

        return false;
      }

      if (!JSON.parse(response.responseText).success) {
        log.debug('steam.removeFromWishlist() : not success');

        notifications.error(i18n.get('steam-app-wishlist-remove-failed'));

        return false;
      }

      const index = this._userWishlistedApps.indexOf(parseInt(appId));

      if (index !== -1) {
        this._userWishlistedApps.splice(index, 1);
      }

      return true;
    },
    async followApp(appId) {
      log.debug(`steam.followApp(${appId})`);

      const sessionId = await this.getSessionId(`https://store.steampowered.com/app/${appId}/`);

      if (!sessionId) {
        notifications.error(i18n.get('steam-store-not-logged'));

        return false;
      }

      log.debug(`steam.followApp() : making request : ${this._followAppUrl}`);

      const response = await $GM.xmlHttpRequest({
        method: 'POST',
        url: this._followAppUrl,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $J.param({sessionid: sessionId, appid: appId})
      });

      if (response.status !== 200) {
        log.debug(`steam.followApp() : request failed : ${response.status}`);

        notifications.error(i18n.get('steam-app-follow-failed'));

        return false;
      }

      if (response.responseText != 'true') {
        log.debug('steam.followApp() : not success');

        notifications.error(i18n.get('steam-app-follow-failed'));

        return false;
      }

      this._userFollowedApps.push(parseInt(appId));

      return true;
    },
    async unfollowApp(appId) {
      log.debug(`steam.unfollowApp(${appId})`);

      const sessionId = await this.getSessionId(`https://store.steampowered.com/app/${appId}/`);

      if (!sessionId) {
        notifications.error(i18n.get('steam-store-not-logged'));

        return false;
      }

      log.debug(`steam.unfollowApp() : making request : ${this._followAppUrl}`);

      const response = await $GM.xmlHttpRequest({
        method: 'POST',
        url: this._followAppUrl,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $J.param({sessionid: sessionId, appid: appId, unfollow: '1'})
      });

      if (response.status !== 200) {
        log.debug(`steam.unfollowApp() : request failed : ${response.status}`);

        notifications.error(i18n.get('steam-app-unfollow-failed'));

        return false;
      }

      if (response.responseText != 'true') {
        log.debug('steam.unfollowApp() : not success');

        notifications.error(i18n.get('steam-app-unfollow-failed'));

        return false;
      }

      const index = this._userFollowedApps.indexOf(parseInt(appId));

      if (index !== -1) {
        this._userFollowedApps.splice(index, 1);
      }

      return true;
    },
    async addToLibrary(appId) {
      log.debug(`steam.addToLibrary(${appId})`);
      log.debug(`steam.addToLibrary() : making request : https://store.steampowered.com/app/${appId}/`);

      let response = await $GM.xmlHttpRequest({
        method: 'GET',
        url: `https://store.steampowered.com/app/${appId}/`
      });

      if (response.status !== 200) {
        log.debug(`steam.addToLibrary() : request failed : ${response.status}`);

        notifications.error(i18n.get('steam-app-add-to-library-failed'));

        return false;
      }

      if (response.responseText.includes('game_area_already_owned')) {
        log.debug('steam.addToLibrary() : already owned');

        return true;
      }

      const sessionId = response.responseText.match(/g_sessionID\s*=\s*"(.+?)"/);

      if (!sessionId) {
        log.debug('steam.addToLibrary() : g_sessionID not found');

        notifications.error(i18n.get('steam-app-add-to-library-failed'));

        return false;
      }

      const subId = response.responseText.match(/AddFreeLicense\(\s*(\d+)/);

      if (!subId) {
        log.debug('steam.addToLibrary() : subId not found');

        notifications.error(i18n.get('steam-app-add-to-library-failed'));

        return false;
      }

      log.debug(`steam.addToLibrary() : making request : https://store.steampowered.com/app/${subId[1]}/`);

      response = await $GM.xmlHttpRequest({
        method: 'POST',
        url: this._addToLibraryUrl + subId[1],
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $J.param({sessionid: sessionId[1], ajax: 'true'})
      });

      if (response.status !== 200) {
        log.debug(`steam.addToLibrary() : request failed : ${response.status}`);

        notifications.error(i18n.get('steam-app-add-to-library-failed'));

        return false;
      }

      this._userOwnedApps.push(parseInt(appId));

      return true;
    }
  };

  const buttons = {
    count: 0,
    _elements: {},
    _css: {},
    _steamKeys: [],
    _steamGroups: [],
    _steamAppWishlist: [],
    _steamAppFollow: [],
    _steamAppAddToLibrary: [],
    _init() {
      if (this._elements.main) {
        return;
      }

      this._css.mainId = utils.randomString(11);
      this._css.wrapperId = utils.randomString(11);
      this._css.buttonsId = utils.randomString(11);
      this._css.buttonClass = utils.randomString(11);
      this._css.buttonContentClass = utils.randomString(11);
      this._css.disabledClass = utils.randomString(11);
      this._css.spinnerClass = utils.randomString(11);
      this._css.spinnerKeyframe = utils.randomString(11);
      this._css.progressClass = utils.randomString(11);
      this._css.moverId = utils.randomString(11);
      this._css.resizerId = utils.randomString(11);
      this._css.scrollUpId = utils.randomString(11);
      this._css.scrollDownId = utils.randomString(11);

      $J('head').append(
        `<style>
          #${this._css.mainId},
          #${this._css.mainId} *,
          #${this._css.mainId} *::before,
          #${this._css.mainId} *::after {
            box-sizing: border-box;
            font-family: arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          #${this._css.mainId} {
            position: fixed;
            z-index: 9999999;
            right: 0;
            width: ${config.buttonsSize + 8}px;
            margin: 10px 0 10px 0;
            padding: 4px;
            border-radius: 6px 0 0 6px;
            background-color: #263238;
            box-shadow: 0 0 4px 2px rgba(255,255,255,.5);
          }
          #${this._css.wrapperId} {
            position: relative;
          }
          #${this._css.wrapperId}.${this._css.disabledClass} {
            pointer-events: none;
            opacity: 0.6;
          }
          #${this._css.buttonsId} {
            padding-right: 50px;
            margin-right: -50px;
            min-height: ${config.buttonsSize}px;
            overflow-x: hidden;
            overflow-y: scroll;
          }
          #${this._css.buttonsId} .${this._css.buttonClass}:not(:last-child) {
            margin-bottom: 2px;
          }
          #${this._css.buttonsId} .${this._css.buttonClass} {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            cursor: pointer;
            text-decoration: none;
            width: ${config.buttonsSize}px;
            height: ${config.buttonsSize}px;
            border-radius: 6px;
            background-color: #6c757d;
          }
          #${this._css.buttonsId} .${this._css.buttonClass}[data-done="1"] {
            background-color: rgba(118,158,107,.7);
          }
          #${this._css.buttonsId} .${this._css.buttonClass}[data-done="0"] {
            background-color: rgba(158,107,107,.7);
          }
          #${this._css.buttonsId} .${this._css.buttonContentClass} {
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            width: 30px;
            height: 30px;
            font-size: 14px;
            color: #f5f5f5;
            z-index: 1;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          #${this._css.buttonsId} .${this._css.spinnerClass} .${this._css.buttonContentClass} {
            display: none;
          }
          #${this._css.buttonsId} .${this._css.buttonClass}::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 6px;
            box-shadow: 0 0 2px 2px rgba(0,0,0,.15) inset, 0 0 6px rgba(0,0,0,.2) inset;
            background-color: transparent;
            transition: background-color .3s linear;
          }
          #${this._css.buttonsId} .${this._css.buttonClass}:not(.${this._css.disabledClass}):not(.${this._css.spinnerClass}):hover::after,
          #${this._css.buttonsId} .${this._css.buttonClass}:not(.${this._css.disabledClass}):not(.${this._css.spinnerClass}):focus::after {
            background-color: rgba(255,255,255,.12);
          }
          #${this._css.buttonsId} .${this._css.disabledClass},
          #${this._css.buttonsId} .${this._css.spinnerClass} {
            cursor: default;
            pointer-events: none;
          }
          #${this._css.buttonsId} .${this._css.disabledClass}:not(.${this._css.spinnerClass}) {
            opacity: 0.7;
          }
          #${this._css.buttonsId} .${this._css.spinnerClass}::before {
            content: '';
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top-color: #fff;
            z-index: 1;
            animation: ${this._css.spinnerKeyframe} .6s linear infinite;
          }
          @keyframes ${this._css.spinnerKeyframe} {
            to {
              transform: rotate(360deg);
            }
          }
          #${this._css.buttonsId} .${this._css.buttonContentClass} svg {
            width: 30px;
            height: 30px;
          }
          #${this._css.buttonsId} .${this._css.buttonContentClass} path {
            fill: #f5f5f5;
          }
          #${this._css.buttonsId} .${this._css.spinnerClass} svg {
            display: none;
          }
          #${this._css.buttonsId} .${this._css.progressClass} {
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            width: 0;
            background-color: rgba(234,131,30,.6);
            transition: width .3s linear;
          }
          #${this._css.moverId},
          #${this._css.resizerId} {
            display: block;
            border: 2px solid #777;
            border-radius: 2px;
          }
          #${this._css.moverId} {
            cursor: move;
            margin-bottom: 4px;
          }
          #${this._css.resizerId} {
            cursor: n-resize;
            margin-top: 4px;
          }
          #${this._css.scrollUpId},
          #${this._css.scrollDownId} {
            position: absolute;
            width: 100%;
            left: 0;
            line-height: 1;
            font-size: 12px;
            text-align: center;
            color: #dcdcdc;
            cursor: default;
            z-index: 1;
          }
          #${this._css.scrollUpId} {
            top: 0;
            background: linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,.4) 70%);
          }
          #${this._css.scrollDownId} {
            bottom: 0;
            background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.4) 70%);
          }
        </style>`
      );

      this._elements.main = $J(
        `<div id="${this._css.mainId}">
          <span id="${this._css.moverId}"></span>
          <div id="${this._css.wrapperId}">
            <div id="${this._css.buttonsId}"></div>
            <span id="${this._css.scrollUpId}">&#x2BC5;</span>
            <span id="${this._css.scrollDownId}">&#x2BC6;</span>
          </div>
          <span id="${this._css.resizerId}"></span>
        </div>`
      );

      this._elements.main.hide();
      this._elements.main.appendTo('body');

      this._elements.wrapper = $J(`#${this._css.wrapperId}`);
      this._elements.buttons = $J(`#${this._css.buttonsId}`);
      this._elements.mover = $J(`#${this._css.moverId}`);
      this._elements.resizer = $J(`#${this._css.resizerId}`);
      this._elements.scrollUp = $J(`#${this._css.scrollUpId}`);
      this._elements.scrollDown = $J(`#${this._css.scrollDownId}`);

      this.marginTop = parseInt(this._elements.main.css('margin-top'));
      this.marginBottom = parseInt(this._elements.main.css('margin-bottom'));

      this.position(state.position);
      this.maxHeight(state.maxHeight);

      const scroll = () => {
        this._elements.buttons.animate({
          scrollTop: this._scrollAmount
        }, 50, 'linear', () => {
          if (this._scrollAmount !== '') {
            scroll();
          }
        });
      };

      this._elements.scrollDown.on('mouseenter', () => {
        if (this._dragging || this._resizing) {
          return;
        }

        this._scrollAmount = '+=10';
        scroll();
      }).on('mouseleave', () => {
        this._scrollAmount = '';
      });

      this._elements.scrollUp.on('mouseenter', () => {
        if (this._dragging || this._resizing) {
          return;
        }

        this._scrollAmount = '-=10';
        scroll();
      }).on('mouseleave', () => {
        this._scrollAmount = '';
      });

      this._elements.mover.mousedown((e) => {
        if (e.which !== 1) {
          return;
        }

        e.preventDefault();

        this._dragging = true;
        this._mouseYOld = e.clientY;

        $J(document).mouseup(async () => {
          this._dragging = false;

          $J(document).off('mouseup');
          $J(document).off('mousemove');
        });

        $J(document).mousemove(async (e) => {
          e.preventDefault();

          this.position(this.position() - (this._mouseYOld - e.clientY));
          this._mouseYOld = e.clientY;
        });
      });

      this._elements.resizer.mousedown((e) => {
        if (e.which !== 1) {
          return;
        }

        e.preventDefault();

        this._resizing = true;
        this._mouseYOld = e.clientY;

        $J(document).mouseup(async () => {
          this._resizing = false;

          $J(document).off('mouseup');
          $J(document).off('mousemove');
        });

        $J(document).mousemove((e) => {
          e.preventDefault();

          const offset = this._mouseYOld - e.clientY;
          const butonsHeight = Math.ceil(this._elements.buttons.height());

          this._mouseYOld = e.clientY;

          if (offset < 0) {
            const butonsInnerHeight = Math.ceil(this._elements.buttons.innerHeight());
            const mainOuterHeight = Math.ceil(this._elements.main.outerHeight(true));
            const butonsScrollHeight = Math.ceil(this._elements.buttons.prop('scrollHeight'));

            if (butonsInnerHeight >= butonsScrollHeight) {
              return;
            }

            if (this.position() > $J(window).height() - mainOuterHeight) {
              return;
            }
          } else if (butonsHeight <= config.buttonsSize) {
            return;
          }

          const maxHeight = butonsHeight - offset < config.buttonsSize ? config.buttonsSize : butonsHeight - offset;

          if (parseInt(this.maxHeight()) === maxHeight) {
            return;
          }

          this.maxHeight(maxHeight);

          this._updateResizer();
          this._updateScroll();
          notifications.updatePosition();
        });
      });
    },
    async add(options) {
      const self = this;
      const button = {
        clickable: true,
        remove() {
          log.debug('button.remove()');

          switch (this.element.data('type')) {
            case 'steam-key': {
              const key = this.element.data('steamKey');

              if (key) {
                const idx = self._steamKeys.indexOf(key);

                if (idx !== -1) {
                  self._steamKeys.splice(idx, 1);
                }
              }

              break;
            }
            case 'steam-group': {
              const group = this.element.data('steamGroup');

              if (group) {
                const idx = self._steamGroups.indexOf(group);

                if (idx !== -1) {
                  self._steamGroups.splice(idx, 1);
                }
              }

              break;
            }
            case 'steam-app-wishlist': {
              const app = this.element.data('steamApp');

              if (app) {
                const idx = self._steamAppWishlist.indexOf(app);

                if (idx !== -1) {
                  self._steamAppWishlist.splice(idx, 1);
                }
              }

              break;
            }
            case 'steam-app-follow': {
              const app = this.element.data('steamApp');

              if (app) {
                const idx = self._steamAppFollow.indexOf(app);

                if (idx !== -1) {
                  self._steamAppFollow.splice(idx, 1);
                }
              }

              break;
            }
            case 'steam-app-add': {
              const app = this.element.data('steamApp');

              if (app) {
                const idx = self._steamAppAddToLibrary.indexOf(app);

                if (idx !== -1) {
                  self._steamAppAddToLibrary.splice(idx, 1);
                }
              }

              break;
            }
          }

          this.element.remove();
          self.count--;
          self.visible(self.count > 0);
        },
        color(color) {
          log.debug(`button.color("${color}")`);

          this.element.css('background-color', color);
        },
        enabled(value) {
          log.debug(`button.enabled(${value})`);

          if (typeof value === 'undefined') {
            return !this.element.hasClass(self._css.disabledClass);
          }

          if (value) {
            if (this.attr('data-working') || this.attr('data-not-enable') || !this.clickable) {
              return;
            }

            this.element.removeClass(self._css.disabledClass);
          } else {
            if (this.attr('data-cancellable') && !this.attr('data-cancelled')) {
              return;
            }

            this.element.addClass(self._css.disabledClass);
          }
        },
        content(content) {
          log.debug(`button.content("${content}")`);

          if (typeof content === 'undefined') {
            return this.element.children(`.${self._css.buttonContentClass}`).html();
          }

          this.element.children(`.${self._css.buttonContentClass}`).html(content);
        },
        attr(attr, value) {
          if (typeof value === 'undefined') {
            return this.element.attr(attr);
          } else if (value === '') {
            this.element.removeAttr(attr);
            return;
          }

          this.element.attr(attr, value);
        },
        title(value) {
          log.debug(`button.title("${value}")`);

          if (typeof value === 'undefined') {
            return this.attr('title');
          }

          this.attr('title', value);
        },
        progress(max, value) {
          let pr = this.element.children(`.${self._css.progressClass}`);

          if (!max) {
            if (pr.length) {
              log.debug(`button.progress() : remove`);

              pr.remove();
            }
            return;
          }

          if (!pr.length) {
            pr = $J(`<span class="${self._css.progressClass}"></span>`).appendTo(this.element);
          }

          log.debug(`button.progress(${max}, ${value})`);

          pr.css('width', `${(100 / max * value).toFixed(1)}%`);
        },
        spinner(show) {
          log.debug(`button.spinner(${show})`);

          if (typeof show === 'undefined') {
            return this.element.hasClass(self._css.spinnerClass);
          }

          if (show) {
            this.element.addClass(self._css.spinnerClass);
          } else {
            this.element.removeClass(self._css.spinnerClass);
          }
        },
        done(value) {
          this.element.attr('data-done', value ? '1' : '0');
        }
      };

      if (options.type === 'info') {
        let noti;

        options.content = icons.info2;
        options.title = i18n.get('useful-info');
        options.sticky = true;
        options.click = () => {
          if (noti && !noti.removed) {
            noti.remove();
            return;
          }

          noti = notifications.info(i18n.format(typeof options.info !== 'function' ? options.info : options.info()), {timeout: 0});
        };
      } else if (options.type === 'steam-key') {
        if (typeof options.steamKey !== 'string' || this.isSteamKeyAdded(options.steamKey)) {
          return false;
        }

        log.debug(`buttons.add() : steam-key button : ${options.steamKey}`);

        this._steamKeys.push(options.steamKey);

        options.title = i18n.get('steam-activate-key', {key: options.steamKey});
        options.content = icons.key;
        options.prepend = true;
        options.insertByType = true;
        options.data = {steamKey: options.steamKey};
        options.click = (p) => {
          steam.openKeyActivationPage(p.button.element.data('steamKey'));
        };
      } else if (options.type === 'steam-group') {
        if (!config.steamGroups || !options.steamGroup) {
          return false;
        }
        if (this.isSteamGroupAdded(options.steamGroup)) {
          return false;
        }
        if (!await steam.init()) {
          return false;
        }

        log.debug(`buttons.add() : steam-group button : ${options.steamGroup}`);

        let group = options.steamGroup;

        if (group.includes('/')) {
          let ext = steam.extractGroupName(group);

          if (!ext) {
            const res = await utils.resolveUrl(group);

            if (res === false) {
              return false;
            }

            group = res;
            ext = steam.extractGroupName(group);

            if (!ext) {
              log.debug(`buttons.add() : cannot extract group name : ${group}`);

              return false;
            }
          }

          group = ext;

          if (this.isSteamGroupAdded(group)) {
            return false;
          }

          this._steamGroups.push(options.steamGroup);
        }

        group = group.toLowerCase();

        this._steamGroups.push(group);

        options.data = {steamGroup: group};

        if (!steam.isJoinedGroup(group)) {
          options.done = false;
          options.title = i18n.get('steam-group-join', {group: group});
        } else {
          options.done = true;
          options.title = i18n.get('steam-group-leave', {group: group});
        }

        options.content = icons.group;
        options.click = (p) => {
          const group = p.button.element.data('steamGroup');

          if (p.event.ctrlKey) {
            steam.openGroupPage(group);
            return;
          }

          return new Promise(async (resolve) => {
            if (!steam.isJoinedGroup(group)) {
              if (await steam.joinGroup(group)) {
                button.done(true);
                button.title(i18n.get('steam-group-leave', {group: group}));
              }
            } else {
              if (await steam.leaveGroup(group)) {
                button.done(false);
                button.title(i18n.get('steam-group-join', {group: group}));
              }
            }

            resolve();
          });
        };
      } else if (options.type === 'steam-app-wishlist') {
        if (!config.steamAppWishlist ||
          !options.steamApp ||
          this.isSteamAppWishlistAdded(options.steamApp) ||
          steam.isAppOwned(options.steamApp)
        ) {
          return false;
        }
        if (!await steam.init()) {
          return false;
        }

        log.debug(`buttons.add() : steam-app-wishlist button : ${options.steamApp}`);

        let steamApp = options.steamApp;

        if (steamApp.includes('/')) {
          let ext = steam.extractAppId(steamApp);

          if (!ext) {
            const res = await utils.resolveUrl(steamApp);

            if (res === false) {
              return false;
            }

            steamApp = res;
            ext = steam.extractAppId(steamApp);

            if (!ext) {
              log.debug(`buttons.add() : cannot extract app id : ${steamApp}`);

              return false;
            }
          }

          steamApp = ext;

          if (this.isSteamAppWishlistAdded(steamApp)) {
            return false;
          }

          this._steamAppWishlist.push(options.steamApp);
        }

        if (steam.isAppOwned(steamApp)) {
          return false;
        }

        this._steamAppWishlist.push(steamApp);

        options.data = {steamApp: steamApp};

        if (!steam.isAppWishlisted(steamApp)) {
          options.done = false;
          options.title = i18n.get('steam-app-wishlist-add', {appId: steamApp});
        } else {
          options.done = true;
          options.title = i18n.get('steam-app-wishlist-remove', {appId: steamApp});
        }

        options.content = icons.wishlist;
        options.click = (p) => {
          const appId = p.button.element.data('steamApp');

          if (p.event.ctrlKey) {
            steam.openAppPage(appId);
            return;
          }

          return new Promise(async (resolve) => {
            if (!steam.isAppWishlisted(appId)) {
              if (await steam.addToWishlist(appId)) {
                button.done(true);
                button.title(i18n.get('steam-app-wishlist-remove', {appId: appId}));
              }
            } else {
              if (await steam.removeFromWishlist(appId)) {
                button.done(false);
                button.title(i18n.get('steam-app-wishlist-add', {appId: appId}));
              }
            }

            resolve();
          });
        };
      } else if (options.type === 'steam-app-follow') {
        if (!config.steamAppWishlist || !options.steamApp) {
          return false;
        }
        if (this.isSteamAppFollowAdded(options.steamApp)) {
          return false;
        }
        if (!await steam.init()) {
          return false;
        }

        log.debug(`buttons.add() : steam-app-follow button : ${options.steamApp}`);

        let steamApp = options.steamApp;

        if (steamApp.includes('/')) {
          let ext = steam.extractAppId(steamApp);

          if (!ext) {
            const res = await utils.resolveUrl(steamApp);

            if (res === false) {
              return false;
            }

            steamApp = res;
            ext = steam.extractAppId(steamApp);

            if (!ext) {
              log.debug(`buttons.add() : cannot extract app id : ${steamApp}`);

              return false;
            }
          }

          steamApp = ext;

          if (this.isSteamAppFollowAdded(steamApp)) {
            return false;
          }

          this._steamAppFollow.push(options.steamApp);
        }

        this._steamAppFollow.push(steamApp);

        options.data = {steamApp: steamApp};

        if (!steam.isAppFollowed(steamApp)) {
          options.done = false;
          options.title = i18n.get('steam-app-follow', {appId: steamApp});
        } else {
          options.done = true;
          options.title = i18n.get('steam-app-unfollow', {appId: steamApp});
        }

        options.content = icons.follow;
        options.click = (p) => {
          const appId = p.button.element.data('steamApp');

          if (p.event.ctrlKey) {
            steam.openAppPage(appId);
            return;
          }

          return new Promise(async (resolve) => {
            if (!steam.isAppFollowed(appId)) {
              if (await steam.followApp(appId)) {
                button.done(true);
                button.title(i18n.get('steam-app-follow', {appId: appId}));
              }
            } else {
              if (await steam.unfollowApp(appId)) {
                button.done(false);
                button.title(i18n.get('steam-app-unfollow', {appId: appId}));
              }
            }

            resolve();
          });
        };
      } else if (options.type === 'steam-app-add') {
        if (!config.steamAppAddToLibrary || !options.steamApp) {
          return false;
        }
        if (this.isSteamAppAddToLibraryAdded(options.steamApp)) {
          return false;
        }
        if (!await steam.init()) {
          return false;
        }

        log.debug(`buttons.add() : steam-app-add button : ${options.steamApp}`);

        let steamApp = options.steamApp;

        if (steamApp.includes('/')) {
          let ext = steam.extractAppId(steamApp);

          if (!ext) {
            const res = await utils.resolveUrl(steamApp);

            if (res === false) {
              return false;
            }

            steamApp = res;
            ext = steam.extractAppId(steamApp);

            if (!ext) {
              log.debug(`buttons.add() : cannot extract app id : ${steamApp}`);

              return false;
            }
          }

          steamApp = ext;

          if (this.isSteamAppAddToLibraryAdded(steamApp)) {
            return false;
          }

          this._steamAppAddToLibrary.push(options.steamApp);
        }

        this._steamAppAddToLibrary.push(steamApp);

        options.data = {steamApp: steamApp};

        if (steam.isAppOwned(steamApp)) {
          return false;
        }

        options.done = false;
        options.title = i18n.get('steam-app-add-to-library', {appId: steamApp});
        options.content = icons.library;
        options.click = (p) => {
          const appId = p.button.element.data('steamApp');

          if (p.event.ctrlKey) {
            steam.openAppPage(appId);
            return;
          }

          if (!steam.isAppOwned(steamApp)) {
            return new Promise(async (resolve) => {
              if (await steam.addToLibrary(appId)) {
                button.clickable = false;
                button.done(true);
              }

              resolve();
            });
          }
        };
      } else if (options.type === 'tasks') {
        log.debug('buttons.add() : tasks button');

        options.title = i18n.get('confirm-tasks');
        options.content = icons.checkmark;
        options.sticky = true;
        options.overlay = true;
        options.disable = true;
      }

      if (typeof options.click !== 'function') {
        return false;
      }

      this._init();

      const element = $J(
        `<a href="#" tabindex="0" class="${this._css.buttonClass}">
          <span class="${this._css.buttonContentClass}"></span>
        </a>`
      );

      if (typeof options.title !== 'undefined') {
        element.attr('title', options.title);
      }
      if (typeof options.color === 'string') {
        element.css('background-color', options.color);
      }
      if (typeof options.style === 'string') {
        element.attr('style', options.style);
      }
      if (typeof options.data === 'object') {
        element.data(options.data);
      }
      if (typeof options.content !== 'undefined') {
        element.children(`.${this._css.buttonContentClass}`).html(options.content);
      }
      if (typeof options.attr === 'object') {
        Object.keys(options.attr).forEach((key) => {
          element.attr(key, options.attr[key]);
        });
      }
      if (typeof options.done === 'boolean') {
        element.attr('data-done', options.done ? '1' : '0');
      }

      element.attr('data-type', options.type);
      element.data('button', button);

      if (options.sticky) {
        element.attr('data-sticky', '1');
        element.prependTo(this._elements.buttons);
      } else {
        if (typeof options.done === 'boolean') {
          if (options.done) {
            element.appendTo(this._elements.buttons);
          } else {
            const btns = this._elements.buttons.children(`[data-done="1"]`);

            if (btns.length) {
              element.insertBefore(btns.first());
            } else {
              element.appendTo(this._elements.buttons);
            }
          }
        } else {
          if (options.insertByType) {
            let btns = this._elements.buttons.children(`[data-type="${options.type}"]`);

            if (btns.length) {
              if (options.prependByType) {
                element.insertBefore(btns.first());
              } else {
                element.insertAfter(btns.last());
              }
            } else {
              if (options.prepend) {
                btns = this._elements.buttons.children('[data-sticky="1"]');

                if (btns.length) {
                  element.insertAfter(btns.last());
                } else {
                  element.prependTo(this._elements.buttons);
                }
              } else {
                element.appendTo(this._elements.buttons);
              }
            }
          } else {
            if (options.prepend) {
              const btns = this._elements.buttons.children(':not([data-sticky="1"])');

              if (btns.length) {
                element.insertBefore(btns.first());
              } else {
                element.prependTo(this._elements.buttons);
              }
            } else {
              element.appendTo(this._elements.buttons);
            }
          }
        }
      }

      button.element = element;

      const args = {
        button: button,
        self: options._self,
        site: state.site,
        matchedSelector: options._matchedSelector,
        matchedElement: options._matchedElement
      };

      element.on('click', async (e) => {
        e.preventDefault();

        if (!button.enabled() || !button.clickable) {
          return;
        }

        if (options.cancellable && args._working) {
          log.debug('cancelling click()...');

          button.attr('data-cancelled', '1');
          button.enabled(false);

          args.cancelled = true;

          return;
        }

        args.event = e;

        log.debug('calling click()...');

        let promise = false;

        try {
          const res = options.click(args);

          if (res instanceof Promise) {
            promise = true;

            button.attr('data-working', '1');

            if (options._button) {
              options._button._working = true;
            }
            if (options.overlay) {
              overlay.visible(true);
            }
            if (!options.cancellable) {
              button.enabled(false);
              button.spinner(true);
            } else {
              args._working = true;
              args._title = button.title();
              args._content = button.content();

              button.title(i18n.get('cancel'));
              button.content(icons.cancel);
              button.attr('data-cancellable', '1');
            }
            if (options.disable) {
              self.enabled(false);
            }

            await res;
          }
        } catch (e) {
          log.error('click() exception :', e);
        } finally {
          if (promise) {
            button.attr('data-working', '');

            if (options._button) {
              options._button._working = false;
            }
            if (options.overlay) {
              overlay.visible(false);
            }
            if (!options.cancellable) {
              button.spinner(false);
            } else {
              button.attr('data-cancelled', '');
              button.attr('data-cancellable', '');
              button.content(args._content);

              if (typeof args._title !== 'undefined') {
                button.title(args._title);
              } else {
                button.title('');
              }

              args._working = false;
              args.cancelled = false;
            }
            if (options.disable) {
              self.enabled(true);
            }

            button.enabled(true);
            button.progress();
          }

          log.debug('click() done');
        }
      });

      log.debug('buttons.add() : added');

      this.count++;
      this.visible(true);

      return button;
    },
    _updateHeightAndPosition() {
      const mainTop = this.position();
      const mainOuterHeight = this.outerHeight();
      const buttonsHeight = Math.ceil(this._elements.buttons.height());
      const winHeight = $J(window).height();
      const heightDiff = mainOuterHeight - buttonsHeight;

      if (mainTop > winHeight - mainOuterHeight - this.marginTop - this.marginBottom) {
        if (buttonsHeight > config.buttonsSize) {
          this.maxHeight(winHeight - mainTop - this.marginTop - this.marginBottom - heightDiff);
        } else {
          if (mainTop > this.marginTop) {
            this.position(winHeight - mainOuterHeight - this.marginTop - this.marginBottom);
          }
        }
      }
    },
    _updateResizer() {
      if (Math.ceil(this._elements.buttons.height()) <= config.buttonsSize
          && Math.ceil(this._elements.buttons.innerHeight()) >= Math.ceil(this._elements.buttons.prop('scrollHeight'))
      ) {
        this._elements.resizer.hide();
      } else {
        this._elements.resizer.show();
      }
    },
    _updateScroll() {
      const scrollTop = Math.ceil(this._elements.buttons.scrollTop());

      if (scrollTop + Math.ceil(this._elements.buttons.innerHeight()) >= Math.ceil(this._elements.buttons.prop('scrollHeight'))) {
        this._elements.scrollDown.hide();
      } else {
        this._elements.scrollDown.show();
      }

      if (scrollTop <= 0) {
        this._elements.scrollUp.hide();
      } else {
        this._elements.scrollUp.show();
      }
    },
    visible(value) {
      if (!this._elements.main) {
        return false;
      }

      if (typeof value === 'undefined') {
        return this._elements.main.is(':visible');
      }

      log.debug(`buttons.visible(${value})`);

      const updateAll = () => {
        this._updateResizer();
        this._updateScroll();
        this._updateHeightAndPosition();
        notifications.updatePosition();
      };

      const resizeHandler = () => {
        if ($J(window).height() === 0) {
          return;
        }

        updateAll();
      };

      if (value) {
        if (this._elements.main.is(':visible') !== value) {
          $J(window).on('resize', resizeHandler);

          this._elements.buttons.on('scroll', () => {
            this._updateScroll();
          });

          this._elements.main.fadeIn(400, 'swing');
        }

        updateAll();
      } else {
        $J(window).off('resize', resizeHandler);
        this._elements.buttons.off('scroll');
        this._elements.main.hide();
      }
    },
    position(top) {
      const current = parseInt(this._elements.main.css('top'));

      if (isNaN(top)) {
        return current;
      }

      const max = $J(window).height() - Math.ceil(this._elements.main.outerHeight(true));

      if (top < 0) {
        top = 0;
      }
      if (top > max) {
        top = max;
      }
      if (top === current) {
        return;
      }

      this._elements.main.css('top', `${top}px`);
      $GM.setValue('position', top);

      this._updateScroll();
      notifications.updatePosition();
    },
    maxHeight(height) {
      if (isNaN(height)) {
        return parseInt(this._elements.buttons.css('max-height'));
      }

      this._elements.buttons.css('max-height', `${height}px`);
      $GM.setValue('maxHeight', height);
    },
    outerHeight(includeMargin = false) {
      if (!this._elements.main) {
        return false;
      }

      return Math.ceil(this._elements.main.outerHeight(includeMargin));
    },
    outerWidth(includeMargin = false) {
      if (!this._elements.main) {
        return false;
      }

      return Math.ceil(this._elements.main.outerWidth(includeMargin));
    },
    enabled(value) {
      if (!this._elements.buttons) {
        return;
      }

      log.debug(`buttons.enabled(${value})`);

      this._elements.buttons.children(`.${this._css.buttonClass}`).each((i, el) => {
        const jel = $J(el);

        if (value) {
          jel.removeAttr('data-not-enable');
        } else {
          jel.attr('data-not-enable', '1');
        }

        jel.data('button').enabled(value);
      });
    },
    isSteamKeyAdded(key) {
      return this._steamKeys.indexOf(key) !== -1;
    },
    isSteamGroupAdded(group) {
      if (!group.includes('/')) {
        group = group.toLowerCase();
      }
      return this._steamGroups.indexOf(group) !== -1;
    },
    isSteamAppWishlistAdded(id) {
      return this._steamAppWishlist.indexOf(id) !== -1;
    },
    isSteamAppFollowAdded(id) {
      return this._steamAppFollow.indexOf(id) !== -1;
    },
    isSteamAppAddToLibraryAdded(id) {
      return this._steamAppAddToLibrary.indexOf(id) !== -1;
    }
  };

  const notifications = {
    type: {
      success: 'success',
      info: 'info',
      warning: 'warning',
      error: 'error'
    },
    _css: {},
    _init() {
      if (this._container) {
        return;
      }

      this._css.containerId = utils.randomString(11);
      this._css.notificationClass = utils.randomString(11);
      this._css.notificationIconClass = utils.randomString(11);
      this._css.notificationContentClass = utils.randomString(11);
      this._css.notificationTitleClass = utils.randomString(11);
      this._css.notificationMessageClass = utils.randomString(11);
      this._css.notificationClickableClass = utils.randomString(11);
      this._css.notificationSuccessClass = utils.randomString(11);
      this._css.notificationInfoClass = utils.randomString(11);
      this._css.notificationWarningClass = utils.randomString(11);
      this._css.notificationErrorClass = utils.randomString(11);
      this._css.notificationCloseClass = utils.randomString(11);

      $J('head').append(
        `<style>
          #${this._css.containerId},
          #${this._css.containerId} *,
          #${this._css.containerId} *::before,
          #${this._css.containerId} *::after {
            box-sizing: border-box;
            font-family: arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          #${this._css.containerId} {
            z-index: 9999999;
            position: fixed;
            right: 0;
            bottom: 0;
            margin: 0 10px 10px 0;
          }
          #${this._css.containerId} .${this._css.notificationClass} {
            display: flex;
            padding: 6px;
            border-radius: 6px;
            background-color: #263238;
            width: ${config.notifications.width}px;
            color: #f5f5f5;
            opacity: .9;
            border: 2px solid rgba(255,255,255,.3);
          }
          #${this._css.containerId} .${this._css.notificationClass}:not(:first-child) {
            margin-top: 10px;
          }
          #${this._css.containerId} .${this._css.notificationClass}:hover {
            opacity: 1;
          }
          #${this._css.containerId} .${this._css.notificationClickableClass}:hover {
            cursor: pointer;
          }
          #${this._css.containerId} .${this._css.notificationSuccessClass} {
            border: 2px solid rgba(98,224,71,.3);
          }
          #${this._css.containerId} .${this._css.notificationInfoClass} {
            border: 2px solid rgba(71,224,221,.3);
          }
          #${this._css.containerId} .${this._css.notificationWarningClass} {
            border: 2px solid rgba(224,216,71,.3);
          }
          #${this._css.containerId} .${this._css.notificationErrorClass} {
            border: 2px solid rgba(224,71,71,.3);
          }
          #${this._css.containerId} .${this._css.notificationSuccessClass} .${this._css.notificationIconClass} path {
            fill: #62e047;
          }
          #${this._css.containerId} .${this._css.notificationInfoClass} .${this._css.notificationIconClass} path {
            fill: #47e0dd;
          }
          #${this._css.containerId} .${this._css.notificationWarningClass} .${this._css.notificationIconClass} path {
            fill: #e0d847;
          }
          #${this._css.containerId} .${this._css.notificationErrorClass} .${this._css.notificationIconClass} path {
            fill: #e04747;
          }
          #${this._css.containerId} .${this._css.notificationIconClass} {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 6px;
            padding-right: 6px;
            border-right: 1px solid rgba(255,255,255,.4);
          }
          #${this._css.containerId} .${this._css.notificationIconClass} svg {
            width: 30px;
            height: 30px;
          }
          #${this._css.containerId} .${this._css.notificationContentClass} {
            flex-grow: 1;
            overflow: hidden;
          }
          #${this._css.containerId} .${this._css.notificationTitleClass} {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          #${this._css.containerId} .${this._css.notificationMessageClass} {
            font-size: 14px;
            font-weight: normal !important;
            line-height: 20px;
            overflow-wrap: break-word;
          }
          #${this._css.containerId} .${this._css.notificationMessageClass} li {
            font-weight: normal !important;
          }
          #${this._css.containerId} .${this._css.notificationClass} a {
            color: #ffa241;
            text-decoration: none;
          }
          #${this._css.containerId} .${this._css.notificationClass} a:hover {
            text-decoration: underline;
          }
          #${this._css.containerId} .${this._css.notificationClass} ul {
            padding-left: 16px;
            list-style: square outside;
          }
          #${this._css.containerId} .${this._css.notificationCloseClass} {
            display: flex;
            justify-content: center;
            align-items: center;
            float: right;
            cursor: pointer;
            width: 20px;
            height: 20px;
          }
          #${this._css.containerId} .${this._css.notificationCloseClass} svg {
            width: 100%;
            height: 100%;
          }
          #${this._css.containerId} .${this._css.notificationCloseClass} path {
            fill: rgba(255,255,255,.8);
            transition: fill .3s linear;
          }
          #${this._css.containerId} .${this._css.notificationCloseClass}:hover path {
            fill: #fff;
          }
        </style>`
      );

      this._container = $J(`<div id="${this._css.containerId}"></div>`).appendTo('body');
    },
    info(message, options) {
      if (!options) {
        options = {};
      }

      return this.add(Object.assign({}, options, {type: this.type.info, message: message}));
    },
    success(message, options) {
      if (!options) {
        options = {};
      }

      return this.add(Object.assign({}, options, {type: this.type.success, message: message}));
    },
    warning(message, options) {
      if (!options) {
        options = {};
      }

      return this.add(Object.assign({}, options, {type: this.type.warning, message: message}));
    },
    error(message, options) {
      if (!options) {
        options = {};
      }

      return this.add(Object.assign({}, options, {type: this.type.error, message: message}));
    },
    add(options) {
      if (typeof options !== 'object' || typeof options.message === 'undefined') {
        return;
      }

      log.debug('notifications.add()');

      const self = this;

      const noti = {
        _timer: null,
        element: null,
        removed: false,
        remove(timeout) {
          log.debug(`notification.remove(${timeout})`);

          if (timeout) {
            this._timer = setTimeout(() => {
              this._timer = null;
              this._timedOut = true;
              if (!this._hover) {
                this.remove();
              }
            }, timeout);
            return;
          } else if (this._timer) {
            clearTimeout(this._timer);
          }

          this.removed = true;
          this.element.fadeOut(400, 'swing', () => {
            this.element.remove();
            self.updatePosition();
          });
        },
        message(html) {
          log.debug(`notification.message("${html}")`);

          const el = this.element.find(`.${self._css.notificationMessageClass}`);

          if (typeof html === 'undefined') {
            return el.html();
          }

          el.html(html);
        }
      };

      this._init();

      noti.element = $J(
        `<div class="${this._css.notificationClass}">
          <span class="${this._css.notificationIconClass}"></span>
          <div class="${this._css.notificationContentClass}">
            <div class="${this._css.notificationTitleClass}">
              <span>Giveaway Companion</span>
              <span class="${this._css.notificationCloseClass}">${icons.close}</span>
            </div>
            <div class="${this._css.notificationMessageClass}">${options.message}</div>
          </div>
        </div>`
      );

      noti.element.hide();

      noti.element.data('notification', noti);

      switch (options.type) {
        case this.type.success:
          noti.element.addClass(this._css.notificationSuccessClass);
          noti.element.children(`.${this._css.notificationIconClass}`).html(icons.success);
          break;
        case this.type.warning:
          noti.element.addClass(this._css.notificationWarningClass);
          noti.element.children(`.${this._css.notificationIconClass}`).html(icons.warning);
          break;
        case this.type.error:
          noti.element.addClass(this._css.notificationErrorClass);
          noti.element.children(`.${this._css.notificationIconClass}`).html(icons.error);
          break;
        default:
          noti.element.addClass(this._css.notificationInfoClass);
          noti.element.children(`.${this._css.notificationIconClass}`).html(icons.info);
      }

      if (typeof options.click === 'function') {
        noti.element.on('click', (e) => {
          log.debug('calling notification.click()...');

          try {
            options.click({
              event: e,
              notification: noti
            });
          } catch (e) {
            log.error('notification.click() exception :', e);
          } finally {
            log.debug('notification.click() done');
          }
        });

        noti.element.addClass(this._css.notificationClickableClass);
      } else {
        const con = typeof options.closeOnClick !== 'undefined' ? options.closeOnClick : config.notifications.closeOnClick;

        if (con) {
          noti.element.on('click', (e) => {
            if (e.target.nodeName === 'A') {
              return;
            }

            noti.remove();
          });
          noti.element.addClass(this._css.notificationClickableClass);
        }
      }

      noti.element.on('mouseenter', () => {
        noti._hover = true;
      }).on('mouseleave', () => {
        noti._hover = false;

        if (noti._timedOut) {
          noti.remove(config.notifications.extendedTimeout);
        }
      });

      noti.element.find(`.${this._css.notificationCloseClass}`).on('click', () => {
        noti.remove();
      });

      const nots = this.getAll();

      if (nots.length >= config.notifications.maxCount) {
        if (config.notifications.newestOnTop) {
          nots[nots.length - 1].remove();
        } else {
          nots[0].remove();
        }
      }

      if (config.notifications.newestOnTop) {
        this._container.prepend(noti.element);
      } else {
        this._container.append(noti.element);
      }

      const timeout = typeof options.timeout === 'number' ? options.timeout : config.notifications.timeout;

      noti.element.fadeIn(400, 'swing', () => {
        if (timeout > 0) {
          noti.remove(timeout);
        }
      });

      this.updatePosition();

      return noti;
    },
    clear() {
      log.debug('notifications.clear()');

      const nots = this.getAll();

      for (const not of nots) {
        not.remove();
      }
    },
    getAll() {
      if (!this._container) {
        return [];
      }

      const nots = [];

      this._container.children().each((i, el) => {
        const obj = $J(el).data('notification');

        if (obj && !obj.removed) {
          nots.push(obj);
        }
      });

      return nots;
    },
    updatePosition() {
      if (!this._container || !buttons.visible()) {
        return;
      }

      if (buttons.position() + buttons.outerHeight(true) > $J(window).height() - Math.ceil(this._container.outerHeight(true))) {
        this._container.css('right', `${buttons.outerWidth()}px`);
      } else {
        this._container.css('right', 0);
      }
    }
  };

  const log = {
    debug(...args) {
      if (config.debug) {
        this._console('log', args);
      }
    },
    info(...args) {
      this._console('log', args);
    },
    warn(...args) {
      this._console('warn', args);
    },
    error(...args) {
      this._console('error', args);
    },
    _console(method, args) {
      const ar = Array.prototype.slice.call(args, 0);
      ar.unshift('GC ::');
      console[method](...ar);
    }
  };

  const $J = jQuery.noConflict(true);
  const $GM = {
    xmlHttpRequest(details) {
      return new Promise((resolve) => {
        details.timeout = 30000;
        details.onload = resolve;
        details.onerror = resolve;
        details.ontimeout = resolve;
        details.onabort = resolve;

        const func = typeof GM !== 'undefined' ? GM.xmlHttpRequest : GM_xmlhttpRequest;
        func(details);
      });
    },
    setValue: typeof GM !== 'undefined' ? GM.setValue : GM_setValue,
    getValue(...args) {
      if (typeof GM !== 'undefined') {
        return GM.getValue(...args);
      }

      return new Promise((resolve, reject) => {
        try {
          resolve(GM_getValue(...args));
        } catch (e) {
          reject(e);
        }
      });
    }
  };

  (async () => {
    const checkStringCondition = (variable, compare) => {
      if (typeof variable === 'string') {
        if (variable === compare) {
          return true;
        }
      } else if (variable instanceof RegExp) {
        if (variable.test(compare)) {
          return true;
        }
      } else if (Array.isArray(variable)) {
        for (const v of variable) {
          if (checkStringCondition(v, compare)) {
            return true;
          }
        }
      }

      return false;
    };

    const checkSite = async () => {
      const checkConditions = (obj, data) => {
        const checkElementCondition = (selector, setData) => {
          let res;

          if (selector.startsWith('!')) {
            res = $J(selector.substring(1)).length === 0;
          } else {
            res = $J(selector);

            if (res.length && setData && typeof data === 'object') {
              data.matchedSelector = selector;
              data.matchedElement = res;
            }

            res = res.length > 0;
          }

          return res;
        };

        if (typeof obj.check === 'function') {
          if (!obj.check({
            self: obj,
            site: state.site
          })) {
            return false;
          }
        }

        if (obj !== state.site) {
          if (typeof obj.host === 'string') {
            if (state.host !== obj.host) {
              return false;
            }
          } else if (obj.host instanceof RegExp) {
            if (!obj.host.test(state.host)) {
              return false;
            }
          } else if (Array.isArray(obj.host)) {
            let match = false;

            for (const host of obj.host) {
              if (state.host === host) {
                match = true;
                break;
              }
            }

            if (!match) {
              return false;
            }
          }
        }

        if (typeof obj.href !== 'undefined' && !checkStringCondition(obj.href, window.location.href)) {
          return false;
        }

        if (typeof obj.path !== 'undefined' && !checkStringCondition(obj.path, window.location.pathname)) {
          return false;
        }

        if (typeof obj.element === 'string' && !checkElementCondition(obj.element, true)) {
          return false;
        }

        if (Array.isArray(obj.elementOr)) {
          let match = false;

          for (const e of obj.elementOr) {
            match = checkElementCondition(e, true);
            if (match) {
              break;
            }
          }

          if (!match) {
            return false;
          }
        }

        if (Array.isArray(obj.elementAnd)) {
          for (const e of obj.elementAnd) {
            if (!checkElementCondition(e)) {
              return false;
            }
          }
        }

        return true;
      };

      const checkObject = async (object) => {
        if (typeof object !== 'object') {
          return;
        }

        const checkData = {};
        const checkResult = checkConditions(object, checkData);

        if (!checkResult) {
          const cleanObject = (obj) => {
            if (typeof obj.ready === 'function' && obj.readyMulticall) {
              obj._readyCalled = false;
            }

            if (Array.isArray(obj.buttons)) {
              for (const button of obj.buttons) {
                if (button._button && !button._working) {
                  button._button.remove();
                  delete button._button;
                }
              }
            }

            if (Array.isArray(obj.conditions)) {
              for (const condition of obj.conditions) {
                cleanObject(condition);
              }
            }
          };

          cleanObject(object);

          return;
        }

        if (typeof object.ready === 'function' && !object._readyCalled) {
          log.debug('calling ready()...');

          object._readyCalled = true;

          try {
            const res = object.ready({
              self: object,
              site: state.site,
              matchedSelector: checkData.matchedSelector,
              matchedElement: checkData.matchedElement
            });

            if (res instanceof Promise) {
              await res;
            }
          } catch (e) {
            log.error('ready() exception :', e);
          } finally {
            log.debug('ready() done');
          }
        }

        if (Array.isArray(object.buttons)) {
          for (const button of object.buttons) {
            if (button._button) {
              continue;
            }

            const options = Object.assign({}, button);

            options._matchedSelector = checkData.matchedSelector;
            options._matchedElement = checkData.matchedElement;
            options._self = object;
            options._button = button;

            button._button = await buttons.add(options);
          }
        }

        const getElementResult = (variable, method, callback) => {
          if (typeof variable === 'string') {
            let selector = checkData.matchedSelector ? variable.replace('{{element}}', checkData.matchedSelector) : variable;
            const match = selector.match(/(.+)(%|@)(.+)$/);

            if (match) {
              selector = match[1];
              method = match[2] + match[3];
            }

            const els = $J(selector);

            if (els.length) {
              const name = method.substring(1);

              if (method[0] === '%') {
                if (name === 'val') {
                  els.each((i, el) => {
                    callback($J(el).val());
                  });
                } else if (name === 'html') {
                  els.each((i, el) => {
                    callback($J(el).val());
                  });
                } else {
                  els.each((i, el) => {
                    callback($J(el).text());
                  });
                }
              } else {
                els.each((i, el) => {
                  callback($J(el).attr(name));
                });
              }
            }
          } else if (typeof variable === 'function') {
            const res = variable({
              self: object,
              site: state.site,
              matchedSelector: checkData.matchedSelector,
              matchedElement: checkData.matchedElement
            });

            if (typeof res === 'string' || Array.isArray(res)) {
              callback(res);
            }
          } else if (Array.isArray(variable)) {
            for (const v of variable) {
              getElementResult(v, method, callback);
            }
          }
        };

        if (!steam.initFailed && !object._steamTasksWorking && (
          (config.steamGroups && object.steamGroups) ||
          (config.steamAppWishlist && object.steamAppWishlist) ||
          (config.steamAppFollow && object.steamAppFollow) ||
          (config.steamAppAddToLibrary && object.steamAppAddToLibrary)
        )) {
          const groups = [];
          const wishlist = [];
          const follow = [];
          const library = [];

          if (object.steamGroups) {
            getElementResult(object.steamGroups, '@href', (res) => {
              if (!Array.isArray(res)) {
                res = [res];
              }

              for (const r of res) {
                if (r && !buttons.isSteamGroupAdded(r) && !utils.getResolvedUrl(r)) {
                  groups.push(r);
                }
              }
            });
          }

          if (object.steamAppWishlist) {
            getElementResult(object.steamAppWishlist, '@href', (res) => {
              if (!Array.isArray(res)) {
                res = [res];
              }

              for (const r of res) {
                if (r && !buttons.isSteamAppWishlistAdded(r) && !utils.getResolvedUrl(r)) {
                  wishlist.push(r);
                }
              }
            });
          }

          if (object.steamAppFollow) {
            getElementResult(object.steamAppFollow, '@href', (res) => {
              if (!Array.isArray(res)) {
                res = [res];
              }

              for (const r of res) {
                if (r && !buttons.isSteamAppFollowAdded(r) && !utils.getResolvedUrl(r)) {
                  follow.push(r);
                }
              }
            });
          }

          if (object.steamAppAddToLibrary) {
            getElementResult(object.steamAppAddToLibrary, '@href', (res) => {
              if (!Array.isArray(res)) {
                res = [res];
              }

              for (const r of res) {
                if (r && !buttons.isSteamAppAddToLibraryAdded(r) && !utils.getResolvedUrl(r)) {
                  library.push(r);
                }
              }
            });
          }

          if (groups.length || wishlist.length || follow.length || library.length) {
            object._steamTasksWorking = true;

            setTimeout(async () => {
              const noti = notifications.info(i18n.get('steam-loading-tasks'), {timeout: 0});
              const promises = [];

              for (const g of groups) {
                promises.push(buttons.add({
                  type: 'steam-group',
                  steamGroup: g
                }));
              }

              for (const w of wishlist) {
                promises.push(buttons.add({
                  type: 'steam-app-wishlist',
                  steamApp: w
                }));
              }

              for (const f of follow) {
                promises.push(buttons.add({
                  type: 'steam-app-follow',
                  steamApp: f
                }));
              }

              for (const l of library) {
                promises.push(buttons.add({
                  type: 'steam-app-add',
                  steamApp: l
                }));
              }

              await Promise.all(promises);

              noti.remove();

              object._steamTasksWorking = false;
            });
          }
        }

        if (typeof object.steamKeys !== 'undefined') {
          getElementResult(object.steamKeys, '%text', (res) => {
            const addButtons = (keys) => {
              if (!keys) {
                return;
              }

              for (const key of keys) {
                if (key) {
                  buttons.add({
                    type: 'steam-key',
                    steamKey: key
                  });
                }
              }
            };

            if (typeof res === 'string') {
              addButtons(steam.extractKeys(res));
            } else if (Array.isArray(res)) {
              for (const r of res) {
                addButtons(steam.extractKeys(r));
              }
            }
          });
        }

        if (Array.isArray(object.conditions)) {
          for (const condition of object.conditions) {
            await checkObject(condition);
          }
        }
      };

      await checkObject(state.site);

      setTimeout(checkSite, 1000);
    };

    if (window.location.href.includes('::entry_method')) {
      return;
    }

    for (const s of config.sites) {
      if (checkStringCondition(s.host, state.host)) {
        state.site = s;
        break;
      }
    }

    if (!state.site) {
      log.warn('site not found');

      return;
    }

    // If the site has overrided console, restore it
    if (state.site.console) {
      console = $J('<iframe style="display: none"></iframe>').appendTo('body').get(0).contentWindow.console;
    }

    const lang = navigator.language.replace(/-.+/, '').toLowerCase();

    if (typeof i18n.langs[lang] === 'object') {
      i18n.lang = i18n.langs[lang];
      i18n.code = lang;
    } else {
      i18n.lang = i18n.langs.default;
      i18n.code = 'default';
    }

    const oldVersion = await $GM.getValue('version', false);

    if (oldVersion) {
      // https://github.com/Rombecchi/version-compare
      const versionCompare = function(v1, v2, options) {
        const lexicographical = (options && options.lexicographical) || false;
        const zeroExtend = (options && options.zeroExtend) || true;
        let v1parts = (v1 || '0').split('.');
        let v2parts = (v2 || '0').split('.');

        const isValidPart = function(x) {
          return (lexicographical ? /^\d+[A-Za-zαß]*$/ : /^\d+[A-Za-zαß]?$/).test(x);
        };

        if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
          return NaN;
        }

        if (zeroExtend) {
          while (v1parts.length < v2parts.length) {
            v1parts.push('0');
          }

          while (v2parts.length < v1parts.length) {
            v2parts.push('0');
          }
        }

        if (!lexicographical) {
          v1parts = v1parts.map(function(x) {
            const match = /[A-Za-zαß]/.exec(x);
            return Number(match ? x.replace(match[0], '.' + x.charCodeAt(match.index)) : x);
          });

          v2parts = v2parts.map(function(x) {
            const match = /[A-Za-zαß]/.exec(x);
            return Number(match ? x.replace(match[0], '.' + x.charCodeAt(match.index)) : x);
          });
        }

        for (let i = 0; i < v1parts.length; ++i) {
          if (v2parts.length == i) {
            return 1;
          }

          if (v1parts[i] == v2parts[i]) {
            continue;
          } else if (v1parts[i] > v2parts[i]) {
            return 1;
          } else {
            return -1;
          }
        }

        if (v1parts.length != v2parts.length) {
          return -1;
        }

        return 0;
      };

      if (versionCompare(oldVersion, version.string) < 0) {
        notifications.info(i18n.get('gc-updated') + (version.changes[i18n.code] ? version.changes[i18n.code] : version.changes.default), {timeout: 0});
      }
    }

    $GM.setValue('version', version.string);

    state.position = await $GM.getValue('position', 240);
    state.maxHeight = await $GM.getValue('maxHeight', 206);

    log.info('start');

    checkSite();
  })();
})();
