# Giveaway Companion
## English description
This script adds useful features on sites with games giveaways. Allows you to quickly complete/skip tasks, join and leave Steam groups in one click, open Steam key activation page.

The script does not do subscriptions/reposts/likes on social networks, but such tasks can be completed automatically if they do not have validation, or if you have previously done the same task and did not cancel the subscription/repost/like.

The script bar looks something like this (the set of buttons depends on the site and page):  
<img src="images/script_bar.png" title="The script bar" alt="The script bar">

The script is inspired by [Giveaway Helper](https://github.com/Citrinate/giveawayHelper) and [GiveawayKiller](https://github.com/gekkedev/GiveawayKiller).

[Changelog](CHANGELOG.md)

**Disclaimer: the usage of this script may violate the Terms of Service of the sites it runs on. Use at your own risk.**

### Supported sites
<table>
    <thead>
        <tr><td rowspan="2" width="200"><strong>Site</strong></td><td colspan="4" align="center"><strong>Features</strong></td></tr>
        <tr><td align="center"><strong>Tasks</strong></td><td align="center"><strong>Groups</strong></td><td align="center"><strong>Keys</strong></td><td><strong>Other</strong></td></tr>
    </thead>
    <tbody>
        <tr><td>grabfreegame.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>bananagiveaway.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>gamingimpact.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>gamecode.win</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>gamezito.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>marvelousga.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>dupedornot.com</td><td align="center">✔</td><td align="center">✔*</td><td align="center">✔</td><td>* Most Steam groups are hidden behind URL shorteners, so not all groups will be processed</td></tr>
        <tr><td>whosgamingnow.net</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>gamehag.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>gamehunt.net</td><td></td><td align="center">✔</td><td align="center">✔</td><td>Opens Steam key activation page when you click a <a href="images/gamehunt_key_activation.png">game image</a> on <a href="https://gamehunt.net/profile">your profile page</a></td></tr>
        <tr><td>gleam.io</td><td></td><td align="center">✔</td><td align="center">✔</td><td>Sets tasks timer to zero</td></tr>
        <tr><td>indiegala.com</td><td></td><td></td><td align="center">✔</td><td>Opens Steam key activation page when you click <a href="images/indiegala_key_activation.png">Steam logo</a> next to a key on <a href="https://www.indiegala.com/profile">your profile page</a></td></tr>
        <tr><td>orlygift.com</td><td align="center">✔</td><td></td><td></td><td>Automatically "completes" tasks for visiting sites/reposts/likes when you visit a <a href="https://www.orlygift.com/giveaway">giveaway page</a></td></tr>
        <tr><td>giveawayhopper.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>chubkeys.com</td><td></td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>giveaway.su</td><td></td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
    </tbody>
</table>

### Installation
1. Install one of the browser extensions to run user scripts.  
   Tampermonkey: [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/) (old version, the latest version can be installed from the [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) using [this](https://addons.opera.com/en/extensions/details/install-chrome-extensions/) extension)  
   Violentmonkey: [Chrome](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/), [Maxthon](https://extension.maxthon.com/detail/index.php?view_id=1680)  
   Greasemonkey: [Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)  
2. Go [here](/../../raw/master/GiveawayCompanion.user.js).
3. Confirm installation of the script.

Automatic updating of the script may require your confirmation.

### Filters for uBlock Origin
Here are some filters for uBlock Origin ([Chrome](https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/), [Opera](https://addons.opera.com/en/extensions/details/ublock/)) that remove various annoying things on games giveaway sites.

| Site               | Filter                                                                           | Subscription   | Action
| :----------------- | :------------------------------------------------------------------------------- | :------------- | :-------------
| gamecode.win       | @@\|\|gamecode.win^$generichide                                                  | uBlock filters | Removes ad blocker warning
| gamecode.win       | gamecode.win##script:inject(abort-current-inline-script.js, $, openNewWindow)    | -              | Removes pop-up ads
| gamezito.com       | @@\|\|gamezito.com^$generichide                                                  | -              | Removes ad blocker warning
| marvelousga.com    | @@\|\|marvelousga.com^$generichide                                               | uBlock filters | Removes ad blocker warning
| marvelousga.com    | marvelousga.com##script:inject(abort-current-inline-script.js, $, openNewWindow) | uBlock filters | Removes pop-up ads
| indiegala.com      | indiegala.com###giveaway-social-cont                                             | -              | Removes a social block that overrides a giveaway block
| orlygift.com       | orlygift.com##script:inject(fuckadblock.js-3.2.0)                                | -              | Removes ad blocker warning
| orlygift.com       | orlygift.com##script:inject(abort-on-property-read.js, Bounceback.disabled)      | -              | Removes a pop-up invitation to Steam group
| gamehunt.net       | gamehunt.net##script:inject(abort-on-property-read.js, window.adblock)           | -              | Removes ad blocker warning

#### Filter list
Also, filters from the table are available as a [file](https://raw.githubusercontent.com/longnull/GiveawayCompanion/master/uBlockOrigin_filters.txt) that you can import into uBlock Origin and automatically receive updates.

**Importing the filter list into uBlock Origin**
1. Open uBlock Origin settings.
2. Go to "Filter lists" tab.
3. In "Custom" section, mark "Import..." checkbox.
4. In the appeared text field paste this address: https://raw.githubusercontent.com/longnull/GiveawayCompanion/master/uBlockOrigin_filters.txt
5. Click "Apply сhanges" button that appears at the top right.

***

## Русское описание
Данный скрипт добавляет полезные функции на сайтах с раздачами игр. Позволяет быстро выполнять/пропускать задания, вступать в Steam группы и выходить из них в один клик, переходить на страницу активации Steam ключа.

Скрипт не выполняет подписки/репосты/лайки в социальных сетях, но подобные задания могут быть выполнены автоматически, если они не имеют проверки или если вы раньше уже выполняли такое же задание и не отменили подписку/репост/лайк.

Панель скрипта выглядит примерно так (набор кнопок зависит от сайта и страницы):  
<img src="images/script_bar.png" title="Панель скрипта" alt="Панель скрипта">

Скрипт вдохновлён [Giveaway Helper](https://github.com/Citrinate/giveawayHelper) и [GiveawayKiller](https://github.com/gekkedev/GiveawayKiller).

[Список изменений](CHANGELOG.md#%D1%81%D0%BF%D0%B8%D1%81%D0%BE%D0%BA-%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B9)

**Отказ от ответственности: использование данного скрипта может нарушать правила сайтов, на которых он используется. Используйте на свой страх и риск.**

### Поддерживаемые сайты
<table>
    <thead>
        <tr><td rowspan="2" width="200"><strong>Сайт</strong></td><td colspan="4" align="center"><strong>Функции</strong></td></tr>
        <tr><td align="center"><strong>Задания</strong></td><td align="center"><strong>Группы</strong></td><td align="center"><strong>Ключи</strong></td><td><strong>Прочее</strong></td></tr>
    </thead>
    <tbody>
        <tr><td>grabfreegame.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>bananagiveaway.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>gamingimpact.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>gamecode.win</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>gamezito.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>marvelousga.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>dupedornot.com</td><td align="center">✔</td><td align="center">✔*</td><td align="center">✔</td><td>* Большинство Steam групп скрыты за сокращателями ссылок, поэтому не все группы будут обработаны</td></tr>
        <tr><td>whosgamingnow.net</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>gamehag.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>gamehunt.net</td><td></td><td align="center">✔</td><td align="center">✔</td><td>Переход на страницу активации Steam ключа при клике по <a href="images/gamehunt_key_activation.png">изображению игры</a> на <a href="https://gamehunt.net/profile">странице вашего профиля</a></td></tr>
        <tr><td>gleam.io</td><td></td><td align="center">✔</td><td align="center">✔</td><td>Установка таймера заданий в ноль</td></tr>
        <tr><td>indiegala.com</td><td></td><td></td><td align="center">✔</td><td>Переход на страницу активации Steam ключа при клике по <a href="images/indiegala_key_activation.png">логотипу Steam</a> рядом с ключом на <a href="https://www.indiegala.com/profile">странице вашего профиля</a></td></tr>
        <tr><td>orlygift.com</td><td align="center">✔</td><td></td><td></td><td>Автоматически "выполняет" задания на посещение сайтов/репосты/лайки при посещении страницы <a href="https://www.orlygift.com/giveaway">раздач</a></td></tr>
        <tr><td>giveawayhopper.com</td><td align="center">✔</td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>chubkeys.com</td><td></td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
        <tr><td>giveaway.su</td><td></td><td align="center">✔</td><td align="center">✔</td><td></td></tr>
    </tbody>
</table>

### Установка
1. Установить одно из браузерных расширений для выполнения пользовательских скриптов.  
   Tampermonkey: [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ru), [Firefox](https://addons.mozilla.org/ru/firefox/addon/tampermonkey/), [Opera](https://addons.opera.com/ru/extensions/details/tampermonkey-beta/) (старая версия, последнюю версию можно установить из [магазина Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ru) используя [данное](https://addons.opera.com/ru/extensions/details/install-chrome-extensions/) расширение)  
   Violentmonkey: [Chrome](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag?hl=ru), [Firefox](https://addons.mozilla.org/ru/firefox/addon/violentmonkey/), [Maxthon](https://extension.maxthon.com/detail/index.php?view_id=1680)  
   Greasemonkey: [Firefox](https://addons.mozilla.org/ru/firefox/addon/greasemonkey/))
2. Перейти [сюда](/../../raw/master/GiveawayCompanion.user.js).
3. Подтвердить установку скрипта.

При автоматическом обновлении скрипта может потребоваться ваше подтверждение.

### Фильтры для uBlock Origin
Вот несколько фильтров для uBlock Origin ([Chrome](https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm?hl=ru), [Firefox](https://addons.mozilla.org/ru/firefox/addon/ublock-origin/), [Opera](https://addons.opera.com/ru/extensions/details/ublock/)), которые удаляют разные назойливые штуки на сайтах с раздачами игр.

| Сайт               | Фильтр                                                                           | Подписка       | Действие
| :----------------- | :------------------------------------------------------------------------------- | :------------- | :-------------
| gamecode.win       | @@\|\|gamecode.win^$generichide                                                  | uBlock filters | Удаляет предупреждение о блокировщике рекламы
| gamecode.win       | gamecode.win##script:inject(abort-current-inline-script.js, $, openNewWindow)    | -              | Удаляет всплывающую рекламу
| gamezito.com       | @@\|\|gamezito.com^$generichide                                                  | -              | Удаляет предупреждение о блокировщике рекламы
| marvelousga.com    | @@\|\|marvelousga.com^$generichide                                               | uBlock filters | Удаляет предупреждение о блокировщике рекламы
| marvelousga.com    | marvelousga.com##script:inject(abort-current-inline-script.js, $, openNewWindow) | uBlock filters | Удаляет всплывающую рекламу
| indiegala.com      | indiegala.com###giveaway-social-cont                                             | -              | Удаляет социальный блок, который перекрывает блок раздачи
| orlygift.com       | orlygift.com##script:inject(fuckadblock.js-3.2.0)                                | -              | Удаляет предупреждение о блокировщике рекламы
| orlygift.com       | orlygift.com##script:inject(abort-on-property-read.js, Bounceback.disabled)      | -              | Удаляет всплывающее приглашение в Steam группу
| gamehunt.net       | gamehunt.net##script:inject(abort-on-property-read.js, window.adblock)           | -              | Удаляет предупреждение о блокировщике рекламы

#### Список фильтров
Также фильтры из таблицы доступны в виде [файла](https://raw.githubusercontent.com/longnull/GiveawayCompanion/master/uBlockOrigin_filters.txt), который можно импортировать в uBlock Origin и автоматически получать обновления.

**Импортирование списка фильтров в uBlock Origin**
1. Открыть настройки uBlock Origin.
2. Перейти на вкладку "Списки фильтров".
3. В разделе "Пользовательские" отметить галку "Импортировать...".
4. В появившееся текстовое поле вставить этот адрес: https://raw.githubusercontent.com/longnull/GiveawayCompanion/master/uBlockOrigin_filters.txt
5. Нажать появившуюся вверху справа кнопку "Применить изменения".