const axios = require('axios');
const fs = require('fs');

const NICKNAME = 'TL kawazaki';
const TAG = '我疯了';

async function parseRank() {
    try {
        console.log('🔄 Начинаем парсинг...');

        const url = `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(NICKNAME)}%23${encodeURIComponent(TAG)}/overview`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const html = response.data;

        // Простейший поиск по тексту
        let rank = 'Неизвестно';
        let rr = '0';
        let lastMatch = 'Нет данных';

        // Ищем ранг
        if (html.includes('Platinum')) rank = 'Platinum';
        else if (html.includes('Gold')) rank = 'Gold';
        else if (html.includes('Silver')) rank = 'Silver';
        else if (html.includes('Bronze')) rank = 'Bronze';
        else if (html.includes('Iron')) rank = 'Iron';
        else if (html.includes('Diamond')) rank = 'Diamond';
        else if (html.includes('Immortal')) rank = 'Immortal';
        else if (html.includes('Radiant')) rank = 'Radiant';

        // Ищем число (RR)
        const rrMatch = html.match(/(\d+)\s*RR/);
        if (rrMatch) rr = rrMatch[1];

        // Ищем последний матч
        if (html.includes('Win') || html.includes('Victory')) lastMatch = 'Win';
        else if (html.includes('Loss') || html.includes('Defeat')) lastMatch = 'Loss';

        // Ищем точный ранг (с цифрой, например "Platinum 3")
        const rankMatch = html.match(/(Platinum|Gold|Silver|Bronze|Iron|Diamond|Immortal|Radiant)\s*(\d)/);
        if (rankMatch) {
            rank = rankMatch[1] + ' ' + rankMatch[2];
        }

        const result = {
            nick: NICKNAME,
            rank: rank,
            rr: rr,
            last_match: lastMatch,
            updated: new Date().toISOString()
        };

        console.log('📊 Найденные данные:', result);

        fs.writeFileSync('rank.json', JSON.stringify(result, null, 2));
        console.log('✅ Файл rank.json обновлен!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);

        // Создаём заглушку с твоими реальными данными (которые мы знаем)
        const fallbackData = {
            nick: NICKNAME,
            rank: "Platinum 3",  // Твой реальный ранг
            rr: "45",             // Твой реальный RR
            last_match: "Win (+12)",
            updated: new Date().toISOString(),
            note: "Ручной ввод (авто-парсер временно не работает)"
        };

        fs.writeFileSync('rank.json', JSON.stringify(fallbackData, null, 2));
        console.log('📝 Создан fallback файл с твоими данными');
    }
}

parseRank();