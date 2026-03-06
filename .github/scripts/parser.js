const axios = require('axios');
const cheerio = require('cheerio');
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

        const $ = cheerio.load(response.data);

        // Максимально простой парсинг
        let rank = 'Неизвестно';
        let rr = '0';
        let lastMatch = 'Нет данных';

        // Просто ищем текст с числами
        const bodyText = $('body').text();

        if (bodyText.includes('Gold')) rank = 'Gold';
        else if (bodyText.includes('Platinum')) rank = 'Platinum';
        else if (bodyText.includes('Diamond')) rank = 'Diamond';
        else if (bodyText.includes('Silver')) rank = 'Silver';
        else if (bodyText.includes('Bronze')) rank = 'Bronze';
        else if (bodyText.includes('Iron')) rank = 'Iron';

        // Ищем RR
        const rrMatch = bodyText.match(/(\d+)\s*RR/);
        if (rrMatch) rr = rrMatch[1];

        // Ищем результат последнего матча
        if (bodyText.includes('Win')) lastMatch = 'Win';
        else if (bodyText.includes('Loss')) lastMatch = 'Loss';
        else if (bodyText.includes('Defeat')) lastMatch = 'Defeat';
        else if (bodyText.includes('Victory')) lastMatch = 'Victory';

        const result = {
            nick: NICKNAME,
            rank: rank,
            rr: rr,
            last_match: lastMatch,
            updated: new Date().toISOString()
        };

        console.log('📊 Данные:', result);

        fs.writeFileSync('rank.json', JSON.stringify(result, null, 2));
        console.log('✅ Файл обновлен!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        // При ошибке создаем тестовые данные
        const testData = {
            nick: NICKNAME,
            rank: "Platinum 3",
            rr: "45",
            last_match: "Win (+12)",
            updated: new Date().toISOString(),
            note: "Тестовые данные (парсер временно не работает)"
        };
        fs.writeFileSync('rank.json', JSON.stringify(testData, null, 2));
    }
}

parseRank();