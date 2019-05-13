// ==UserScript==
// @name Giveaway Companion
// @description Saves your time on games giveaway sites
// @description:ru Экономит ваше время на сайтах с раздачами игр
// @author longnull
// @namespace longnull
// @version 1.4
// @homepage https://github.com/longnull/GiveawayCompanion
// @supportURL https://github.com/longnull/GiveawayCompanion/issues
// @updateURL https://raw.githubusercontent.com/longnull/GiveawayCompanion/master/GiveawayCompanion.user.js
// @downloadURL https://raw.githubusercontent.com/longnull/GiveawayCompanion/master/GiveawayCompanion.user.js
// @match *://*.grabfreegame.com/giveaway/*
// @match *://*.bananagiveaway.com/giveaway/*
// @match *://*.gamingimpact.com/giveaway/*
// @match *://*.gamecode.win/giveaway/*
// @match *://*.gamezito.com/giveaway/*
// @match *://*.marvelousga.com/giveaway/*
// @match *://*.dupedornot.com/giveaway/*
// @match *://*.whosgamingnow.net/giveaway/*
// @match *://*.indiegala.com/profile
// @match *://*.orlygift.com/giveaway
// @match *://*.gamehag.com/*
// @match *://*.gamehunt.net/*
// @match *://*.gleam.io/*/*
// @match *://*.giveawayhopper.com/giveaway/*
// @match *://*.chubkeys.com/giveaway.php?id=*
// @match *://*.giveaway.su/giveaway/view/*
// @match *://*.keyjoker.com/*
// @connect steamcommunity.com
// @connect grabfreegame.com
// @connect bananagiveaway.com
// @connect gamingimpact.com
// @connect *
// @grant GM_setValue
// @grant GM.setValue
// @grant GM_getValue
// @grant GM.getValue
// @grant GM_xmlhttpRequest
// @grant GM.xmlHttpRequest
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

