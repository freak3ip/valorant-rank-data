const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const NICKNAME = 'TL kawazaki';
const TAG = '我疯了';

async function parseRank() {
    try {
        console.log('🔄 Начинаем парсинг...');

        const url = `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(NICKNAME)}%23${encodeURIComponent(TAG)}/overview`;
        console.log('📡 URL:', url);

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
            }
        });

        const $ = cheerio.load(data);

        // Пробуем разные селекторы (tracker.gg часто меняет классы)
        let rank = $('.valorant-rank').text().trim() ||
                  $('.rank').text().trim() ||
                  $('.rating').text().trim() ||
                  'Неизвестно';

        let rr = $('.valorant-rr').text().trim() ||
                $('.rr').text().trim() ||
                '0';

        let lastMatch = $('.match-result').first().text().trim() ||
                       $('.result').first().text().trim() ||
                       'Нет данных';

        // Очищаем от лишних пробелов и переносов
        rank = rank.replace(/\s+/g, ' ').trim();
        rr = rr.replace(/\s+/g, ' ').trim();
        lastMatch = lastMatch.replace(/\s+/g, ' ').trim();

        const result = {
            nick: NICKNAME,
            rank: rank || 'Неизвестно',
            rr: rr || '0',
            last_match: lastMatch || 'Нет данных',
            updated: new Date().toISOString()
        };

        console.log('📊 Полученные данные:', result);

        fs.writeFileSync('rank.json', JSON.stringify(result, null, 2));
        console.log('✅ Файл rank.json успешно обновлен!');

    } catch (error) {
        console.error('❌ Ошибка парсинга:', error.message);
        if (error.response) {
            console.error('Статус ответа:', error.response.status);
        }
        process.exit(1);
    }
}

parseRank();