const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const NICKNAME = 'TL kawazaki';
const TAG = '我疯了';

async function parseRank() {
    try {
        const url = `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(NICKNAME)}%23${encodeURIComponent(TAG)}/overview`;
        
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(data);
        
        const rank = $('.valorant-rank').text().trim() || 'Неизвестно';
        const rr = $('.valorant-rr').text().trim() || '0';
        const lastMatch = $('.match-result').first().text().trim() || 'Нет данных';

        const result = {
            nick: NICKNAME,
            rank: rank,
            rr: rr,
            last_match: lastMatch,
            updated: new Date().toISOString()
        };

        fs.writeFileSync('rank.json', JSON.stringify(result, null, 2));
        console.log('✅ Данные обновлены:', result);
        
    } catch (error) {
        console.error('❌ Ошибка парсинга:', error.message);
        process.exit(1);
    }
}

parseRank();
