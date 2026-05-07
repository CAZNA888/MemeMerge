(function () {
    "use strict";

    const ru = {
        base: {
            game_title: "Мем Бравл: Симулятор Слияния",
            loading: "Загрузка...",
            play: "Играть",
            close: "Закрыть",
            buy: "Купить",
            upgrade: "Улучшить",
            select: "Выбрать",
            selected: "Выбрано",
            cancel: "Отмена",
            ok: "ОК",
            yes: "Да",
            no: "Нет",
            free: "Бесплатно",
            reward: "Награда",
            claim: "Получить",
            skip: "Пропустить",
            price: "Цена",
            level: "Уровень",
            hp: "HP",
            damage: "Урон",
            crit: "Крит",
            coins: "Монеты",
            cups: "Кубки",
            progress_cubes: "Кубики",
            player: "Игрок",
            error: "Ошибка",
            unavailable: "Недоступно",
            not_enough_coins: "Недостаточно монет",
            ad_unavailable: "Реклама недоступна",
            save_error: "Не удалось сохранить прогресс",
            iap_price_rub_short: "руб."
        },
        menu: {
            battle: "БИТВА",
            battle_locked: "Битва через {time}",
            shop: "Магазин",
            profile: "Профиль",
            fighters: "Бойцы",
            upgrades: "Улучшения",
            leaderboard: "Лидеры",
            vip: "VIP",
            settings: "Настройки",
            box_progress: "Бокс",
            box_ad: "Бокс за рекламу",
            character_offer: "Оффер персонажа",
            buy_character: "Купить бойца"
        },
        profile: {
            title: "Профиль",
            clicks: "Клики",
            bought_characters: "Куплено персонажей",
            merges: "Соединения",
            opened_brawlers: "Открыто бойцов",
            opened_boxes: "Открыто боксов",
            matches: "Матчи",
            wins: "Победы",
            losses: "Поражения",
            play_time: "Время в игре"
        },
        settings: {
            title: "Настройки",
            music: "Музыка",
            sound: "Звуки",
            language: "Язык",
            community: "Сообщество",
            reduce_animations: "Экономия производительности",
            reduce_animations_hint: "Меньше анимаций и эффектов"
        },
        upgrades: {
            title: "Магазин улучшений",
            current_value: "Текущее значение",
            current_level: "Текущий уровень",
            inapps_tab: "Покупки",
            inapps_title: "Покупки в приложении",
            inapps_desc: "Скоро здесь появятся наборы и спецпредложения",
            coin_pack_title: "Пакет монет",
            upgrade_click_power: "Сила клика",
            upgrade_click_power_desc: "Увеличивает количество монет за клик",
            upgrade_critical_chance: "Шанс критического клика",
            upgrade_critical_chance_desc: "Увеличивает шанс получить критический клик",
            upgrade_passive_income: "Пассивный доход",
            upgrade_passive_income_desc: "Увеличивает доход монет в секунду"
        },
        fighters: {
            title: "Коллекция бойцов",
            locked: "Не открыт",
            owned: "Есть",
            choose_team: "Выбери 3 бойцов",
            merge_hint: "2 одинаковых бойца = следующий герой в цепочке"
        },
        battle: {
            title: "Битва",
            victory: "Победа!",
            defeat: "Поражение",
            reward_coins: "+{coins} монет",
            reward_cups: "+{cups} кубков",
            lose_cups: "{cups} кубков",
            continue: "Продолжить",
            revive_ad: "Возродиться за рекламу",
            difficulty_easy: "Лёгкий",
            difficulty_medium: "Средний",
            difficulty_hard: "Сложный",
            team_selection_title: "Выбор команды",
            team_selection_subtitle: "Выбери 2 или 3 бойцов",
            before_fight: "Перед боем",
            play: "Играть",
            refuse: "Отказаться",
            accept: "Принять",
            crit: "КРИТ",
            versus_players: "Игрок VS Игрок",
            players_ready: "Игроки готовы к бою",
            total_damage: "Общий урон: {value}",
            leave: "Закрыть"
        },
        tutorial: {
            buy_two_characters: "Купить бойца x2",
            merge_one_pair: "2 одинаковых бойца = следующий герой в цепочке",
            press_battle: "БИТВА",
            pick_first_three: "Выбери 3 бойцов",
            press_play: "Играть",
            press_accept: "Принять"
        },
        box: {
            opening_title: "Открытие бокса",
            opening_hint_collect: "Нажми, чтобы забрать награду",
            opening_hint_spin: "Крутится...",
            new_brawler: "Новый боец!",
            collect: "Забрать"
        },
        leaderboard: {
            title: "Таблица лидеров",
            rank: "Место",
            player: "Игрок",
            score: "Кубки",
            hidden_player: "Скрытый игрок",
            login_required: "Войдите, чтобы попасть в лидерборд"
        },
        vip: {
            title: "VIP",
            webstatus_forever: "VIP статус навсегда",
            status_active: "VIP активен",
            status_inactive: "VIP не куплен",
            benefit_income: "x2 доход",
            benefit_cooldown: "Битва",
            benefit_cooldown_line2: "в 5 раз быстрее",
            benefit_discount: "Покупка нового персонажа",
            benefit_discount_line2: "всегда 50",
            buy_vip: "Купить VIP"
        },
        brawlers: {
            brbrpatapim: "Брбр Патапим",
            combonagets: "Комбо Нагетс",
            doge_boss: "Доге Босс",
            doge_fee: "Доге Фи",
            fnaf: "ФНАФ",
            granny: "Гренни",
            gugugaga: "Гугу Гага",
            ski_bi_di_toilet: "Ски-Би Ди Туалет",
            ninja_capuchino: "Ниндзя Капучино",
            paragon: "Парагон",
            sagur: "Сагур",
            zhdun: "Ждун"
        }
    };

    function normalizeLanguageCode(rawLanguageCode) {
        if (!rawLanguageCode) {
            return "";
        }

        const normalized = String(rawLanguageCode).trim().toLowerCase().replace(/_/g, "-");
        const primary = normalized.split("-")[0] || "";
        return primary === "ru" ? "ru" : "ru";
    }

    function hasTranslationData(languageCode) {
        return normalizeLanguageCode(languageCode) === "ru";
    }

    function isLanguageSupported(languageCode) {
        return normalizeLanguageCode(languageCode) === "ru";
    }

    function resolveInitialLanguage() {
        return "ru";
    }

    window.Localization = { ru };
    window.GameLocalization = {
        normalizeLanguageCode,
        hasTranslationData,
        isLanguageSupported,
        resolveInitialLanguage
    };
}());
