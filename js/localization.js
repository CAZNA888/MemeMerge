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
            total_damage: "Общий урон: {value}"
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

    const en = {
        base: {
            game_title: "Meme Brawl: Merge Simulator",
            loading: "Loading...",
            play: "Play",
            close: "Close",
            buy: "Buy",
            upgrade: "Upgrade",
            select: "Select",
            selected: "Selected",
            cancel: "Cancel",
            ok: "OK",
            yes: "Yes",
            no: "No",
            free: "Free",
            reward: "Reward",
            claim: "Claim",
            skip: "Skip",
            price: "Price",
            level: "Level",
            hp: "HP",
            damage: "Damage",
            crit: "Crit",
            coins: "Coins",
            cups: "Cups",
            progress_cubes: "Cubes",
            player: "Player",
            error: "Error",
            unavailable: "Unavailable",
            not_enough_coins: "Not enough coins",
            ad_unavailable: "Ad unavailable",
            save_error: "Could not save progress",
            iap_price_rub_short: "RUB"
        },
        menu: {
            battle: "BATTLE",
            battle_locked: "Battle in {time}",
            shop: "Shop",
            profile: "Profile",
            fighters: "Fighters",
            upgrades: "Upgrades",
            leaderboard: "Leaders",
            vip: "VIP",
            settings: "Settings",
            box_progress: "Box",
            box_ad: "Ad box",
            character_offer: "Character offer",
            buy_character: "Buy fighter"
        },
        profile: {
            title: "Profile",
            clicks: "Clicks",
            bought_characters: "Bought characters",
            merges: "Merges",
            opened_brawlers: "Opened brawlers",
            opened_boxes: "Opened boxes",
            matches: "Matches",
            wins: "Wins",
            losses: "Losses",
            play_time: "Play time"
        },
        settings: {
            title: "Settings",
            music: "Music",
            sound: "Sound",
            language: "Language",
            community: "Community",
            reduce_animations: "Performance mode",
            reduce_animations_hint: "Fewer animations and effects"
        },
        upgrades: {
            title: "Upgrade shop",
            current_value: "Current value",
            current_level: "Current level",
            inapps_tab: "In-apps",
            inapps_title: "In-app purchases",
            inapps_desc: "Bundles and special offers coming soon",
            coin_pack_title: "Coin pack",
            upgrade_click_power: "Click power",
            upgrade_click_power_desc: "Increases coins per click",
            upgrade_critical_chance: "Critical click chance",
            upgrade_critical_chance_desc: "Increases chance of critical click",
            upgrade_passive_income: "Passive income",
            upgrade_passive_income_desc: "Increases passive coins per second"
        },
        fighters: {
            title: "Fighter collection",
            locked: "Locked",
            owned: "Owned",
            choose_team: "Choose 3 fighters",
            merge_hint: "2 same fighters = next fighter in chain"
        },
        battle: {
            title: "Battle",
            victory: "Victory!",
            defeat: "Defeat",
            reward_coins: "+{coins} coins",
            reward_cups: "+{cups} cups",
            lose_cups: "{cups} cups",
            continue: "Continue",
            revive_ad: "Revive for ad",
            difficulty_easy: "Easy",
            difficulty_medium: "Medium",
            difficulty_hard: "Hard",
            team_selection_title: "Team selection",
            team_selection_subtitle: "Choose 2 or 3 fighters",
            before_fight: "Before battle",
            play: "Play",
            refuse: "Refuse",
            accept: "Accept",
            crit: "CRIT",
            versus_players: "Player VS Player",
            players_ready: "Players are ready to fight",
            total_damage: "Total damage: {value}"
        },
        box: {
            opening_title: "Box opening",
            opening_hint_collect: "Tap to collect reward",
            opening_hint_spin: "Spinning...",
            new_brawler: "New fighter!",
            collect: "Collect"
        },
        leaderboard: {
            title: "Leaderboard",
            rank: "Rank",
            player: "Player",
            score: "Cups",
            hidden_player: "Hidden player",
            login_required: "Sign in to join the leaderboard"
        },
        vip: {
            title: "VIP",
            webstatus_forever: "VIP status forever",
            status_active: "VIP active",
            status_inactive: "VIP not purchased",
            benefit_income: "x2 income",
            benefit_cooldown: "Battle",
            benefit_cooldown_line2: "5x faster",
            benefit_discount: "Buying a new character",
            benefit_discount_line2: "is always 50",
            buy_vip: "Buy VIP"
        },
        brawlers: {
            brbrpatapim: "Brbr Patapim",
            combonagets: "Combo Nuggets",
            doge_boss: "Doge Boss",
            doge_fee: "Doge Fee",
            fnaf: "FNAF",
            granny: "Granny",
            gugugaga: "Gugu Gaga",
            ski_bi_di_toilet: "Ski-Bi Di Toilet",
            ninja_capuchino: "Ninja Capuchino",
            paragon: "Paragon",
            sagur: "Sagur",
            zhdun: "Zhdun"
        }
    };

    const es = {
        base: { game_title: "Meme Brawl: Simulador de Fusión", loading: "Cargando...", play: "Jugar", close: "Cerrar", buy: "Comprar", upgrade: "Mejorar", select: "Seleccionar", selected: "Seleccionado", cancel: "Cancelar", ok: "OK", yes: "Sí", no: "No", free: "Gratis", reward: "Recompensa", claim: "Recoger", skip: "Saltar", price: "Precio", level: "Nivel", hp: "HP", damage: "Daño", crit: "Crítico", coins: "Monedas", cups: "Copas", progress_cubes: "Cubos", player: "Jugador", error: "Error", unavailable: "No disponible", not_enough_coins: "No hay suficientes monedas", ad_unavailable: "Anuncio no disponible", save_error: "No se pudo guardar el progreso" },
        menu: { battle: "BATALLA", battle_locked: "Batalla en {time}", shop: "Tienda", profile: "Perfil", fighters: "Luchadores", upgrades: "Mejoras", leaderboard: "Líderes", vip: "VIP", settings: "Ajustes", box_progress: "Caja", box_ad: "Caja por anuncio", character_offer: "Oferta de personaje", buy_character: "Comprar luchador" },
        profile: { title: "Perfil", clicks: "Clics", bought_characters: "Personajes comprados", merges: "Fusiones", opened_brawlers: "Luchadores obtenidos", opened_boxes: "Cajas abiertas", matches: "Partidas", wins: "Victorias", losses: "Derrotas", play_time: "Tiempo de juego" },
        settings: { title: "Ajustes", music: "Música", sound: "Sonido", language: "Idioma", community: "Comunidad", reduce_animations: "Modo rendimiento", reduce_animations_hint: "Menos animaciones y efectos" },
        upgrades: { title: "Tienda de mejoras", current_value: "Valor actual", current_level: "Nivel actual", inapps_tab: "Compras", inapps_title: "Compras integradas", inapps_desc: "Pronto habrá paquetes y ofertas especiales", coin_pack_title: "Paquete de monedas", upgrade_click_power: "Poder de clic", upgrade_click_power_desc: "Aumenta monedas por clic", upgrade_critical_chance: "Probabilidad de crítico", upgrade_critical_chance_desc: "Aumenta la probabilidad de clic crítico", upgrade_passive_income: "Ingreso pasivo", upgrade_passive_income_desc: "Aumenta monedas por segundo" },
        fighters: { title: "Colección de luchadores", locked: "Bloqueado", owned: "Disponible", choose_team: "Elige 3 luchadores", merge_hint: "2 luchadores iguales = siguiente en la cadena" },
        battle: { title: "Batalla", victory: "¡Victoria!", defeat: "Derrota", reward_coins: "+{coins} monedas", reward_cups: "+{cups} copas", lose_cups: "{cups} copas", continue: "Continuar", revive_ad: "Revivir por anuncio", difficulty_easy: "Fácil", difficulty_medium: "Medio", difficulty_hard: "Difícil", team_selection_title: "Selección de equipo", team_selection_subtitle: "Elige 2 o 3 luchadores", before_fight: "Antes de la batalla", play: "Jugar", refuse: "Rechazar", accept: "Aceptar", crit: "CRÍT", versus_players: "Jugador VS Jugador", players_ready: "Los jugadores están listos para luchar", total_damage: "Daño total: {value}" },
        box: { opening_title: "Apertura de caja", opening_hint_collect: "Toca para recoger la recompensa", opening_hint_spin: "Girando...", new_brawler: "¡Nuevo luchador!", collect: "Recoger" },
        leaderboard: { title: "Clasificación", rank: "Puesto", player: "Jugador", score: "Copas", hidden_player: "Jugador oculto", login_required: "Inicia sesión para aparecer en la clasificación" },
        vip: { title: "VIP", webstatus_forever: "Estado VIP para siempre", status_active: "VIP activo", status_inactive: "VIP no comprado", benefit_income: "x2 ingresos", benefit_cooldown: "Batalla", benefit_cooldown_line2: "5 veces más rápido", benefit_discount: "Comprar un personaje nuevo", benefit_discount_line2: "siempre cuesta 50", buy_vip: "Comprar VIP" },
        brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" }
    };

    const tr = {
        base: { game_title: "Meme Brawl: Birleştirme Simülatörü", loading: "Yükleniyor...", play: "Oyna", close: "Kapat", buy: "Satın al", upgrade: "Geliştir", select: "Seç", selected: "Seçildi", cancel: "İptal", ok: "Tamam", yes: "Evet", no: "Hayır", free: "Ücretsiz", reward: "Ödül", claim: "Al", skip: "Atla", price: "Fiyat", level: "Seviye", hp: "HP", damage: "Hasar", crit: "Kritik", coins: "Jeton", cups: "Kupa", progress_cubes: "Küp", player: "Oyuncu", error: "Hata", unavailable: "Kullanılamıyor", not_enough_coins: "Yetersiz jeton", ad_unavailable: "Reklam kullanılamıyor", save_error: "İlerleme kaydedilemedi" },
        menu: { battle: "SAVAŞ", battle_locked: "Savaş {time} içinde", shop: "Mağaza", profile: "Profil", fighters: "Savaşçılar", upgrades: "Yükseltmeler", leaderboard: "Liderler", vip: "VIP", settings: "Ayarlar", box_progress: "Kutu", box_ad: "Reklam kutusu", character_offer: "Karakter teklifi", buy_character: "Savaşçı satın al" },
        profile: { title: "Profil", clicks: "Tıklamalar", bought_characters: "Satın alınan karakterler", merges: "Birleştirmeler", opened_brawlers: "Açılan savaşçılar", opened_boxes: "Açılan kutular", matches: "Maçlar", wins: "Galibiyetler", losses: "Mağlubiyetler", play_time: "Oyun süresi" },
        settings: { title: "Ayarlar", music: "Müzik", sound: "Ses", language: "Dil", community: "Topluluk", reduce_animations: "Performans modu", reduce_animations_hint: "Daha az animasyon ve efekt" },
        upgrades: { title: "Yükseltme mağazası", current_value: "Mevcut değer", current_level: "Mevcut seviye", inapps_tab: "Uygulama içi", inapps_title: "Uygulama içi satın alımlar", inapps_desc: "Paketler ve özel teklifler yakında", coin_pack_title: "Jeton paketi", upgrade_click_power: "Tıklama gücü", upgrade_click_power_desc: "Tıklama başına jetonu artırır", upgrade_critical_chance: "Kritik şans", upgrade_critical_chance_desc: "Kritik tıklama şansını artırır", upgrade_passive_income: "Pasif gelir", upgrade_passive_income_desc: "Saniye başına pasif jetonu artırır" },
        fighters: { title: "Savaşçı koleksiyonu", locked: "Kilitli", owned: "Sahip", choose_team: "3 savaşçı seç", merge_hint: "2 aynı savaşçı = zincirde sonraki savaşçı" },
        battle: { title: "Savaş", victory: "Zafer!", defeat: "Yenilgi", reward_coins: "+{coins} jeton", reward_cups: "+{cups} kupa", lose_cups: "{cups} kupa", continue: "Devam et", revive_ad: "Reklamla canlan", difficulty_easy: "Kolay", difficulty_medium: "Orta", difficulty_hard: "Zor", team_selection_title: "Takım seçimi", team_selection_subtitle: "2 veya 3 savaşçı seç", before_fight: "Savaş öncesi", play: "Oyna", refuse: "Reddet", accept: "Kabul et", crit: "KRIT", versus_players: "Oyuncu VS Oyuncu", players_ready: "Oyuncular savaşa hazır", total_damage: "Toplam hasar: {value}" },
        box: { opening_title: "Kutu açılışı", opening_hint_collect: "Ödülü almak için dokun", opening_hint_spin: "Dönüyor...", new_brawler: "Yeni savaşçı!", collect: "Al" },
        leaderboard: { title: "Lider tablosu", rank: "Sıra", player: "Oyuncu", score: "Kupa", hidden_player: "Gizli oyuncu", login_required: "Lider tablosuna girmek için giriş yap" },
        vip: { title: "VIP", webstatus_forever: "Süresiz VIP durumu", status_active: "VIP aktif", status_inactive: "VIP satın alınmadı", benefit_income: "x2 gelir", benefit_cooldown: "Savaş", benefit_cooldown_line2: "5 kat daha hızlı", benefit_discount: "Yeni karakter satın alma", benefit_discount_line2: "her zaman 50", buy_vip: "VIP satın al" },
        brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" }
    };

    const de = {
        base: { game_title: "Meme Brawl: Merge Simulator", loading: "Wird geladen...", play: "Spielen", close: "Schließen", buy: "Kaufen", upgrade: "Verbessern", select: "Auswählen", selected: "Ausgewählt", cancel: "Abbrechen", ok: "OK", yes: "Ja", no: "Nein", free: "Kostenlos", reward: "Belohnung", claim: "Abholen", skip: "Überspringen", price: "Preis", level: "Level", hp: "HP", damage: "Schaden", crit: "Krit", coins: "Münzen", cups: "Pokale", progress_cubes: "Würfel", player: "Spieler", error: "Fehler", unavailable: "Nicht verfügbar", not_enough_coins: "Nicht genug Münzen", ad_unavailable: "Werbung nicht verfügbar", save_error: "Fortschritt konnte nicht gespeichert werden" },
        menu: { battle: "KAMPF", battle_locked: "Kampf in {time}", shop: "Shop", profile: "Profil", fighters: "Kämpfer", upgrades: "Upgrades", leaderboard: "Bestenliste", vip: "VIP", settings: "Einstellungen", box_progress: "Box", box_ad: "Werbe-Box", character_offer: "Charakterangebot", buy_character: "Kämpfer kaufen" },
        profile: { title: "Profil", clicks: "Klicks", bought_characters: "Gekaufte Charaktere", merges: "Fusionen", opened_brawlers: "Freigeschaltete Kämpfer", opened_boxes: "Geöffnete Boxen", matches: "Matches", wins: "Siege", losses: "Niederlagen", play_time: "Spielzeit" },
        settings: { title: "Einstellungen", music: "Musik", sound: "Ton", language: "Sprache", community: "Community", reduce_animations: "Leistungsmodus", reduce_animations_hint: "Weniger Animationen und Effekte" },
        upgrades: { title: "Upgrade-Shop", current_value: "Aktueller Wert", current_level: "Aktuelles Level", inapps_tab: "In-Apps", inapps_title: "In-App-Käufe", inapps_desc: "Pakete und Sonderangebote kommen bald", coin_pack_title: "Münzpaket", upgrade_click_power: "Klickstärke", upgrade_click_power_desc: "Erhöht Münzen pro Klick", upgrade_critical_chance: "Krit-Chance", upgrade_critical_chance_desc: "Erhöht die Chance auf kritischen Klick", upgrade_passive_income: "Passives Einkommen", upgrade_passive_income_desc: "Erhöht passive Münzen pro Sekunde" },
        fighters: { title: "Kämpfer-Sammlung", locked: "Gesperrt", owned: "Besitzt", choose_team: "Wähle 3 Kämpfer", merge_hint: "2 gleiche Kämpfer = nächster Kämpfer in der Kette" },
        battle: { title: "Kampf", victory: "Sieg!", defeat: "Niederlage", reward_coins: "+{coins} Münzen", reward_cups: "+{cups} Pokale", lose_cups: "{cups} Pokale", continue: "Weiter", revive_ad: "Per Werbung wiederbeleben", difficulty_easy: "Leicht", difficulty_medium: "Mittel", difficulty_hard: "Schwer", team_selection_title: "Teamauswahl", team_selection_subtitle: "Wähle 2 oder 3 Kämpfer", before_fight: "Vor dem Kampf", play: "Spielen", refuse: "Ablehnen", accept: "Annehmen", crit: "KRIT", versus_players: "Spieler VS Spieler", players_ready: "Spieler sind kampfbereit", total_damage: "Gesamtschaden: {value}" },
        box: { opening_title: "Box-Öffnung", opening_hint_collect: "Tippen, um Belohnung abzuholen", opening_hint_spin: "Dreht...", new_brawler: "Neuer Kämpfer!", collect: "Abholen" },
        leaderboard: { title: "Bestenliste", rank: "Rang", player: "Spieler", score: "Pokale", hidden_player: "Versteckter Spieler", login_required: "Melde dich an, um in die Bestenliste zu kommen" },
        vip: { title: "VIP", webstatus_forever: "VIP-Status für immer", status_active: "VIP aktiv", status_inactive: "VIP nicht gekauft", benefit_income: "x2 Einkommen", benefit_cooldown: "Kampf", benefit_cooldown_line2: "5x schneller", benefit_discount: "Neuen Charakter kaufen", benefit_discount_line2: "kostet immer 50", buy_vip: "VIP kaufen" },
        brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" }
    };

    const fr = {
        base: { game_title: "Meme Brawl: Simulateur de Fusion", loading: "Chargement...", play: "Jouer", close: "Fermer", buy: "Acheter", upgrade: "Améliorer", select: "Sélectionner", selected: "Sélectionné", cancel: "Annuler", ok: "OK", yes: "Oui", no: "Non", free: "Gratuit", reward: "Récompense", claim: "Récupérer", skip: "Passer", price: "Prix", level: "Niveau", hp: "HP", damage: "Dégâts", crit: "Crit", coins: "Pièces", cups: "Coupes", progress_cubes: "Cubes", player: "Joueur", error: "Erreur", unavailable: "Indisponible", not_enough_coins: "Pas assez de pièces", ad_unavailable: "Publicité indisponible", save_error: "Impossible de sauvegarder la progression" },
        menu: { battle: "BATAILLE", battle_locked: "Bataille dans {time}", shop: "Boutique", profile: "Profil", fighters: "Combattants", upgrades: "Améliorations", leaderboard: "Classement", vip: "VIP", settings: "Paramètres", box_progress: "Boîte", box_ad: "Boîte pub", character_offer: "Offre de personnage", buy_character: "Acheter un combattant" },
        profile: { title: "Profil", clicks: "Clics", bought_characters: "Personnages achetés", merges: "Fusions", opened_brawlers: "Combattants débloqués", opened_boxes: "Boîtes ouvertes", matches: "Matchs", wins: "Victoires", losses: "Défaites", play_time: "Temps de jeu" },
        settings: { title: "Paramètres", music: "Musique", sound: "Son", language: "Langue", community: "Communauté", reduce_animations: "Mode performance", reduce_animations_hint: "Moins d'animations et d'effets" },
        upgrades: { title: "Boutique d'améliorations", current_value: "Valeur actuelle", current_level: "Niveau actuel", inapps_tab: "Achats intégrés", inapps_title: "Achats intégrés", inapps_desc: "Packs et offres spéciales bientôt disponibles", coin_pack_title: "Pack de pièces", upgrade_click_power: "Puissance de clic", upgrade_click_power_desc: "Augmente les pièces par clic", upgrade_critical_chance: "Chance critique", upgrade_critical_chance_desc: "Augmente la chance de clic critique", upgrade_passive_income: "Revenu passif", upgrade_passive_income_desc: "Augmente les pièces passives par seconde" },
        fighters: { title: "Collection de combattants", locked: "Verrouillé", owned: "Possédé", choose_team: "Choisis 3 combattants", merge_hint: "2 combattants identiques = le suivant dans la chaîne" },
        battle: { title: "Bataille", victory: "Victoire !", defeat: "Défaite", reward_coins: "+{coins} pièces", reward_cups: "+{cups} coupes", lose_cups: "{cups} coupes", continue: "Continuer", revive_ad: "Revivre via pub", difficulty_easy: "Facile", difficulty_medium: "Moyen", difficulty_hard: "Difficile", team_selection_title: "Sélection d'équipe", team_selection_subtitle: "Choisis 2 ou 3 combattants", before_fight: "Avant la bataille", play: "Jouer", refuse: "Refuser", accept: "Accepter", crit: "CRIT", versus_players: "Joueur VS Joueur", players_ready: "Les joueurs sont prêts au combat", total_damage: "Dégâts totaux : {value}" },
        box: { opening_title: "Ouverture de boîte", opening_hint_collect: "Touchez pour récupérer la récompense", opening_hint_spin: "Rotation...", new_brawler: "Nouveau combattant !", collect: "Récupérer" },
        leaderboard: { title: "Classement", rank: "Rang", player: "Joueur", score: "Coupes", hidden_player: "Joueur masqué", login_required: "Connecte-toi pour apparaître dans le classement" },
        vip: { title: "VIP", webstatus_forever: "Statut VIP à vie", status_active: "VIP actif", status_inactive: "VIP non acheté", benefit_income: "x2 revenus", benefit_cooldown: "Bataille", benefit_cooldown_line2: "5x plus rapide", benefit_discount: "Achat d'un nouveau personnage", benefit_discount_line2: "coûte toujours 50", buy_vip: "Acheter VIP" },
        brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" }
    };

    const it = {
        base: { game_title: "Meme Brawl: Simulatore di Fusione", loading: "Caricamento...", play: "Gioca", close: "Chiudi", buy: "Compra", upgrade: "Migliora", select: "Seleziona", selected: "Selezionato", cancel: "Annulla", ok: "OK", yes: "Sì", no: "No", free: "Gratis", reward: "Ricompensa", claim: "Riscatta", skip: "Salta", price: "Prezzo", level: "Livello", hp: "HP", damage: "Danno", crit: "Critico", coins: "Monete", cups: "Coppe", progress_cubes: "Cubi", player: "Giocatore", error: "Errore", unavailable: "Non disponibile", not_enough_coins: "Monete insufficienti", ad_unavailable: "Annuncio non disponibile", save_error: "Impossibile salvare i progressi" },
        menu: { battle: "BATTAGLIA", battle_locked: "Battaglia tra {time}", shop: "Negozio", profile: "Profilo", fighters: "Lottatori", upgrades: "Potenziamenti", leaderboard: "Classifica", vip: "VIP", settings: "Impostazioni", box_progress: "Cassa", box_ad: "Cassa con annuncio", character_offer: "Offerta personaggio", buy_character: "Compra lottatore" },
        profile: { title: "Profilo", clicks: "Clic", bought_characters: "Personaggi acquistati", merges: "Fusioni", opened_brawlers: "Lottatori ottenuti", opened_boxes: "Casse aperte", matches: "Partite", wins: "Vittorie", losses: "Sconfitte", play_time: "Tempo di gioco" },
        settings: { title: "Impostazioni", music: "Musica", sound: "Audio", language: "Lingua", community: "Comunità", reduce_animations: "Modalità prestazioni", reduce_animations_hint: "Meno animazioni ed effetti" },
        upgrades: { title: "Negozio potenziamenti", current_value: "Valore attuale", current_level: "Livello attuale", inapps_tab: "Acquisti", inapps_title: "Acquisti in-app", inapps_desc: "Pacchetti e offerte speciali in arrivo", coin_pack_title: "Pacchetto monete", upgrade_click_power: "Potenza clic", upgrade_click_power_desc: "Aumenta monete per clic", upgrade_critical_chance: "Probabilità critica", upgrade_critical_chance_desc: "Aumenta la probabilità di clic critico", upgrade_passive_income: "Entrata passiva", upgrade_passive_income_desc: "Aumenta le monete passive al secondo" },
        fighters: { title: "Collezione lottatori", locked: "Bloccato", owned: "Posseduto", choose_team: "Scegli 3 lottatori", merge_hint: "2 lottatori uguali = prossimo nella catena" },
        battle: { title: "Battaglia", victory: "Vittoria!", defeat: "Sconfitta", reward_coins: "+{coins} monete", reward_cups: "+{cups} coppe", lose_cups: "{cups} coppe", continue: "Continua", revive_ad: "Rianima con annuncio", difficulty_easy: "Facile", difficulty_medium: "Medio", difficulty_hard: "Difficile", team_selection_title: "Selezione squadra", team_selection_subtitle: "Scegli 2 o 3 lottatori", before_fight: "Prima della battaglia", play: "Gioca", refuse: "Rifiuta", accept: "Accetta", crit: "CRIT", versus_players: "Giocatore VS Giocatore", players_ready: "I giocatori sono pronti a combattere", total_damage: "Danno totale: {value}" },
        box: { opening_title: "Apertura cassa", opening_hint_collect: "Tocca per riscattare la ricompensa", opening_hint_spin: "Sta girando...", new_brawler: "Nuovo lottatore!", collect: "Riscatta" },
        leaderboard: { title: "Classifica", rank: "Posizione", player: "Giocatore", score: "Coppe", hidden_player: "Giocatore nascosto", login_required: "Accedi per entrare in classifica" },
        vip: { title: "VIP", webstatus_forever: "Stato VIP per sempre", status_active: "VIP attivo", status_inactive: "VIP non acquistato", benefit_income: "x2 entrate", benefit_cooldown: "Battaglia", benefit_cooldown_line2: "5 volte più veloce", benefit_discount: "Acquisto nuovo personaggio", benefit_discount_line2: "costa sempre 50", buy_vip: "Compra VIP" },
        brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" }
    };

    const ar = {
        base: { game_title: "Meme Brawl: محاكي الدمج", loading: "جار التحميل...", play: "لعب", close: "إغلاق", buy: "شراء", upgrade: "ترقية", select: "اختيار", selected: "محدد", cancel: "إلغاء", ok: "حسنًا", yes: "نعم", no: "لا", free: "مجاني", reward: "مكافأة", claim: "استلام", skip: "تخطي", price: "السعر", level: "المستوى", hp: "HP", damage: "الضرر", crit: "حرج", coins: "عملات", cups: "كؤوس", progress_cubes: "مكعبات", player: "لاعب", error: "خطأ", unavailable: "غير متاح", not_enough_coins: "عملات غير كافية", ad_unavailable: "الإعلان غير متاح", save_error: "تعذر حفظ التقدم" },
        menu: { battle: "معركة", battle_locked: "المعركة خلال {time}", shop: "المتجر", profile: "الملف الشخصي", fighters: "المقاتلون", upgrades: "الترقيات", leaderboard: "لوحة الصدارة", vip: "VIP", settings: "الإعدادات", box_progress: "صندوق", box_ad: "صندوق إعلان", character_offer: "عرض شخصية", buy_character: "شراء مقاتل" },
        profile: { title: "الملف الشخصي", clicks: "النقرات", bought_characters: "شخصيات مشتراة", merges: "الدمج", opened_brawlers: "مقاتلون مفتوحون", opened_boxes: "صناديق مفتوحة", matches: "المباريات", wins: "الانتصارات", losses: "الهزائم", play_time: "وقت اللعب" },
        settings: { title: "الإعدادات", music: "الموسيقى", sound: "الصوت", language: "اللغة", community: "المجتمع", reduce_animations: "وضع الأداء", reduce_animations_hint: "حركات وتأثيرات أقل" },
        upgrades: { title: "متجر الترقيات", current_value: "القيمة الحالية", current_level: "المستوى الحالي", inapps_tab: "المشتريات", inapps_title: "مشتريات داخل التطبيق", inapps_desc: "حزم وعروض خاصة قريبًا", coin_pack_title: "حزمة عملات", upgrade_click_power: "قوة النقر", upgrade_click_power_desc: "يزيد العملات لكل نقرة", upgrade_critical_chance: "فرصة الضربة الحرجة", upgrade_critical_chance_desc: "يزيد فرصة النقر الحرج", upgrade_passive_income: "دخل سلبي", upgrade_passive_income_desc: "يزيد العملات السلبية في الثانية" },
        fighters: { title: "مجموعة المقاتلين", locked: "مقفل", owned: "مملوك", choose_team: "اختر 3 مقاتلين", merge_hint: "مقاتلان متشابهان = التالي في السلسلة" },
        battle: { title: "المعركة", victory: "انتصار!", defeat: "هزيمة", reward_coins: "+{coins} عملات", reward_cups: "+{cups} كؤوس", lose_cups: "{cups} كؤوس", continue: "متابعة", revive_ad: "إحياء عبر إعلان", difficulty_easy: "سهل", difficulty_medium: "متوسط", difficulty_hard: "صعب", team_selection_title: "اختيار الفريق", team_selection_subtitle: "اختر 2 أو 3 مقاتلين", before_fight: "قبل المعركة", play: "لعب", refuse: "رفض", accept: "قبول", crit: "حرج", versus_players: "لاعب ضد لاعب", players_ready: "اللاعبون مستعدون للقتال", total_damage: "إجمالي الضرر: {value}" },
        box: { opening_title: "فتح الصندوق", opening_hint_collect: "اضغط لاستلام المكافأة", opening_hint_spin: "يدور...", new_brawler: "مقاتل جديد!", collect: "استلام" },
        leaderboard: { title: "لوحة الصدارة", rank: "الترتيب", player: "لاعب", score: "كؤوس", hidden_player: "لاعب مخفي", login_required: "سجّل الدخول للانضمام إلى لوحة الصدارة" },
        vip: { title: "VIP", webstatus_forever: "حالة VIP مدى الحياة", status_active: "VIP نشط", status_inactive: "VIP غير مشتراه", benefit_income: "دخل x2", benefit_cooldown: "المعركة", benefit_cooldown_line2: "أسرع 5 مرات", benefit_discount: "شراء شخصية جديدة", benefit_discount_line2: "دائمًا 50", buy_vip: "شراء VIP" },
        brawlers: { brbrpatapim: "برابر باتابيم", combonagets: "كومبو ناغتس", doge_boss: "دوج بوس", doge_fee: "دوج في", fnaf: "فناف", granny: "جراني", gugugaga: "غوغو غاغا", ski_bi_di_toilet: "سكي بي دي تواليت", ninja_capuchino: "نينجا كابتشينو", paragon: "باراغون", sagur: "ساغور", zhdun: "جدون" }
    };

    const az = { base: { game_title: "Meme Brawl: Birləşmə Simulyatoru", loading: "Yüklənir...", play: "Oyna", close: "Bağla", buy: "Al", upgrade: "Təkmilləşdir", select: "Seç", selected: "Seçildi", cancel: "Ləğv et", ok: "OK", yes: "Bəli", no: "Xeyr", free: "Pulsuz", reward: "Mükafat", claim: "Götür", skip: "Keç", price: "Qiymət", level: "Səviyyə", hp: "HP", damage: "Zərər", crit: "Krit", coins: "Sikkə", cups: "Kubok", progress_cubes: "Kub", player: "Oyunçu", error: "Xəta", unavailable: "Mövcud deyil", not_enough_coins: "Sikkə çatmır", ad_unavailable: "Reklam mövcud deyil", save_error: "Proqresi saxlamaq olmadı" }, menu: { battle: "DÖYÜŞ", battle_locked: "Döyüş {time} sonra", shop: "Mağaza", profile: "Profil", fighters: "Döyüşçülər", upgrades: "Yeniləmələr", leaderboard: "Liderlər", vip: "VIP", settings: "Ayarlar", box_progress: "Qutu", box_ad: "Reklam qutusu", character_offer: "Personaj təklifi", buy_character: "Döyüşçü al" }, profile: { title: "Profil", clicks: "Kliklər", bought_characters: "Alınan personajlar", merges: "Birləşmələr", opened_brawlers: "Açılan döyüşçülər", opened_boxes: "Açılan qutular", matches: "Matçlar", wins: "Qələbələr", losses: "Məğlubiyyətlər", play_time: "Oyun vaxtı" }, settings: { title: "Ayarlar", music: "Musiqi", sound: "Səs", language: "Dil", community: "İcma", reduce_animations: "Performans rejimi", reduce_animations_hint: "Daha az animasiya və effekt" }, upgrades: { title: "Yeniləmə mağazası", current_value: "Cari dəyər", current_level: "Cari səviyyə", inapps_tab: "Daxili alışlar", inapps_title: "Tətbiqdaxili alışlar", inapps_desc: "Paketlər və xüsusi təkliflər tezliklə", coin_pack_title: "Sikkə paketi", upgrade_click_power: "Klik gücü", upgrade_click_power_desc: "Klik başına sikkəni artırır", upgrade_critical_chance: "Kritik şans", upgrade_critical_chance_desc: "Kritik klik şansını artırır", upgrade_passive_income: "Passiv gəlir", upgrade_passive_income_desc: "Saniyədə passiv sikkəni artırır" }, fighters: { title: "Döyüşçü kolleksiyası", locked: "Bağlı", owned: "Var", choose_team: "3 döyüşçü seç", merge_hint: "2 eyni döyüşçü = zəncirdə növbəti" }, battle: { title: "Döyüş", victory: "Qələbə!", defeat: "Məğlubiyyət", reward_coins: "+{coins} sikkə", reward_cups: "+{cups} kubok", lose_cups: "{cups} kubok", continue: "Davam et", revive_ad: "Reklamla diril", difficulty_easy: "Asan", difficulty_medium: "Orta", difficulty_hard: "Çətin", team_selection_title: "Komanda seçimi", team_selection_subtitle: "2 və ya 3 döyüşçü seç", before_fight: "Döyüşdən əvvəl", play: "Oyna", refuse: "Rədd et", accept: "Qəbul et", crit: "KRIT", versus_players: "Oyunçu VS Oyunçu", players_ready: "Oyunçular döyüşə hazırdır", total_damage: "Ümumi zərər: {value}" }, box: { opening_title: "Qutu açılışı", opening_hint_collect: "Mükafatı götürmək üçün toxun", opening_hint_spin: "Fırlanır...", new_brawler: "Yeni döyüşçü!", collect: "Götür" }, leaderboard: { title: "Lider cədvəli", rank: "Sıra", player: "Oyunçu", score: "Kubok", hidden_player: "Gizli oyunçu", login_required: "Lider cədvəlinə düşmək üçün daxil ol" }, vip: { title: "VIP", webstatus_forever: "Ömürlük VIP statusu", status_active: "VIP aktivdir", status_inactive: "VIP alınmayıb", benefit_income: "x2 gəlir", benefit_cooldown: "Döyüş", benefit_cooldown_line2: "5 dəfə daha sürətli", benefit_discount: "Yeni personaj alma", benefit_discount_line2: "həmişə 50", buy_vip: "VIP al" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const zh = { base: { game_title: "梗图乱斗：合并模拟器", loading: "加载中...", play: "开始", close: "关闭", buy: "购买", upgrade: "升级", select: "选择", selected: "已选择", cancel: "取消", ok: "确定", yes: "是", no: "否", free: "免费", reward: "奖励", claim: "领取", skip: "跳过", price: "价格", level: "等级", hp: "HP", damage: "伤害", crit: "暴击", coins: "金币", cups: "奖杯", progress_cubes: "方块", player: "玩家", error: "错误", unavailable: "不可用", not_enough_coins: "金币不足", ad_unavailable: "广告不可用", save_error: "无法保存进度" }, menu: { battle: "战斗", battle_locked: "{time} 后可战斗", shop: "商店", profile: "资料", fighters: "斗士", upgrades: "升级", leaderboard: "排行榜", vip: "VIP", settings: "设置", box_progress: "宝箱", box_ad: "广告宝箱", character_offer: "角色优惠", buy_character: "购买斗士" }, profile: { title: "资料", clicks: "点击", bought_characters: "购买角色", merges: "合成", opened_brawlers: "解锁斗士", opened_boxes: "已开宝箱", matches: "对局", wins: "胜利", losses: "失败", play_time: "游戏时长" }, settings: { title: "设置", music: "音乐", sound: "音效", language: "语言", community: "社区", reduce_animations: "性能模式", reduce_animations_hint: "更少动画和特效" }, upgrades: { title: "升级商店", current_value: "当前数值", current_level: "当前等级", inapps_tab: "内购", inapps_title: "应用内购买", inapps_desc: "礼包和特价即将上线", coin_pack_title: "金币包", upgrade_click_power: "点击强度", upgrade_click_power_desc: "提高每次点击金币", upgrade_critical_chance: "暴击概率", upgrade_critical_chance_desc: "提高暴击点击概率", upgrade_passive_income: "被动收入", upgrade_passive_income_desc: "提高每秒被动金币" }, fighters: { title: "斗士收藏", locked: "未解锁", owned: "已拥有", choose_team: "选择 3 名斗士", merge_hint: "2 个相同斗士 = 链条下一个斗士" }, battle: { title: "战斗", victory: "胜利！", defeat: "失败", reward_coins: "+{coins} 金币", reward_cups: "+{cups} 奖杯", lose_cups: "{cups} 奖杯", continue: "继续", revive_ad: "看广告复活", difficulty_easy: "简单", difficulty_medium: "普通", difficulty_hard: "困难", team_selection_title: "队伍选择", team_selection_subtitle: "选择 2 或 3 名斗士", before_fight: "战斗前", play: "开始", refuse: "拒绝", accept: "接受", crit: "暴击", versus_players: "玩家 VS 玩家", players_ready: "玩家已准备战斗", total_damage: "总伤害：{value}" }, box: { opening_title: "开箱", opening_hint_collect: "点击领取奖励", opening_hint_spin: "旋转中...", new_brawler: "新斗士！", collect: "领取" }, leaderboard: { title: "排行榜", rank: "排名", player: "玩家", score: "奖杯", hidden_player: "匿名玩家", login_required: "登录后可进入排行榜" }, vip: { title: "VIP", webstatus_forever: "永久 VIP", status_active: "VIP 已激活", status_inactive: "未购买 VIP", benefit_income: "x2 收入", benefit_cooldown: "战斗", benefit_cooldown_line2: "冷却快 5 倍", benefit_discount: "购买新角色", benefit_discount_line2: "始终只要 50", buy_vip: "购买 VIP" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const nl = { base: { game_title: "Meme Brawl: Merge Simulator", loading: "Laden...", play: "Spelen", close: "Sluiten", buy: "Kopen", upgrade: "Upgraden", select: "Selecteren", selected: "Geselecteerd", cancel: "Annuleren", ok: "OK", yes: "Ja", no: "Nee", free: "Gratis", reward: "Beloning", claim: "Claimen", skip: "Overslaan", price: "Prijs", level: "Niveau", hp: "HP", damage: "Schade", crit: "Krit", coins: "Munten", cups: "Bekers", progress_cubes: "Kubussen", player: "Speler", error: "Fout", unavailable: "Niet beschikbaar", not_enough_coins: "Niet genoeg munten", ad_unavailable: "Advertentie niet beschikbaar", save_error: "Voortgang kon niet worden opgeslagen" }, menu: { battle: "GEVECHT", battle_locked: "Gevecht over {time}", shop: "Winkel", profile: "Profiel", fighters: "Vechters", upgrades: "Upgrades", leaderboard: "Ranglijst", vip: "VIP", settings: "Instellingen", box_progress: "Box", box_ad: "Advertentiebox", character_offer: "Karakteraanbieding", buy_character: "Vechter kopen" }, profile: { title: "Profiel", clicks: "Klikken", bought_characters: "Gekochte karakters", merges: "Samenvoegingen", opened_brawlers: "Ontgrendelde vechters", opened_boxes: "Geopende boxen", matches: "Wedstrijden", wins: "Overwinningen", losses: "Verliezen", play_time: "Speeltijd" }, settings: { title: "Instellingen", music: "Muziek", sound: "Geluid", language: "Taal", community: "Community", reduce_animations: "Prestatiemodus", reduce_animations_hint: "Minder animaties en effecten" }, upgrades: { title: "Upgradewinkel", current_value: "Huidige waarde", current_level: "Huidig niveau", inapps_tab: "In-apps", inapps_title: "In-app aankopen", inapps_desc: "Bundels en speciale aanbiedingen komen eraan", coin_pack_title: "Muntpakket", upgrade_click_power: "Klikkracht", upgrade_click_power_desc: "Verhoogt munten per klik", upgrade_critical_chance: "Kritieke kans", upgrade_critical_chance_desc: "Verhoogt kans op kritieke klik", upgrade_passive_income: "Passief inkomen", upgrade_passive_income_desc: "Verhoogt passieve munten per seconde" }, fighters: { title: "Vechtercollectie", locked: "Vergrendeld", owned: "In bezit", choose_team: "Kies 3 vechters", merge_hint: "2 dezelfde vechters = volgende in de keten" }, battle: { title: "Gevecht", victory: "Overwinning!", defeat: "Nederlaag", reward_coins: "+{coins} munten", reward_cups: "+{cups} bekers", lose_cups: "{cups} bekers", continue: "Doorgaan", revive_ad: "Herleven via advertentie", difficulty_easy: "Makkelijk", difficulty_medium: "Gemiddeld", difficulty_hard: "Moeilijk", team_selection_title: "Teamselectie", team_selection_subtitle: "Kies 2 of 3 vechters", before_fight: "Voor het gevecht", play: "Spelen", refuse: "Weigeren", accept: "Accepteren", crit: "KRIT", versus_players: "Speler VS Speler", players_ready: "Spelers zijn klaar om te vechten", total_damage: "Totale schade: {value}" }, box: { opening_title: "Box openen", opening_hint_collect: "Tik om beloning te claimen", opening_hint_spin: "Draait...", new_brawler: "Nieuwe vechter!", collect: "Claimen" }, leaderboard: { title: "Ranglijst", rank: "Positie", player: "Speler", score: "Bekers", hidden_player: "Verborgen speler", login_required: "Log in om op de ranglijst te komen" }, vip: { title: "VIP", webstatus_forever: "VIP-status voor altijd", status_active: "VIP actief", status_inactive: "VIP niet gekocht", benefit_income: "x2 inkomen", benefit_cooldown: "Gevecht", benefit_cooldown_line2: "5x sneller", benefit_discount: "Nieuw karakter kopen", benefit_discount_line2: "altijd 50", buy_vip: "Koop VIP" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const hi = { base: { game_title: "मीम ब्रॉल: मर्ज सिम्युलेटर", loading: "लोड हो रहा है...", play: "खेलें", close: "बंद करें", buy: "खरीदें", upgrade: "अपग्रेड", select: "चुनें", selected: "चयनित", cancel: "रद्द करें", ok: "ठीक", yes: "हाँ", no: "नहीं", free: "मुफ़्त", reward: "इनाम", claim: "प्राप्त करें", skip: "छोड़ें", price: "कीमत", level: "लेवल", hp: "HP", damage: "डैमेज", crit: "क्रिट", coins: "कॉइन्स", cups: "कप", progress_cubes: "क्यूब्स", player: "खिलाड़ी", error: "त्रुटि", unavailable: "उपलब्ध नहीं", not_enough_coins: "पर्याप्त कॉइन्स नहीं", ad_unavailable: "विज्ञापन उपलब्ध नहीं", save_error: "प्रगति सेव नहीं हुई" }, menu: { battle: "बैटल", battle_locked: "{time} में बैटल", shop: "दुकान", profile: "प्रोफ़ाइल", fighters: "फाइटर्स", upgrades: "अपग्रेड्स", leaderboard: "लीडरबोर्ड", vip: "VIP", settings: "सेटिंग्स", box_progress: "बॉक्स", box_ad: "ऐड बॉक्स", character_offer: "किरदार ऑफर", buy_character: "फाइटर खरीदें" }, profile: { title: "प्रोफ़ाइल", clicks: "क्लिक्स", bought_characters: "खरीदे गए किरदार", merges: "मर्ज", opened_brawlers: "अनलॉक फाइटर्स", opened_boxes: "खुले बॉक्स", matches: "मैच", wins: "जीत", losses: "हार", play_time: "खेलने का समय" }, settings: { title: "सेटिंग्स", music: "संगीत", sound: "ध्वनि", language: "भाषा", community: "समुदाय", reduce_animations: "प्रदर्शन मोड", reduce_animations_hint: "कम एनिमेशन और प्रभाव" }, upgrades: { title: "अपग्रेड दुकान", current_value: "वर्तमान मान", current_level: "वर्तमान लेवल", inapps_tab: "इन-ऐप", inapps_title: "इन-ऐप खरीदारी", inapps_desc: "बंडल और खास ऑफर जल्द आएंगे", coin_pack_title: "कॉइन पैक", upgrade_click_power: "क्लिक पावर", upgrade_click_power_desc: "प्रति क्लिक कॉइन बढ़ाता है", upgrade_critical_chance: "क्रिटिकल मौका", upgrade_critical_chance_desc: "क्रिटिकल क्लिक का मौका बढ़ाता है", upgrade_passive_income: "पैसिव आय", upgrade_passive_income_desc: "प्रति सेकंड पैसिव कॉइन बढ़ाता है" }, fighters: { title: "फाइटर कलेक्शन", locked: "लॉक्ड", owned: "मौजूद", choose_team: "3 फाइटर्स चुनें", merge_hint: "2 समान फाइटर्स = चेन में अगला फाइटर" }, battle: { title: "युद्ध", victory: "जीत!", defeat: "हार", reward_coins: "+{coins} कॉइन्स", reward_cups: "+{cups} कप", lose_cups: "{cups} कप", continue: "जारी रखें", revive_ad: "ऐड से रिवाइव", difficulty_easy: "आसान", difficulty_medium: "मध्यम", difficulty_hard: "कठिन", team_selection_title: "टीम चयन", team_selection_subtitle: "2 या 3 फाइटर्स चुनें", before_fight: "युद्ध से पहले", play: "खेलें", refuse: "मना करें", accept: "स्वीकार करें", crit: "क्रिट", versus_players: "खिलाड़ी VS खिलाड़ी", players_ready: "खिलाड़ी लड़ाई के लिए तैयार हैं", total_damage: "कुल डैमेज: {value}" }, box: { opening_title: "बॉक्स ओपनिंग", opening_hint_collect: "इनाम लेने के लिए टैप करें", opening_hint_spin: "घूम रहा है...", new_brawler: "नया फाइटर!", collect: "ले लें" }, leaderboard: { title: "लीडरबोर्ड", rank: "रैंक", player: "खिलाड़ी", score: "कप", hidden_player: "छिपा खिलाड़ी", login_required: "लीडरबोर्ड में आने के लिए लॉगिन करें" }, vip: { title: "VIP", webstatus_forever: "हमेशा के लिए VIP स्टेटस", status_active: "VIP सक्रिय", status_inactive: "VIP नहीं खरीदा", benefit_income: "x2 आय", benefit_cooldown: "बैटल", benefit_cooldown_line2: "5x तेज़", benefit_discount: "नया किरदार खरीदना", benefit_discount_line2: "हमेशा 50", buy_vip: "VIP खरीदें" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const id = { base: { game_title: "Meme Brawl: Simulator Penggabungan", loading: "Memuat...", play: "Main", close: "Tutup", buy: "Beli", upgrade: "Tingkatkan", select: "Pilih", selected: "Dipilih", cancel: "Batal", ok: "OK", yes: "Ya", no: "Tidak", free: "Gratis", reward: "Hadiah", claim: "Ambil", skip: "Lewati", price: "Harga", level: "Level", hp: "HP", damage: "Damage", crit: "Kritis", coins: "Koin", cups: "Piala", progress_cubes: "Kubus", player: "Pemain", error: "Kesalahan", unavailable: "Tidak tersedia", not_enough_coins: "Koin tidak cukup", ad_unavailable: "Iklan tidak tersedia", save_error: "Gagal menyimpan progres" }, menu: { battle: "PERTARUNGAN", battle_locked: "Bertarung dalam {time}", shop: "Toko", profile: "Profil", fighters: "Petarung", upgrades: "Upgrade", leaderboard: "Papan peringkat", vip: "VIP", settings: "Pengaturan", box_progress: "Kotak", box_ad: "Kotak iklan", character_offer: "Penawaran karakter", buy_character: "Beli petarung" }, profile: { title: "Profil", clicks: "Klik", bought_characters: "Karakter dibeli", merges: "Penggabungan", opened_brawlers: "Petarung terbuka", opened_boxes: "Kotak dibuka", matches: "Pertandingan", wins: "Menang", losses: "Kalah", play_time: "Waktu bermain" }, settings: { title: "Pengaturan", music: "Musik", sound: "Suara", language: "Bahasa", community: "Komunitas", reduce_animations: "Mode performa", reduce_animations_hint: "Lebih sedikit animasi dan efek" }, upgrades: { title: "Toko upgrade", current_value: "Nilai saat ini", current_level: "Level saat ini", inapps_tab: "In-app", inapps_title: "Pembelian dalam aplikasi", inapps_desc: "Bundle dan penawaran khusus segera hadir", coin_pack_title: "Paket koin", upgrade_click_power: "Kekuatan klik", upgrade_click_power_desc: "Menambah koin per klik", upgrade_critical_chance: "Peluang kritis", upgrade_critical_chance_desc: "Menambah peluang klik kritis", upgrade_passive_income: "Pendapatan pasif", upgrade_passive_income_desc: "Menambah koin pasif per detik" }, fighters: { title: "Koleksi petarung", locked: "Terkunci", owned: "Dimiliki", choose_team: "Pilih 3 petarung", merge_hint: "2 petarung sama = petarung berikutnya di rantai" }, battle: { title: "Pertarungan", victory: "Menang!", defeat: "Kalah", reward_coins: "+{coins} koin", reward_cups: "+{cups} piala", lose_cups: "{cups} piala", continue: "Lanjutkan", revive_ad: "Hidupkan via iklan", difficulty_easy: "Mudah", difficulty_medium: "Sedang", difficulty_hard: "Sulit", team_selection_title: "Pemilihan tim", team_selection_subtitle: "Pilih 2 atau 3 petarung", before_fight: "Sebelum bertarung", play: "Main", refuse: "Tolak", accept: "Terima", crit: "KRIT", versus_players: "Pemain VS Pemain", players_ready: "Pemain siap bertarung", total_damage: "Total damage: {value}" }, box: { opening_title: "Buka kotak", opening_hint_collect: "Ketuk untuk mengambil hadiah", opening_hint_spin: "Berputar...", new_brawler: "Petarung baru!", collect: "Ambil" }, leaderboard: { title: "Papan peringkat", rank: "Peringkat", player: "Pemain", score: "Piala", hidden_player: "Pemain tersembunyi", login_required: "Masuk untuk tampil di papan peringkat" }, vip: { title: "VIP", webstatus_forever: "Status VIP selamanya", status_active: "VIP aktif", status_inactive: "VIP belum dibeli", benefit_income: "x2 pendapatan", benefit_cooldown: "Pertarungan", benefit_cooldown_line2: "5x lebih cepat", benefit_discount: "Beli karakter baru", benefit_discount_line2: "selalu 50", buy_vip: "Beli VIP" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const ja = { base: { game_title: "ミームブロール：合体シミュレーター", loading: "読み込み中...", play: "プレイ", close: "閉じる", buy: "購入", upgrade: "強化", select: "選択", selected: "選択済み", cancel: "キャンセル", ok: "OK", yes: "はい", no: "いいえ", free: "無料", reward: "報酬", claim: "受け取る", skip: "スキップ", price: "価格", level: "レベル", hp: "HP", damage: "ダメージ", crit: "クリティカル", coins: "コイン", cups: "カップ", progress_cubes: "キューブ", player: "プレイヤー", error: "エラー", unavailable: "利用不可", not_enough_coins: "コイン不足", ad_unavailable: "広告は利用できません", save_error: "進行状況を保存できませんでした" }, menu: { battle: "バトル", battle_locked: "{time}後にバトル可能", shop: "ショップ", profile: "プロフィール", fighters: "ファイター", upgrades: "強化", leaderboard: "ランキング", vip: "VIP", settings: "設定", box_progress: "ボックス", box_ad: "広告ボックス", character_offer: "キャラオファー", buy_character: "ファイター購入" }, profile: { title: "プロフィール", clicks: "クリック数", bought_characters: "購入キャラ", merges: "合成", opened_brawlers: "開放ファイター", opened_boxes: "開封ボックス", matches: "試合", wins: "勝利", losses: "敗北", play_time: "プレイ時間" }, settings: { title: "設定", music: "音楽", sound: "サウンド", language: "言語", community: "コミュニティ", reduce_animations: "パフォーマンスモード", reduce_animations_hint: "アニメとエフェクトを削減" }, upgrades: { title: "強化ショップ", current_value: "現在値", current_level: "現在レベル", inapps_tab: "課金", inapps_title: "アプリ内課金", inapps_desc: "バンドルと特別オファーは近日公開", coin_pack_title: "コインパック", upgrade_click_power: "クリック力", upgrade_click_power_desc: "クリックごとのコインを増加", upgrade_critical_chance: "クリティカル確率", upgrade_critical_chance_desc: "クリティカルクリック確率を増加", upgrade_passive_income: "放置収入", upgrade_passive_income_desc: "毎秒の放置コインを増加" }, fighters: { title: "ファイターコレクション", locked: "未開放", owned: "所持", choose_team: "3人のファイターを選択", merge_hint: "同じファイター2体 = 次のファイター" }, battle: { title: "バトル", victory: "勝利！", defeat: "敗北", reward_coins: "+{coins} コイン", reward_cups: "+{cups} カップ", lose_cups: "{cups} カップ", continue: "続ける", revive_ad: "広告で復活", difficulty_easy: "かんたん", difficulty_medium: "ふつう", difficulty_hard: "むずかしい", team_selection_title: "チーム選択", team_selection_subtitle: "2人または3人選択", before_fight: "バトル前", play: "プレイ", refuse: "拒否", accept: "承諾", crit: "クリティカル", versus_players: "プレイヤー VS プレイヤー", players_ready: "プレイヤーは戦闘準備完了", total_damage: "総ダメージ: {value}" }, box: { opening_title: "ボックス開封", opening_hint_collect: "タップして報酬を受け取る", opening_hint_spin: "回転中...", new_brawler: "新しいファイター！", collect: "受け取る" }, leaderboard: { title: "ランキング", rank: "順位", player: "プレイヤー", score: "カップ", hidden_player: "非表示プレイヤー", login_required: "ランキング参加にはログインが必要です" }, vip: { title: "VIP", webstatus_forever: "永久VIPステータス", status_active: "VIP有効", status_inactive: "VIP未購入", benefit_income: "収入 x2", benefit_cooldown: "バトル", benefit_cooldown_line2: "5倍速", benefit_discount: "新キャラ購入", benefit_discount_line2: "常に50", buy_vip: "VIP購入" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const ko = { base: { game_title: "밈 브롤: 머지 시뮬레이터", loading: "로딩 중...", play: "플레이", close: "닫기", buy: "구매", upgrade: "강화", select: "선택", selected: "선택됨", cancel: "취소", ok: "확인", yes: "예", no: "아니요", free: "무료", reward: "보상", claim: "받기", skip: "건너뛰기", price: "가격", level: "레벨", hp: "HP", damage: "피해", crit: "치명타", coins: "코인", cups: "컵", progress_cubes: "큐브", player: "플레이어", error: "오류", unavailable: "사용 불가", not_enough_coins: "코인이 부족합니다", ad_unavailable: "광고를 사용할 수 없습니다", save_error: "진행 상황을 저장할 수 없습니다" }, menu: { battle: "전투", battle_locked: "{time} 후 전투 가능", shop: "상점", profile: "프로필", fighters: "파이터", upgrades: "업그레이드", leaderboard: "리더보드", vip: "VIP", settings: "설정", box_progress: "상자", box_ad: "광고 상자", character_offer: "캐릭터 제안", buy_character: "파이터 구매" }, profile: { title: "프로필", clicks: "클릭", bought_characters: "구매 캐릭터", merges: "합성", opened_brawlers: "해금 파이터", opened_boxes: "열린 상자", matches: "매치", wins: "승리", losses: "패배", play_time: "플레이 시간" }, settings: { title: "설정", music: "음악", sound: "사운드", language: "언어", community: "커뮤니티", reduce_animations: "성능 모드", reduce_animations_hint: "애니메이션과 이펙트 감소" }, upgrades: { title: "업그레이드 상점", current_value: "현재 값", current_level: "현재 레벨", inapps_tab: "인앱", inapps_title: "인앱 구매", inapps_desc: "번들과 특별 제안이 곧 제공됩니다", coin_pack_title: "코인 팩", upgrade_click_power: "클릭 파워", upgrade_click_power_desc: "클릭당 코인을 증가", upgrade_critical_chance: "치명타 확률", upgrade_critical_chance_desc: "치명타 클릭 확률 증가", upgrade_passive_income: "패시브 수입", upgrade_passive_income_desc: "초당 패시브 코인 증가" }, fighters: { title: "파이터 컬렉션", locked: "잠김", owned: "보유", choose_team: "파이터 3명 선택", merge_hint: "같은 파이터 2명 = 다음 단계 파이터" }, battle: { title: "전투", victory: "승리!", defeat: "패배", reward_coins: "+{coins} 코인", reward_cups: "+{cups} 컵", lose_cups: "{cups} 컵", continue: "계속", revive_ad: "광고로 부활", difficulty_easy: "쉬움", difficulty_medium: "보통", difficulty_hard: "어려움", team_selection_title: "팀 선택", team_selection_subtitle: "2명 또는 3명 선택", before_fight: "전투 전", play: "플레이", refuse: "거절", accept: "수락", crit: "크리티컬", versus_players: "플레이어 VS 플레이어", players_ready: "플레이어가 전투 준비 완료", total_damage: "총 피해: {value}" }, box: { opening_title: "상자 열기", opening_hint_collect: "탭하여 보상 받기", opening_hint_spin: "회전 중...", new_brawler: "새 파이터!", collect: "받기" }, leaderboard: { title: "리더보드", rank: "순위", player: "플레이어", score: "컵", hidden_player: "숨김 플레이어", login_required: "리더보드 참여를 위해 로그인하세요" }, vip: { title: "VIP", webstatus_forever: "영구 VIP 상태", status_active: "VIP 활성", status_inactive: "VIP 미구매", benefit_income: "수입 x2", benefit_cooldown: "전투", benefit_cooldown_line2: "5배 빠름", benefit_discount: "새 캐릭터 구매", benefit_discount_line2: "항상 50", buy_vip: "VIP 구매" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const kk = { base: { game_title: "Meme Brawl: Біріктіру Симуляторы", loading: "Жүктелуде...", play: "Ойнау", close: "Жабу", buy: "Сатып алу", upgrade: "Жақсарту", select: "Таңдау", selected: "Таңдалды", cancel: "Бас тарту", ok: "ОК", yes: "Иә", no: "Жоқ", free: "Тегін", reward: "Сыйақы", claim: "Алу", skip: "Өткізу", price: "Баға", level: "Деңгей", hp: "HP", damage: "Зақым", crit: "Крит", coins: "Монеталар", cups: "Кубоктар", progress_cubes: "Кубтар", player: "Ойыншы", error: "Қате", unavailable: "Қолжетімсіз", not_enough_coins: "Монета жеткіліксіз", ad_unavailable: "Жарнама қолжетімсіз", save_error: "Прогресті сақтау мүмкін болмады" }, menu: { battle: "ШАЙҚАС", battle_locked: "Шайқас {time} кейін", shop: "Дүкен", profile: "Жеке парақша", fighters: "Жауынгерлер", upgrades: "Жақсартулар", leaderboard: "Көшбасшылар", vip: "VIP", settings: "Баптаулар", box_progress: "Қорап", box_ad: "Жарнама қорабы", character_offer: "Кейіпкер ұсынысы", buy_character: "Жауынгер сатып алу" }, profile: { title: "Жеке парақша", clicks: "Басулар", bought_characters: "Сатып алынған кейіпкерлер", merges: "Біріктіру", opened_brawlers: "Ашылған жауынгерлер", opened_boxes: "Ашылған қораптар", matches: "Ойындар", wins: "Жеңістер", losses: "Жеңілістер", play_time: "Ойын уақыты" }, settings: { title: "Баптаулар", music: "Ән-күй", sound: "Дыбыс", language: "Тіл", community: "Қауымдастық", reduce_animations: "Өнімділік режимі", reduce_animations_hint: "Анимация мен эффектілер аз" }, upgrades: { title: "Жақсарту дүкені", current_value: "Ағымдағы мән", current_level: "Ағымдағы деңгей", inapps_tab: "Ішкі сатып алулар", inapps_title: "Қосымша ішіндегі сатып алулар", inapps_desc: "Бумалар мен арнайы ұсыныстар жақында", coin_pack_title: "Монета пакеті", upgrade_click_power: "Басу күші", upgrade_click_power_desc: "Басқан сайын монетаны арттырады", upgrade_critical_chance: "Крит мүмкіндігі", upgrade_critical_chance_desc: "Крит басу мүмкіндігін арттырады", upgrade_passive_income: "Пассив табыс", upgrade_passive_income_desc: "Секундына пассив монетаны арттырады" }, fighters: { title: "Жауынгер жинағы", locked: "Құлыптаулы", owned: "Бар", choose_team: "3 жауынгер таңда", merge_hint: "2 бірдей жауынгер = тізбектегі келесі" }, battle: { title: "Шайқас", victory: "Жеңіс!", defeat: "Жеңіліс", reward_coins: "+{coins} монета", reward_cups: "+{cups} кубок", lose_cups: "{cups} кубок", continue: "Жалғастыру", revive_ad: "Жарнама арқылы тірілу", difficulty_easy: "Оңай", difficulty_medium: "Орта", difficulty_hard: "Қиын", team_selection_title: "Команда таңдау", team_selection_subtitle: "2 немесе 3 жауынгер таңда", before_fight: "Шайқас алдында", play: "Ойнау", refuse: "Бас тарту", accept: "Қабылдау", crit: "КРИТ", versus_players: "Ойыншы VS Ойыншы", players_ready: "Ойыншылар шайқасқа дайын", total_damage: "Жалпы зақым: {value}" }, box: { opening_title: "Қорап ашу", opening_hint_collect: "Сыйақыны алу үшін түртіңіз", opening_hint_spin: "Айналуда...", new_brawler: "Жаңа жауынгер!", collect: "Алу" }, leaderboard: { title: "Көшбасшылар кестесі", rank: "Орын", player: "Ойыншы", score: "Кубок", hidden_player: "Жасырын ойыншы", login_required: "Кестеге кіру үшін жүйеге кіріңіз" }, vip: { title: "VIP", webstatus_forever: "VIP мәртебесі мәңгі", status_active: "VIP белсенді", status_inactive: "VIP сатып алынбаған", benefit_income: "x2 табыс", benefit_cooldown: "Шайқас", benefit_cooldown_line2: "5 есе жылдам", benefit_discount: "Жаңа кейіпкер сатып алу", benefit_discount_line2: "әрқашан 50", buy_vip: "VIP сатып алу" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const pl = { base: { game_title: "Meme Brawl: Symulator Łączenia", loading: "Ładowanie...", play: "Graj", close: "Zamknij", buy: "Kup", upgrade: "Ulepsz", select: "Wybierz", selected: "Wybrano", cancel: "Anuluj", ok: "OK", yes: "Tak", no: "Nie", free: "Za darmo", reward: "Nagroda", claim: "Odbierz", skip: "Pomiń", price: "Cena", level: "Poziom", hp: "HP", damage: "Obrażenia", crit: "Kryt", coins: "Monety", cups: "Puchary", progress_cubes: "Kostki", player: "Gracz", error: "Błąd", unavailable: "Niedostępne", not_enough_coins: "Za mało monet", ad_unavailable: "Reklama niedostępna", save_error: "Nie udało się zapisać postępu" }, menu: { battle: "BITWA", battle_locked: "Bitwa za {time}", shop: "Sklep", profile: "Profil", fighters: "Wojownicy", upgrades: "Ulepszenia", leaderboard: "Ranking", vip: "VIP", settings: "Ustawienia", box_progress: "Skrzynka", box_ad: "Skrzynka za reklamę", character_offer: "Oferta postaci", buy_character: "Kup wojownika" }, profile: { title: "Profil", clicks: "Kliknięcia", bought_characters: "Kupione postacie", merges: "Łączenia", opened_brawlers: "Odblokowani wojownicy", opened_boxes: "Otwarte skrzynki", matches: "Mecze", wins: "Wygrane", losses: "Przegrane", play_time: "Czas gry" }, settings: { title: "Ustawienia", music: "Muzyka", sound: "Dźwięk", language: "Język", community: "Społeczność", reduce_animations: "Tryb wydajności", reduce_animations_hint: "Mniej animacji i efektów" }, upgrades: { title: "Sklep ulepszeń", current_value: "Aktualna wartość", current_level: "Aktualny poziom", inapps_tab: "Zakupy", inapps_title: "Zakupy w aplikacji", inapps_desc: "Pakiety i oferty specjalne wkrótce", coin_pack_title: "Pakiet monet", upgrade_click_power: "Moc kliku", upgrade_click_power_desc: "Zwiększa monety za klik", upgrade_critical_chance: "Szansa krytyka", upgrade_critical_chance_desc: "Zwiększa szansę krytycznego kliknięcia", upgrade_passive_income: "Dochód pasywny", upgrade_passive_income_desc: "Zwiększa pasywne monety na sekundę" }, fighters: { title: "Kolekcja wojowników", locked: "Zablokowane", owned: "Posiadane", choose_team: "Wybierz 3 wojowników", merge_hint: "2 tacy sami wojownicy = następny w łańcuchu" }, battle: { title: "Bitwa", victory: "Zwycięstwo!", defeat: "Porażka", reward_coins: "+{coins} monet", reward_cups: "+{cups} pucharów", lose_cups: "{cups} pucharów", continue: "Kontynuuj", revive_ad: "Wskrzeszenie za reklamę", difficulty_easy: "Łatwy", difficulty_medium: "Średni", difficulty_hard: "Trudny", team_selection_title: "Wybór drużyny", team_selection_subtitle: "Wybierz 2 lub 3 wojowników", before_fight: "Przed bitwą", play: "Graj", refuse: "Odrzuć", accept: "Akceptuj", crit: "KRYT", versus_players: "Gracz VS Gracz", players_ready: "Gracze są gotowi do walki", total_damage: "Łączne obrażenia: {value}" }, box: { opening_title: "Otwieranie skrzynki", opening_hint_collect: "Dotknij, aby odebrać nagrodę", opening_hint_spin: "Kręci się...", new_brawler: "Nowy wojownik!", collect: "Odbierz" }, leaderboard: { title: "Ranking", rank: "Miejsce", player: "Gracz", score: "Puchary", hidden_player: "Ukryty gracz", login_required: "Zaloguj się, aby trafić do rankingu" }, vip: { title: "VIP", webstatus_forever: "Status VIP na zawsze", status_active: "VIP aktywny", status_inactive: "VIP niekupiony", benefit_income: "x2 dochód", benefit_cooldown: "Bitwa", benefit_cooldown_line2: "5x szybciej", benefit_discount: "Zakup nowej postaci", benefit_discount_line2: "zawsze 50", buy_vip: "Kup VIP" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const pt = { base: { game_title: "Meme Brawl: Simulador de Fusão", loading: "Carregando...", play: "Jogar", close: "Fechar", buy: "Comprar", upgrade: "Melhorar", select: "Selecionar", selected: "Selecionado", cancel: "Cancelar", ok: "OK", yes: "Sim", no: "Não", free: "Grátis", reward: "Recompensa", claim: "Resgatar", skip: "Pular", price: "Preço", level: "Nível", hp: "HP", damage: "Dano", crit: "Crítico", coins: "Moedas", cups: "Taças", progress_cubes: "Cubos", player: "Jogador", error: "Erro", unavailable: "Indisponível", not_enough_coins: "Moedas insuficientes", ad_unavailable: "Anúncio indisponível", save_error: "Não foi possível salvar o progresso" }, menu: { battle: "BATALHA", battle_locked: "Batalha em {time}", shop: "Loja", profile: "Perfil", fighters: "Lutadores", upgrades: "Melhorias", leaderboard: "Classificação", vip: "VIP", settings: "Configurações", box_progress: "Caixa", box_ad: "Caixa de anúncio", character_offer: "Oferta de personagem", buy_character: "Comprar lutador" }, profile: { title: "Perfil", clicks: "Cliques", bought_characters: "Personagens comprados", merges: "Fusões", opened_brawlers: "Lutadores desbloqueados", opened_boxes: "Caixas abertas", matches: "Partidas", wins: "Vitórias", losses: "Derrotas", play_time: "Tempo de jogo" }, settings: { title: "Configurações", music: "Música", sound: "Som", language: "Idioma", community: "Comunidade", reduce_animations: "Modo desempenho", reduce_animations_hint: "Menos animações e efeitos" }, upgrades: { title: "Loja de melhorias", current_value: "Valor atual", current_level: "Nível atual", inapps_tab: "Compras", inapps_title: "Compras no app", inapps_desc: "Pacotes e ofertas especiais em breve", coin_pack_title: "Pacote de moedas", upgrade_click_power: "Poder de clique", upgrade_click_power_desc: "Aumenta moedas por clique", upgrade_critical_chance: "Chance crítica", upgrade_critical_chance_desc: "Aumenta chance de clique crítico", upgrade_passive_income: "Renda passiva", upgrade_passive_income_desc: "Aumenta moedas passivas por segundo" }, fighters: { title: "Coleção de lutadores", locked: "Bloqueado", owned: "Possuído", choose_team: "Escolha 3 lutadores", merge_hint: "2 lutadores iguais = próximo na cadeia" }, battle: { title: "Batalha", victory: "Vitória!", defeat: "Derrota", reward_coins: "+{coins} moedas", reward_cups: "+{cups} taças", lose_cups: "{cups} taças", continue: "Continuar", revive_ad: "Reviver por anúncio", difficulty_easy: "Fácil", difficulty_medium: "Médio", difficulty_hard: "Difícil", team_selection_title: "Seleção de equipe", team_selection_subtitle: "Escolha 2 ou 3 lutadores", before_fight: "Antes da batalha", play: "Jogar", refuse: "Recusar", accept: "Aceitar", crit: "CRIT", versus_players: "Jogador VS Jogador", players_ready: "Os jogadores estão prontos para lutar", total_damage: "Dano total: {value}" }, box: { opening_title: "Abertura de caixa", opening_hint_collect: "Toque para resgatar a recompensa", opening_hint_spin: "Girando...", new_brawler: "Novo lutador!", collect: "Resgatar" }, leaderboard: { title: "Classificação", rank: "Posição", player: "Jogador", score: "Taças", hidden_player: "Jogador oculto", login_required: "Entre para aparecer no ranking" }, vip: { title: "VIP", webstatus_forever: "Status VIP para sempre", status_active: "VIP ativo", status_inactive: "VIP não comprado", benefit_income: "x2 renda", benefit_cooldown: "Batalha", benefit_cooldown_line2: "5x mais rápido", benefit_discount: "Comprar novo personagem", benefit_discount_line2: "sempre custa 50", buy_vip: "Comprar VIP" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const th = { base: { game_title: "Meme Brawl: ตัวจำลองการผสาน", loading: "กำลังโหลด...", play: "เล่น", close: "ปิด", buy: "ซื้อ", upgrade: "อัปเกรด", select: "เลือก", selected: "เลือกแล้ว", cancel: "ยกเลิก", ok: "ตกลง", yes: "ใช่", no: "ไม่", free: "ฟรี", reward: "รางวัล", claim: "รับ", skip: "ข้าม", price: "ราคา", level: "เลเวล", hp: "HP", damage: "ดาเมจ", crit: "คริติคอล", coins: "เหรียญ", cups: "ถ้วย", progress_cubes: "คิวบ์", player: "ผู้เล่น", error: "ข้อผิดพลาด", unavailable: "ไม่พร้อมใช้งาน", not_enough_coins: "เหรียญไม่พอ", ad_unavailable: "โฆษณาไม่พร้อมใช้งาน", save_error: "บันทึกความคืบหน้าไม่สำเร็จ" }, menu: { battle: "ต่อสู้", battle_locked: "ต่อสู้อีกใน {time}", shop: "ร้านค้า", profile: "โปรไฟล์", fighters: "นักสู้", upgrades: "อัปเกรด", leaderboard: "กระดานผู้นำ", vip: "VIP", settings: "ตั้งค่า", box_progress: "กล่อง", box_ad: "กล่องโฆษณา", character_offer: "ข้อเสนอคาแรกเตอร์", buy_character: "ซื้อนักสู้" }, profile: { title: "โปรไฟล์", clicks: "คลิก", bought_characters: "คาแรกเตอร์ที่ซื้อ", merges: "การรวม", opened_brawlers: "นักสู้ที่เปิดได้", opened_boxes: "กล่องที่เปิด", matches: "แมตช์", wins: "ชนะ", losses: "แพ้", play_time: "เวลาเล่น" }, settings: { title: "ตั้งค่า", music: "เพลง", sound: "เสียง", language: "ภาษา", community: "ชุมชน", reduce_animations: "โหมดประสิทธิภาพ", reduce_animations_hint: "แอนิเมชันและเอฟเฟกต์น้อยลง" }, upgrades: { title: "ร้านอัปเกรด", current_value: "ค่าปัจจุบัน", current_level: "เลเวลปัจจุบัน", inapps_tab: "ในแอป", inapps_title: "การซื้อในแอป", inapps_desc: "แพ็กและข้อเสนอพิเศษมาเร็วๆ นี้", coin_pack_title: "แพ็กเหรียญ", upgrade_click_power: "พลังคลิก", upgrade_click_power_desc: "เพิ่มเหรียญต่อคลิก", upgrade_critical_chance: "โอกาสคริติคอล", upgrade_critical_chance_desc: "เพิ่มโอกาสคลิกคริติคอล", upgrade_passive_income: "รายได้พาสซีฟ", upgrade_passive_income_desc: "เพิ่มเหรียญพาสซีฟต่อวินาที" }, fighters: { title: "คอลเลกชันนักสู้", locked: "ล็อก", owned: "มีแล้ว", choose_team: "เลือกนักสู้ 3 คน", merge_hint: "นักสู้เหมือนกัน 2 ตัว = ตัวถัดไปในสาย" }, battle: { title: "การต่อสู้", victory: "ชนะ!", defeat: "แพ้", reward_coins: "+{coins} เหรียญ", reward_cups: "+{cups} ถ้วย", lose_cups: "{cups} ถ้วย", continue: "ต่อไป", revive_ad: "ชุบชีวิตด้วยโฆษณา", difficulty_easy: "ง่าย", difficulty_medium: "ปานกลาง", difficulty_hard: "ยาก", team_selection_title: "เลือกทีม", team_selection_subtitle: "เลือกนักสู้ 2 หรือ 3 คน", before_fight: "ก่อนต่อสู้", play: "เล่น", refuse: "ปฏิเสธ", accept: "ยอมรับ", crit: "คริติคอล", versus_players: "ผู้เล่น VS ผู้เล่น", players_ready: "ผู้เล่นพร้อมต่อสู้แล้ว", total_damage: "ดาเมจรวม: {value}" }, box: { opening_title: "เปิดกล่อง", opening_hint_collect: "แตะเพื่อรับรางวัล", opening_hint_spin: "กำลังหมุน...", new_brawler: "นักสู้ใหม่!", collect: "รับ" }, leaderboard: { title: "กระดานผู้นำ", rank: "อันดับ", player: "ผู้เล่น", score: "ถ้วย", hidden_player: "ผู้เล่นที่ซ่อน", login_required: "เข้าสู่ระบบเพื่อขึ้นกระดานผู้นำ" }, vip: { title: "VIP", webstatus_forever: "สถานะ VIP ตลอดชีพ", status_active: "VIP เปิดใช้งานแล้ว", status_inactive: "ยังไม่ได้ซื้อ VIP", benefit_income: "รายได้ x2", benefit_cooldown: "การต่อสู้", benefit_cooldown_line2: "เร็วขึ้น 5 เท่า", benefit_discount: "ซื้อตัวละครใหม่", benefit_discount_line2: "ราคา 50 เสมอ", buy_vip: "ซื้อ VIP" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const uk = { base: { game_title: "Meme Brawl: Симулятор Злиття", loading: "Завантаження...", play: "Грати", close: "Закрити", buy: "Купити", upgrade: "Покращити", select: "Вибрати", selected: "Вибрано", cancel: "Скасувати", ok: "ОК", yes: "Так", no: "Ні", free: "Безкоштовно", reward: "Нагорода", claim: "Забрати", skip: "Пропустити", price: "Ціна", level: "Рівень", hp: "HP", damage: "Шкода", crit: "Крит", coins: "Монети", cups: "Кубки", progress_cubes: "Куби", player: "Гравець", error: "Помилка", unavailable: "Недоступно", not_enough_coins: "Недостатньо монет", ad_unavailable: "Реклама недоступна", save_error: "Не вдалося зберегти прогрес" }, menu: { battle: "БИТВА", battle_locked: "Битва через {time}", shop: "Магазин", profile: "Профіль", fighters: "Бійці", upgrades: "Покращення", leaderboard: "Лідери", vip: "VIP", settings: "Налаштування", box_progress: "Бокс", box_ad: "Бокс за рекламу", character_offer: "Офер персонажа", buy_character: "Купити бійця" }, profile: { title: "Профіль", clicks: "Кліки", bought_characters: "Куплено персонажів", merges: "Злиття", opened_brawlers: "Відкрито бійців", opened_boxes: "Відкрито боксів", matches: "Матчі", wins: "Перемоги", losses: "Поразки", play_time: "Час у грі" }, settings: { title: "Налаштування", music: "Музика", sound: "Звуки", language: "Мова", community: "Спільнота", reduce_animations: "Режим продуктивності", reduce_animations_hint: "Менше анімацій і ефектів" }, upgrades: { title: "Магазин покращень", current_value: "Поточне значення", current_level: "Поточний рівень", inapps_tab: "Покупки", inapps_title: "Покупки в застосунку", inapps_desc: "Набори та спецпропозиції скоро", coin_pack_title: "Пакет монет", upgrade_click_power: "Сила кліку", upgrade_click_power_desc: "Збільшує монети за клік", upgrade_critical_chance: "Шанс криту", upgrade_critical_chance_desc: "Збільшує шанс критичного кліку", upgrade_passive_income: "Пасивний дохід", upgrade_passive_income_desc: "Збільшує монети за секунду" }, fighters: { title: "Колекція бійців", locked: "Не відкрито", owned: "Є", choose_team: "Вибери 3 бійців", merge_hint: "2 однакові бійці = наступний у ланцюжку" }, battle: { title: "Битва", victory: "Перемога!", defeat: "Поразка", reward_coins: "+{coins} монет", reward_cups: "+{cups} кубків", lose_cups: "{cups} кубків", continue: "Продовжити", revive_ad: "Відродитися за рекламу", difficulty_easy: "Легкий", difficulty_medium: "Середній", difficulty_hard: "Складний", team_selection_title: "Вибір команди", team_selection_subtitle: "Вибери 2 або 3 бійців", before_fight: "Перед боєм", play: "Грати", refuse: "Відмовитися", accept: "Прийняти", crit: "КРИТ", versus_players: "Гравець VS Гравець", players_ready: "Гравці готові до бою", total_damage: "Загальна шкода: {value}" }, box: { opening_title: "Відкриття боксу", opening_hint_collect: "Натисни, щоб забрати нагороду", opening_hint_spin: "Крутиться...", new_brawler: "Новий боєць!", collect: "Забрати" }, leaderboard: { title: "Таблиця лідерів", rank: "Місце", player: "Гравець", score: "Кубки", hidden_player: "Прихований гравець", login_required: "Увійди, щоб потрапити в лідерборд" }, vip: { title: "VIP", webstatus_forever: "VIP статус назавжди", status_active: "VIP активний", status_inactive: "VIP не куплено", benefit_income: "x2 дохід", benefit_cooldown: "Битва", benefit_cooldown_line2: "у 5 разів швидше", benefit_discount: "Покупка нового персонажа", benefit_discount_line2: "завжди 50", buy_vip: "Купити VIP" }, brawlers: { brbrpatapim: "Брбр Патапім", combonagets: "Комбо Нагетс", doge_boss: "Доге Бос", doge_fee: "Доге Фі", fnaf: "ФНАФ", granny: "Гренні", gugugaga: "Гугу Гага", ski_bi_di_toilet: "Скі-Бі Ді Туалет", ninja_capuchino: "Ніндзя Капучіно", paragon: "Парагон", sagur: "Сагур", zhdun: "Ждун" } };

    const uz = { base: { game_title: "Meme Brawl: Birlashtirish Simulyatori", loading: "Yuklanmoqda...", play: "O'ynash", close: "Yopish", buy: "Sotib olish", upgrade: "Yaxshilash", select: "Tanlash", selected: "Tanlandi", cancel: "Bekor qilish", ok: "OK", yes: "Ha", no: "Yo'q", free: "Bepul", reward: "Mukofot", claim: "Olish", skip: "O'tkazib yuborish", price: "Narx", level: "Daraja", hp: "HP", damage: "Zarar", crit: "Krit", coins: "Tangalar", cups: "Kuboklar", progress_cubes: "Kublar", player: "O'yinchi", error: "Xato", unavailable: "Mavjud emas", not_enough_coins: "Tangalar yetarli emas", ad_unavailable: "Reklama mavjud emas", save_error: "Progressni saqlab bo'lmadi" }, menu: { battle: "JANG", battle_locked: "Jang {time} dan so'ng", shop: "Do'kon", profile: "Profil", fighters: "Jangchilar", upgrades: "Yaxshilashlar", leaderboard: "Liderlar", vip: "VIP", settings: "Sozlamalar", box_progress: "Quti", box_ad: "Reklama qutisi", character_offer: "Qahramon taklifi", buy_character: "Jangchi sotib olish" }, profile: { title: "Profil", clicks: "Bosishlar", bought_characters: "Sotib olingan qahramonlar", merges: "Birlashtirishlar", opened_brawlers: "Ochilgan jangchilar", opened_boxes: "Ochilgan qutilar", matches: "Uchrashuvlar", wins: "G'alabalar", losses: "Mag'lubiyatlar", play_time: "O'yin vaqti" }, settings: { title: "Sozlamalar", music: "Musiqa", sound: "Ovoz", language: "Til", community: "Hamjamiyat", reduce_animations: "Unumdorlik rejimi", reduce_animations_hint: "Kamroq animatsiya va effektlar" }, upgrades: { title: "Yaxshilash do'koni", current_value: "Joriy qiymat", current_level: "Joriy daraja", inapps_tab: "Ilova ichida", inapps_title: "Ilova ichidagi xaridlar", inapps_desc: "To'plamlar va maxsus takliflar tez orada", coin_pack_title: "Tanga paketi", upgrade_click_power: "Bosish kuchi", upgrade_click_power_desc: "Har bosishda tangani oshiradi", upgrade_critical_chance: "Kritik imkon", upgrade_critical_chance_desc: "Kritik bosish imkonini oshiradi", upgrade_passive_income: "Passiv daromad", upgrade_passive_income_desc: "Sekundiga passiv tangani oshiradi" }, fighters: { title: "Jangchilar to'plami", locked: "Qulflangan", owned: "Mavjud", choose_team: "3 jangchini tanlang", merge_hint: "2 bir xil jangchi = zanjirdagi keyingisi" }, battle: { title: "Jang", victory: "G'alaba!", defeat: "Mag'lubiyat", reward_coins: "+{coins} tanga", reward_cups: "+{cups} kubok", lose_cups: "{cups} kubok", continue: "Davom etish", revive_ad: "Reklama orqali tirilish", difficulty_easy: "Oson", difficulty_medium: "O'rta", difficulty_hard: "Qiyin", team_selection_title: "Jamoa tanlash", team_selection_subtitle: "2 yoki 3 jangchini tanlang", before_fight: "Jangdan oldin", play: "O'ynash", refuse: "Rad etish", accept: "Qabul qilish", crit: "KRIT", versus_players: "O'yinchi VS O'yinchi", players_ready: "O'yinchilar jangga tayyor", total_damage: "Umumiy zarar: {value}" }, box: { opening_title: "Quti ochish", opening_hint_collect: "Mukofotni olish uchun bosing", opening_hint_spin: "Aylanmoqda...", new_brawler: "Yangi jangchi!", collect: "Olish" }, leaderboard: { title: "Liderlar jadvali", rank: "O'rin", player: "O'yinchi", score: "Kubok", hidden_player: "Yashirin o'yinchi", login_required: "Liderlar jadvaliga kirish uchun tizimga kiring" }, vip: { title: "VIP", webstatus_forever: "VIP holati abadiy", status_active: "VIP faol", status_inactive: "VIP sotib olinmagan", benefit_income: "x2 daromad", benefit_cooldown: "Jang", benefit_cooldown_line2: "5 marta tezroq", benefit_discount: "Yangi qahramon sotib olish", benefit_discount_line2: "har doim 50", buy_vip: "VIP sotib olish" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const vi = { base: { game_title: "Meme Brawl: Trình Mô Phỏng Hợp Nhất", loading: "Đang tải...", play: "Chơi", close: "Đóng", buy: "Mua", upgrade: "Nâng cấp", select: "Chọn", selected: "Đã chọn", cancel: "Hủy", ok: "OK", yes: "Có", no: "Không", free: "Miễn phí", reward: "Phần thưởng", claim: "Nhận", skip: "Bỏ qua", price: "Giá", level: "Cấp", hp: "HP", damage: "Sát thương", crit: "Chí mạng", coins: "Xu", cups: "Cúp", progress_cubes: "Khối", player: "Người chơi", error: "Lỗi", unavailable: "Không khả dụng", not_enough_coins: "Không đủ xu", ad_unavailable: "Quảng cáo không khả dụng", save_error: "Không thể lưu tiến trình" }, menu: { battle: "CHIẾN ĐẤU", battle_locked: "Chiến đấu sau {time}", shop: "Cửa hàng", profile: "Hồ sơ", fighters: "Đấu sĩ", upgrades: "Nâng cấp", leaderboard: "Bảng xếp hạng", vip: "VIP", settings: "Cài đặt", box_progress: "Hộp", box_ad: "Hộp quảng cáo", character_offer: "Ưu đãi nhân vật", buy_character: "Mua đấu sĩ" }, profile: { title: "Hồ sơ", clicks: "Lượt nhấn", bought_characters: "Nhân vật đã mua", merges: "Hợp nhất", opened_brawlers: "Đấu sĩ đã mở", opened_boxes: "Hộp đã mở", matches: "Trận đấu", wins: "Thắng", losses: "Thua", play_time: "Thời gian chơi" }, settings: { title: "Cài đặt", music: "Nhạc", sound: "Âm thanh", language: "Ngôn ngữ", community: "Cộng đồng", reduce_animations: "Chế độ hiệu năng", reduce_animations_hint: "Ít hoạt ảnh và hiệu ứng hơn" }, upgrades: { title: "Cửa hàng nâng cấp", current_value: "Giá trị hiện tại", current_level: "Cấp hiện tại", inapps_tab: "Mua trong app", inapps_title: "Mua trong ứng dụng", inapps_desc: "Gói và ưu đãi đặc biệt sắp ra mắt", coin_pack_title: "Gói xu", upgrade_click_power: "Sức mạnh nhấn", upgrade_click_power_desc: "Tăng xu mỗi lần nhấn", upgrade_critical_chance: "Tỷ lệ chí mạng", upgrade_critical_chance_desc: "Tăng tỷ lệ nhấn chí mạng", upgrade_passive_income: "Thu nhập thụ động", upgrade_passive_income_desc: "Tăng xu thụ động mỗi giây" }, fighters: { title: "Bộ sưu tập đấu sĩ", locked: "Chưa mở", owned: "Đã có", choose_team: "Chọn 3 đấu sĩ", merge_hint: "2 đấu sĩ giống nhau = đấu sĩ tiếp theo trong chuỗi" }, battle: { title: "Trận đấu", victory: "Chiến thắng!", defeat: "Thất bại", reward_coins: "+{coins} xu", reward_cups: "+{cups} cúp", lose_cups: "{cups} cúp", continue: "Tiếp tục", revive_ad: "Hồi sinh bằng quảng cáo", difficulty_easy: "Dễ", difficulty_medium: "Trung bình", difficulty_hard: "Khó", team_selection_title: "Chọn đội", team_selection_subtitle: "Chọn 2 hoặc 3 đấu sĩ", before_fight: "Trước trận đấu", play: "Chơi", refuse: "Từ chối", accept: "Chấp nhận", crit: "CHÍ MẠNG", versus_players: "Người chơi VS Người chơi", players_ready: "Người chơi đã sẵn sàng chiến đấu", total_damage: "Tổng sát thương: {value}" }, box: { opening_title: "Mở hộp", opening_hint_collect: "Chạm để nhận thưởng", opening_hint_spin: "Đang quay...", new_brawler: "Đấu sĩ mới!", collect: "Nhận" }, leaderboard: { title: "Bảng xếp hạng", rank: "Hạng", player: "Người chơi", score: "Cúp", hidden_player: "Người chơi ẩn", login_required: "Đăng nhập để vào bảng xếp hạng" }, vip: { title: "VIP", webstatus_forever: "Trạng thái VIP vĩnh viễn", status_active: "VIP đang hoạt động", status_inactive: "Chưa mua VIP", benefit_income: "x2 thu nhập", benefit_cooldown: "Trận đấu", benefit_cooldown_line2: "nhanh hơn 5 lần", benefit_discount: "Mua nhân vật mới", benefit_discount_line2: "luôn là 50", buy_vip: "Mua VIP" }, brawlers: { brbrpatapim: "Brbr Patapim", combonagets: "Combo Nuggets", doge_boss: "Doge Boss", doge_fee: "Doge Fee", fnaf: "FNAF", granny: "Granny", gugugaga: "Gugu Gaga", ski_bi_di_toilet: "Ski-Bi Di Toilet", ninja_capuchino: "Ninja Capuchino", paragon: "Paragon", sagur: "Sagur", zhdun: "Zhdun" } };

    const localizationMap = {
        ru,
        en,
        es,
        tr,
        de,
        fr,
        ar,
        az,
        zh,
        nl,
        hi,
        id,
        it,
        ja,
        ko,
        kk,
        pl,
        pt,
        th,
        uk,
        uz,
        vi
    };

    function ensureTutorialLocaleKeys() {
        Object.keys(localizationMap).forEach((languageCode) => {
            const locale = localizationMap[languageCode];
            if (!locale || typeof locale !== "object") {
                return;
            }

            locale.tutorial = Object.assign({
                buy_two_characters: ((locale.menu?.buy_character) || "Buy fighter") + " x2",
                merge_one_pair: (locale.fighters?.merge_hint) || "Merge two same fighters",
                press_battle: (locale.menu?.battle) || "Battle",
                pick_first_three: (locale.fighters?.choose_team) || "Choose 3 fighters",
                press_play: (locale.battle?.play) || "Play",
                press_accept: (locale.battle?.accept) || "Accept"
            }, locale.tutorial || {});
        });
    }

    function ensureBattleLocaleKeys() {
        Object.keys(localizationMap).forEach((languageCode) => {
            const locale = localizationMap[languageCode];
            if (!locale || typeof locale !== "object") {
                return;
            }

            locale.battle = Object.assign({
                leave: (locale.base?.close) || "Leave"
            }, locale.battle || {});
        });
    }

    function ensureBaseLocaleKeys() {
        Object.keys(localizationMap).forEach((languageCode) => {
            const locale = localizationMap[languageCode];
            if (!locale || typeof locale !== "object") {
                return;
            }

            locale.base = Object.assign({
                iap_price_rub_short: (localizationMap.en?.base?.iap_price_rub_short) || "RUB"
            }, locale.base || {});
        });
    }

    function normalizeLanguageCode(rawLanguageCode) {
        if (!rawLanguageCode) {
            return "";
        }

        const normalized = String(rawLanguageCode).trim().toLowerCase().replace(/_/g, "-");
        const primary = normalized.split("-")[0] || "";
        const aliases = {
            cn: "zh",
            hb: "he",
            in: "id",
            iw: "he",
            kr: "ko",
            kz: "kk",
            tw: "zh"
        };
        return aliases[primary] || primary;
    }

    function getSupportedLanguages() {
        if (!Array.isArray(window.Base?.supportedLanguages)) {
            return [];
        }

        return window.Base.supportedLanguages.map((code) => normalizeLanguageCode(code));
    }

    function hasTranslationData(languageCode) {
        const normalizedCode = normalizeLanguageCode(languageCode);
        const dictionary = localizationMap[normalizedCode];
        return Boolean(dictionary && typeof dictionary === "object" && Object.keys(dictionary).length > 0);
    }

    function isLanguageSupported(languageCode) {
        const normalizedCode = normalizeLanguageCode(languageCode);
        return getSupportedLanguages().includes(normalizedCode);
    }

    function resolveInitialLanguage(preferredLanguages) {
        const candidates = [];
        const list = Array.isArray(preferredLanguages) ? preferredLanguages : [];

        list.forEach((candidate) => {
            candidates.push(candidate);
        });

        if (Array.isArray(window.navigator?.languages)) {
            window.navigator.languages.forEach((candidate) => {
                candidates.push(candidate);
            });
        }

        if (window.navigator?.language) {
            candidates.push(window.navigator.language);
        }

        for (let index = 0; index < candidates.length; index += 1) {
            const normalizedCode = normalizeLanguageCode(candidates[index]);
            if (!normalizedCode) {
                continue;
            }

            if (isLanguageSupported(normalizedCode) && hasTranslationData(normalizedCode)) {
                return normalizedCode;
            }
        }

        const defaultCode = normalizeLanguageCode(window.Base?.defaultLanguage);
        if (defaultCode && isLanguageSupported(defaultCode) && hasTranslationData(defaultCode)) {
            return defaultCode;
        }

        if (hasTranslationData("en")) {
            return "en";
        }

        if (hasTranslationData("ru")) {
            return "ru";
        }

        const firstAvailable = Object.keys(localizationMap).find((code) => hasTranslationData(code));
        return firstAvailable || defaultCode || "en";
    }

    function collectMissingKeys(baseNode, targetNode, path, output) {
        if (!baseNode || typeof baseNode !== "object") {
            return;
        }

        Object.keys(baseNode).forEach((key) => {
            const nextPath = path ? path + "." + key : key;
            const baseValue = baseNode[key];
            const targetValue = targetNode?.[key];

            if (baseValue && typeof baseValue === "object" && !Array.isArray(baseValue)) {
                collectMissingKeys(baseValue, targetValue, nextPath, output);
                return;
            }

            if (typeof targetValue === "undefined") {
                output.push(nextPath);
            }
        });
    }

    function validateLocales() {
        const baseLocale = localizationMap.en;
        if (!baseLocale || typeof baseLocale !== "object") {
            return;
        }

        Object.keys(localizationMap).forEach((languageCode) => {
            const locale = localizationMap[languageCode];
            const missing = [];
            collectMissingKeys(baseLocale, locale, "", missing);

            if (missing.length > 0) {
                console.warn("Locale has missing keys:", languageCode, missing);
            }
        });
    }

    window.Localization = localizationMap;
    window.GameLocalization = {
        normalizeLanguageCode,
        hasTranslationData,
        isLanguageSupported,
        resolveInitialLanguage
    };

    ensureTutorialLocaleKeys();
    ensureBattleLocaleKeys();
    ensureBaseLocaleKeys();
    validateLocales();
}());
