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

        // Используем старый добрый axios без наворотов
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Ищем ранг
        let rank = 'Неизвестно';
        $('div').each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes('Gold') || text.includes('Platinum') || text.includes('Diamond') ||
                text.includes('Silver') || text.includes('Bronze') || text.includes('Iron')) {
                rank = text;
            }
        });

        // Ищем RR
        let rr = '0';
        $('div').each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes('RR') || text.match(/\d+\s*RR/)) {
                rr = text;
            }
        });

        // Ищем последний матч
        let lastMatch = 'Нет данных';
        $('span, div').each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes('Win') || text.includes('Loss') || text.includes('Defeat')) {
                lastMatch = text;
            }
        });

        const result = {
            nick: NICKNAME,
            rank: rank.substring(0, 50),
            rr: rr.substring(0, 20),
            last_match: lastMatch.substring(0, 50),
            updated: new Date().toISOString()
        };

        console.log('📊 Найденные данные:', result);

        fs.writeFileSync('rank.json', JSON.stringify(result, null, 2));
        console.log('✅ Файл rank.json успешно обновлен!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        // Создаём заглушку при ошибке
        const fallback = {
            nick: NICKNAME,
            rank: 'Временно недоступно',
            rr: '0',
            last_match: 'Ошибка парсинга',
            updated: new Date().toISOString(),
            error: error.message
        };
        fs.writeFileSync('rank.json', JSON.stringify(fallback, null, 2));
        console.log('📝 Создан fallback файл');
        process.exit(0); // Не падаем с ошибкой
    }
}

parseRank();