(async () => {
  'use strict';

  const version = {
    string: '1.4',
    changes: {
      default:
        `<ul>
          <li>Added support for <a href="https://www.keyjoker.com" target="_blank">keyjoker.com</a> (groups, keys).</li>
          <li>GiveawayHopper: updated for new design.</li>
          <li>Gamehag: added auto completion of survey tasks.</li>
          <li>Added notification about successful script update.</li>
        </ul>`,
      ru:
        `<ul>
          <li>Добавлена поддержка <a href="https://www.keyjoker.com" target="_blank">keyjoker.com</a> (группы, ключи).</li>
          <li>GiveawayHopper: обновлён под новый дизайн.</li>
          <li>Gamehag: добавлено автовыполнение анкетных заданий.</li>
          <li>Добавлено уведомление об успешном обновлении скрипта.</li>
        </ul>`
    }
  };

  const config = {
    // Output debug info into console
    debug: false,
    // Enable Steam groups functionality
    steamGroups: true,
    // Size of the buttons (pixels)
    buttonsSize: 40,
    notifications: {
      // Maximum number of notifications
      maxCount: 5,
      // Newest notifications on top
      newestOnTop: false,
      // Notifications width (pixels)
      width: 400,
      // How long the notification will display without user interaction (milliseconds, 0 - infinite, can be overridden)
      timeout: 10000,
      // How long the notification will display after the user moves the mouse out of timed out notification (milliseconds)
      extendedTimeout: 3000,
      // Close notification on click (can be overridden)
      closeOnClick: false
    },
    sites: [
      {
        host: ['grabfreegame.com', 'bananagiveaway.com', 'gamingimpact.com'],
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
        host: 'gamecode.win',
        element: 'a[href*="logout"]',
        steamKeys: ['#insertKey:visible:not(:empty)', 'div:has(h5:contains("Here is your key")) h5:last-child'],
        steamGroups: '.card-body a[href*="steamcommunity.com/groups/"]',
        conditions: [
          {
            element: '.card-body [id^="listOfTasks_btnVerify_"]:not(:contains("VERIFIED"))',
            buttons: [
              {
                type: 'tasks',
                cancellable: true,
                click(params) {
                  const tasks = $J(params.self.element);

                  log.debug(`tasks found : ${tasks.length}`);

                  if (tasks.length) {
                    return new Promise((resolve) => {
                      const click = () => {
                        log.debug(`${i + 1} : clicking...`);

                        $J(tasks.get(i)).prop('disabled', false).trigger('click');
                      };

                      const ajaxComplete = (e, xhr, settings) => {
                        if (settings.url.includes('/ajax/social/')) {
                          log.debug(`${i + 1} : ajaxComplete() : /ajax/social/`);

                          i++;
                          params.button.progress(tasks.length, i);

                          if (i >= tasks.length) {
                            log.debug('all tasks done');

                            unsafeWindow.$(document).unbind('ajaxComplete', ajaxComplete);
                            utils.scrollTo('#btnGetKey');
                            return resolve();
                          }

                          if (params.cancelled) {
                            log.debug('cancelled');

                            unsafeWindow.$(document).unbind('ajaxComplete', ajaxComplete);
                            return resolve();
                          }

                          click();
                        }
                      };

                      let i = 0;

                      unsafeWindow.$(document).ajaxComplete(ajaxComplete);

                      click();
                    });
                  }
                }
              }
            ]
          }
        ]
      },
      {
        host: ['gamezito.com', 'marvelousga.com', 'dupedornot.com'],
        element: '!a[href*="login"]',
        steamGroups: '.card-body a[href*="steamcommunity.com/groups/"]',
        steamKeys: ['#key_display_container:visible:not(:empty)', '#insertkey:visible:not(:empty)', '.card-body:contains("YOUR KEY"):visible', 'div:contains("already have a key"):visible'],
        conditions: [
          {
            elementAnd: ['.card-body:has(button[id^="task_"]:not([data-disabled]))', '#getKey:not(:visible)', '!.card-body:contains("YOUR KEY"):visible'],
            buttons: [
              {
                type: 'tasks',
                cancellable: true,
                click(params) {
                  const tasks = $J(params.self.elementAnd[0]);

                  log.debug(`tasks found : ${tasks.length}`);

                  if (tasks.length) {
                    return new Promise((resolve) => {
                      const completeTask = (task, verify = false) => {
                        let el = [];

                        if (!verify) {
                          log.debug(`${i + 1} : completeTask() : clicking action...`);

                          el = unsafeWindow.$(task).find('a[id^="task_"]');
                        }

                        if (!el.length) {
                          log.debug(`${i + 1} : completeTask() : clicking verify...`);

                          el = unsafeWindow.$(task).find('button[id^="task_"]');
                        }

                        if (el.length) {
                          el.trigger('click');
                        }
                      };

                      const ajaxComplete = (e, xhr, settings) => {
                        if (settings.url.includes('/ajax/verifyTasks/')) {
                          log.debug(`${i + 1} : ajaxComplete() : /ajax/verifyTasks/`);

                          if (params.cancelled) {
                            log.debug('cancelled');

                            unsafeWindow.$(document).unbind('ajaxComplete', ajaxComplete);
                            return resolve();
                          }

                          if (settings.url.includes('clickedLink')) {
                            log.debug(`${i + 1} : ajaxComplete() : /clickedLink`);

                            completeTask(tasks.get(i), true);
                          } else {
                            log.debug(`${i + 1} : ajaxComplete() : not /clickedLink`);

                            i++;
                            params.button.progress(tasks.length, i);

                            if (i >= tasks.length) {
                              log.debug('all tasks done');

                              unsafeWindow.$(document).unbind('ajaxComplete', ajaxComplete);
                              utils.scrollTo('#get_key_container');
                              return resolve();
                            }

                            completeTask(tasks.get(i));
                          }
                        }
                      };

                      let i = 0;

                      unsafeWindow.$(document).ajaxComplete(ajaxComplete);

                      completeTask(tasks.get(i));
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
        host: 'indiegala.com',
        element: '#profile_bundle_section',
        steamKeys: '[id^="serial_n_"]%val',
        ready(params) {
          $J(params.self.element).on('click', '.span-key:has([id^="serial_n_"]) img', (e) => {
            const key = $J(e.currentTarget).closest('[id^="serial_"]').find('[id^="serial_n_"]').val();

            if (key) {
              steam.openKeyActivationPage(key);
            }
          });

          $J('head').append(
              `<style>
                .span-key img[src*="steam-icon"] {
                  cursor: pointer;
                }
              </style>`
          );
        }
      },
      {
        host: 'orlygift.com',
        elementAnd: ['a[href*="logout"]', '#tasks li:not(.claimed)'],
        check(params) {
          params.self._scope = unsafeWindow.angular.element($J('#tasks .box').get(0)).scope();
          return typeof params.self._scope !== 'undefined';
        },
        ready(params) {
          const types = [
            'ad',
            'steam_curator',
            'link',
            'youtube',
            'orlydealz',
            'orlyaccess',
            'facebook_like',
            'facebook_share',
            'twitter_follow',
            'twitter_tweet'
          ];

          const tasks = [];

          for (const task of params.self._scope.taskController.tasks) {
            if (!task.claimed && types.indexOf(task.type) >= 0) {
              log.debug(`task found : ${task.id} : ${task.type} : ${task.description} : ${task.url}`);

              tasks.push(task);
            }
          }

          log.debug(`tasks found : ${tasks.length}`);

          if (tasks.length) {
            let i = 0;
            let verifying = false;
            let status;

            const completeTask = async () => {
              const task = tasks[i];
              if (!verifying) {
                log.debug(`${i + 1} : task verify : ${task.id} : ${task.type} : ${task.description} : ${task.url}`);

                if (task.type === 'link') {
                  try {
                    log.debug(`${i + 1} : task type is "link", making request : ${window.location.origin}/api/task/open/${task.id}`);

                    await $J.get(`${window.location.origin}/api/task/open/${task.id}`);

                    log.debug(`${i + 1} : request done`);
                  } catch (e) {}
                }

                params.self._scope.taskController.onVerify(task);
                status = task.status ? task.status.title : null;
                verifying = true;
              } else {
                if (task.status && task.status.title !== status) {
                  log.debug(`${i + 1} : task status changed, next task`);

                  i++;
                  verifying = false;

                  if (i === tasks.length) {
                    log.debug('all tasks done');

                    return;
                  }
                }
              }

              setTimeout(completeTask, 500);
            };

            completeTask();
          }
        }
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
                                const response = await $J.get(href);
                                const lnk = $J(response.content).find('.game-list .game-tile .game-name a');

                                if (lnk.length) {
                                  href = lnk.attr('href') + '/play';

                                  log.debug(`${i + 1} : completeTask() : it looks like a "play game" task, making "play" request : ${href}`);

                                  await $J.get(href);

                                  log.debug(`${i + 1} : completeTask() : "play" request done`);
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
        host: 'gamehunt.net',
        element: 'a[href*="logout"]',
        conditions: [
          {
            path: /^\/profile/,
            steamKeys: '.card-title',
            ready() {
              $J('.card-deck').on('click', '.card-img-top', (e) => {
                const key = steam.extractKeys($J(e.currentTarget).parent().find('.card-title').text());

                if (key) {
                  steam.openKeyActivationPage(key[0]);
                }
              });

              $J('head').append(
                  `<style>
                    .card-img-top {
                      cursor: pointer;
                    }
                  </style>`
              );
            }
          },
          {
            path: /^\/distribution\//,
            steamGroups: 'a.btn[href*="steamcommunity.com/groups/"]',
            steamKeys: '#info_res:visible'
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
          return typeof params.self._gleam !== 'undefined';
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
        }
      },
      {
        host: 'giveawayhopper.com',
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
                  // giveawayhopper makes synchronous requests and the page hangs when you click "verify" buttons,
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
        host: 'chubkeys.com',
        steamKeys: 'div:has(.fa-key) h4',
        steamGroups: '.collapse a[href*="steamcommunity.com/groups/"]'
      },
      {
        host: 'giveaway.su',
        element: 'a[href*="logout"]',
        steamKeys: '.giveaway-key input%val',
        steamGroups() {
          const groups = [];

          $J('#actions tr:has(.fa-steam)').each((i, el) => {
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
      }
    ]
  };

  // Icons from https://materialdesignicons.com
  const icons = {
    checkmark: '<svg viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>',
    key: '<svg viewBox="0 0 24 24"><path d="M7,14A2,2 0 0,1 5,12A2,2 0 0,1 7,10A2,2 0 0,1 9,12A2,2 0 0,1 7,14M12.65,10C11.83,7.67 9.61,6 7,6A6,6 0 0,0 1,12A6,6 0 0,0 7,18C9.61,18 11.83,16.33 12.65,14H17V18H21V14H23V10H12.65Z" /></svg>',
    steam: '<svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C7.4,22 3.55,18.92 2.36,14.73L6.19,16.31C6.45,17.6 7.6,18.58 8.97,18.58C10.53,18.58 11.8,17.31 11.8,15.75V15.62L15.2,13.19H15.28C17.36,13.19 19.05,11.5 19.05,9.42C19.05,7.34 17.36,5.65 15.28,5.65C13.2,5.65 11.5,7.34 11.5,9.42V9.47L9.13,12.93L8.97,12.92C8.38,12.92 7.83,13.1 7.38,13.41L2,11.2C2.43,6.05 6.73,2 12,2M8.28,17.17C9.08,17.5 10,17.13 10.33,16.33C10.66,15.53 10.28,14.62 9.5,14.29L8.22,13.76C8.71,13.58 9.26,13.57 9.78,13.79C10.31,14 10.72,14.41 10.93,14.94C11.15,15.46 11.15,16.04 10.93,16.56C10.5,17.64 9.23,18.16 8.15,17.71C7.65,17.5 7.27,17.12 7.06,16.67L8.28,17.17M17.8,9.42C17.8,10.81 16.67,11.94 15.28,11.94C13.9,11.94 12.77,10.81 12.77,9.42A2.5,2.5 0 0,1 15.28,6.91C16.67,6.91 17.8,8.04 17.8,9.42M13.4,9.42C13.4,10.46 14.24,11.31 15.29,11.31C16.33,11.31 17.17,10.46 17.17,9.42C17.17,8.38 16.33,7.53 15.29,7.53C14.24,7.53 13.4,8.38 13.4,9.42Z" /></svg>',
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
          str = str.replace(new RegExp(`{${item}}`, 'g'), vars[item]);
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
        'complete-tasks': 'Complete the tasks',
        'cancel': 'Cancel',
        'useful-info': 'Useful information',
        'reload-to-see-changes': '<a href="javascript:window.location.reload(false)">Reload</a> the page to see changes.',
        'steam-activate-key': 'Open Steam key activation page ({key})',
        'steam-loading-groups': 'Loading Steam groups...',
        'steam-group-join': 'Join Steam group "{group}" (Ctrl+Click - open the group in new tab)',
        'steam-group-leave': 'Leave Steam group "{group}" (Ctrl+Click - open the group in new tab)',
        'steam-init-request-failed': `Failed to load <a href="https://steamcommunity.com/my/groups" target="_blank">your groups</a>. <a href="https://steamcommunity.com" target="_blank">Steam Community</a> is probably down.`,
        'steam-join-group-request-failed': 'Failed to join group. <a href="https://steamcommunity.com" target="_blank">Steam Community</a> is probably down.',
        'steam-leave-group-request-failed': 'Failed to leave group. <a href="https://steamcommunity.com" target="_blank">Steam Community</a> is probably down.',
        'steam-join-group-failed': 'Failed to join group. <a href="https://steamcommunity.com" target="_blank">Steam Community</a> is experiencing some issues or you are not logged in.',
        'steam-leave-group-failed': 'Failed to leave group. <a href="https://steamcommunity.com" target="_blank">Steam Community</a> is experiencing some issues or you are not logged in.',
        'steam-not-logged': `It seems like you are not logged in to <a href="https://steamcommunity.com" target="_blank">Steam Community</a>.`,
        'gc-updated': `Giveaway Companion has been updated to version ${version.string}.<br><br><b>Changes:</b>`
      },
      ru: {
        'complete-tasks': 'Выполнить задания',
        'cancel': 'Отмена',
        'useful-info': 'Полезная информация',
        'reload-to-see-changes': '<a href="javascript:window.location.reload(false)">Обновите</a> страницу, чтобы увидеть изменения.',
        'steam-activate-key': 'Открыть страницу активации Steam ключа ({key})',
        'steam-loading-groups': 'Загрузка Steam групп...',
        'steam-group-join': 'Вступить в Steam группу "{group}" (Ctrl+Клик - открыть группу в новой вкладке)',
        'steam-group-leave': 'Выйти из Steam группы "{group}" (Ctrl+Клик - открыть группу в новой вкладке)',
        'steam-init-request-failed': `Не удалось загрузить <a href="https://steamcommunity.com/my/groups" target="_blank">ваши группы</a>. <a href="https://steamcommunity.com" target="_blank">Сообщество Steam</a>, возможно, неактивно.`,
        'steam-join-group-request-failed': 'Не удалось вступить в группу. <a href="https://steamcommunity.com" target="_blank">Сообщество Steam</a>, возможно, неактивно.',
        'steam-leave-group-request-failed': 'Не удалось выйти из группы. <a href="https://steamcommunity.com" target="_blank">Сообщество Steam</a>, возможно, неактивно.',
        'steam-join-group-failed': 'Не удалось вступить в группу. <a href="https://steamcommunity.com" target="_blank">Сообщество Steam</a> испытывает проблемы или вы не авторизованы.',
        'steam-leave-group-failed': 'Не удалось выйти из группы. <a href="https://steamcommunity.com" target="_blank">Сообщество Steam</a> испытывает проблемы или вы не авторизованы.',
        'steam-not-logged': `Похоже, вы не авторизованы в <a href="https://steamcommunity.com" target="_blank">Сообществе Steam</a>.`,
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
        method: 'HEAD',
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
    _processUrl: null,
    _userGroups: [],
    _idCache: {},
    _activateKeyUrl: 'https://store.steampowered.com/account/registerkey?key=',
    _userGroupsUrl: 'https://steamcommunity.com/my/groups',
    _groupUrl: 'https://steamcommunity.com/groups/',
    _groupRegex: /steamcommunity\.com\/groups\/([a-zA-Z0-9\-_]{2,32})/,
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

        const response = await $GM.xmlHttpRequest({
          method: 'GET',
          url: this._userGroupsUrl
        });

        if (response.status !== 200) {
          log.debug(`steam.init() : request failed : ${response.status}`);

          notifications.error(i18n.get('steam-init-request-failed'));

          this.initFailed = true;
          return resolve(false);
        }

        const responseDom = $J(response.responseText);
        const userUrl = responseDom.find('.friends_header_name a').attr('href');
        this._sessionId = response.responseText.match(/g_sessionID\s*=\s*"(.+?)"/);

        if (!userUrl || !this._sessionId) {
          log.debug('steam.init() : user data not found');

          notifications.error(i18n.get('steam-not-logged'));

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

      log.debug(`steam.joinGroup() : making request : ${this._groupUrl}${groupName}`);

      const response = await $GM.xmlHttpRequest({
        method: 'POST',
        url: this._groupUrl + groupName,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $J.param({action: 'join', sessionID: this._sessionId})
      });

      if (response.status !== 200) {
        log.debug(`steam.joinGroup() : request failed : ${response.status}`);

        notifications.error(i18n.get('steam-join-group-request-failed'));
        return false;
      }

      const responseDom = $J(response.responseText);

      if (responseDom.find('.grouppage_header_name').length && responseDom.find('a[href*="ConfirmLeaveGroup"]').length) {
        log.debug('steam.joinGroup() : joined');

        this._userGroups.push(groupName);
        return true;
      }

      notifications.error(i18n.get('steam-join-group-failed'));

      log.debug('steam.joinGroup() : not joined');

      return false;
    },
    async leaveGroup(groupName) {
      if (!config.steamGroups || !this._sessionId || !this._processUrl) {
        return false;
      }

      groupName = groupName.toLowerCase();

      log.debug(`steam.leaveGroup(${groupName})`);

      const id = await this.getGroupId(groupName);

      if (!id) {
        notifications.error(i18n.get('steam-leave-group-request-failed'));
        return false;
      }

      log.debug(`steam.leaveGroup() : making request : ${this._processUrl}`);

      const response = await $GM.xmlHttpRequest({
        method: 'POST',
        url: this._processUrl,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $J.param({action: 'leaveGroup', sessionID: this._sessionId, groupId: id})
      });

      if (response.status !== 200) {
        log.debug(`steam.leaveGroup() : request failed : ${response.status}`);

        notifications.error(i18n.get('steam-leave-group-request-failed'));
        return false;
      }

      if (response.finalUrl.includes('/groups') && !response.responseText.includes(id)) {
        log.debug('steam.leaveGroup() : left');

        const idx = this._userGroups.indexOf(groupName);

        if (idx !== -1) {
          this._userGroups.splice(idx, 1);
        }

        return true;
      }

      notifications.error(i18n.get('steam-leave-group-failed'));

      log.debug('steam.leaveGroup() : not left');

      return false;
    },
    async getGroupId(groupName) {
      if (!config.steamGroups) {
        return false;
      }

      log.debug(`steam.getGroupId(${groupName})`);

      groupName = groupName.toLowerCase();

      if (typeof this._idCache[groupName] !== 'undefined') {
        log.debug(`steam.getGroupId() : group id found in the cache : ${this._idCache[groupName]}`);

        return this._idCache[groupName];
      };

      log.debug(`steam.getGroupId() : making request : ${this._groupUrl}${groupName}`);

      const response = await $GM.xmlHttpRequest({
        method: 'GET',
        url: this._groupUrl + groupName
      });

      if (response.status !== 200) {
        log.debug(`steam.getGroupId() : request failed : ${response.status}`);

        return false;
      }

      const id = $J(response.responseText).find('input[name="groupId"]').val();

      if (!id) {
        log.debug('steam.getGroupId() : group id not found');

        return false;
      }

      log.debug(`steam.getGroupId() : group id found : ${id}`);

      this._idCache[groupName] = id;

      return id;
    },
    isJoinedGroup(groupName) {
      if (!config.steamGroups) {
        return false;
      }

      groupName = groupName.toLowerCase();
      return this._userGroups.indexOf(groupName) !== -1;
    }
  };

  const buttons = {
    colors: {
      default: '#6c757d',
      green: 'rgba(118,158,107,.7)',
      red: 'rgba(158,107,107,.7)'
    },
    count: 0,
    _elements: {},
    _css: {},
    _steamKeys: [],
    _steamGroups: [],
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
        remove() {
          log.debug('button.remove()');

          const group = this.element.data('steamGroup');

          if (group) {
            const idx = self._steamGroups.indexOf(group);

            if (idx !== -1) {
              self._steamGroups.splice(idx, 1);
            }
          } else {
            const key = this.element.data('steamKey');

            if (key) {
              const idx = self._steamKeys.indexOf(key);

              if (idx !== -1) {
                self._steamKeys.splice(idx, 1);
              }
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
            if (this.attr('data-working') || this.attr('data-not-enable')) {
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
          }

          if (!ext) {
            log.debug(`buttons.add() : cannot extract group name : ${group}`);

            return false;
          }

          group = ext;
          this._steamGroups.push(options.steamGroup);
        }

        group = group.toLowerCase();

        this._steamGroups.push(group);

        options.data = {steamGroup: group};

        if (!steam.isJoinedGroup(group)) {
          if (this._elements.buttons) {
            const btn = this._elements.buttons.find('[data-joined="1"]').first().data('button');

            if (btn) {
              options.insertBefore = btn;
            }
          }

          options.attr = {'data-joined': '0'};
          options.title = i18n.get('steam-group-join', {group: group});
          options.color = self.colors.red;
        } else {
          options.attr = {'data-joined': '1'};
          options.title = i18n.get('steam-group-leave', {group: group});
          options.color = self.colors.green;
        }

        options.content = icons.steam;
        options.click = (p) => {
          const group = p.button.element.data('steamGroup');

          if (p.event.ctrlKey) {
            steam.openGroupPage(group);
            return;
          }

          return new Promise(async (resolve) => {
            if (!steam.isJoinedGroup(group)) {
              if (await steam.joinGroup(group)) {
                button.color(self.colors.green);
                button.element.attr('data-joined', '1');
                button.title(i18n.get('steam-group-leave', {group: group}));
              }
            } else {
              if (await steam.leaveGroup(group)) {
                button.color(self.colors.red);
                button.element.attr('data-joined', '0');
                button.title(i18n.get('steam-group-join', {group: group}));
              }
            }

            resolve();
          });
        };
      } else if (options.type === 'tasks') {
        log.debug('buttons.add() : tasks button');

        options.title = i18n.get('complete-tasks');
        options.content = icons.checkmark;
        options.prepend = true;
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

      element.data('button', button);

      if (options.insertBefore) {
        element.insertBefore(options.insertBefore.element);
      } else {
        if (options.sticky) {
          element.attr('data-sticky', '1');
          element.prependTo(this._elements.buttons);
        } else {
          if (options.prepend) {
            const sticky = this._elements.buttons.find('[data-sticky="1"]');

            if (sticky.length) {
              element.insertAfter(sticky.last());
            } else {
              element.prependTo(this._elements.buttons);
            }
          } else {
            element.appendTo(this._elements.buttons);
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

        if (!button.enabled()) {
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

      if (value) {
        const updateAll = () => {
          this._updateResizer();
          this._updateScroll();
          this._updateHeightAndPosition();
          notifications.updatePosition();
        };

        if (this._elements.main.is(':visible') !== value) {
          $J(window).on('resize', () => {
            if ($J(window).height() === 0) {
              return;
            }

            updateAll();
          });

          this._elements.buttons.on('scroll', () => {
            this._updateScroll();
          });

          this._elements.main.fadeIn(400, 'swing');
        }

        updateAll();
      } else {
        $J(window).off('resize');
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
              font-weight: 700;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            #${this._css.containerId} .${this._css.notificationMessageClass} {
              font-size: 14px;
              overflow-wrap: break-word;
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

        if (config.steamGroups && !steam.initFailed && typeof object.steamGroups !== 'undefined' && !object._steamGroupsWorking) {
          const groups = [];

          getElementResult(object.steamGroups, '@href', (res) => {
            const addGroup = (group) => {
              if (group && !buttons.isSteamGroupAdded(group) && !utils.getResolvedUrl(group)) {
                groups.push(group);
              }
            };

            if (typeof res === 'string') {
              addGroup(res);
            } else if (Array.isArray(res)) {
              for (const r of res) {
                addGroup(r);
              }
            }
          });

          if (groups.length) {
            object._steamGroupsWorking = true;

            setTimeout(async () => {
              const noti = notifications.info(i18n.get('steam-loading-groups'), {timeout: 0});

              const promises = [];

              for (const g of groups) {
                promises.push(buttons.add({
                  type: 'steam-group',
                  steamGroup: g
                }));
              }

              await Promise.all(promises);

              noti.remove();

              object._steamGroupsWorking = false;
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
