const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database('./data/wedding.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS wedding_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      groom_name TEXT NOT NULL,
      bride_name TEXT NOT NULL,
      wedding_date TEXT NOT NULL,
      wedding_time TEXT NOT NULL,
      venue_name TEXT NOT NULL,
      venue_address TEXT NOT NULL,
      venue_phone TEXT,
      groom_father TEXT,
      groom_mother TEXT,
      bride_father TEXT,
      bride_mother TEXT,
      groom_phone TEXT,
      bride_phone TEXT,
      wedding_photo TEXT,
      greeting_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      attendance TEXT CHECK(attendance IN ('참석', '불참석', '미정')) DEFAULT '미정',
      guest_count INTEGER DEFAULT 1,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.get("SELECT COUNT(*) as count FROM wedding_info", (err, row) => {
      if (err) {
        console.error(err);
      } else if (row.count === 0) {
        const sampleData = {
          groom_name: '김신랑',
          bride_name: '이신부',
          wedding_date: '2024-12-25',
          wedding_time: '14:00',
          venue_name: '로얄호텔 그랜드볼룸',
          venue_address: '서울시 강남구 테헤란로 123',
          venue_phone: '02-1234-5678',
          groom_father: '김아버지',
          groom_mother: '김어머니',
          bride_father: '이아버지',
          bride_mother: '이어머니',
          groom_phone: '010-1234-5678',
          bride_phone: '010-8765-4321',
          greeting_message: '저희 두 사람이 사랑과 믿음으로 하나가 되는 소중한 날에 귀한 걸음 해주시어 축복해 주시면 감사하겠습니다.'
        };

        const stmt = db.prepare(`INSERT INTO wedding_info 
          (groom_name, bride_name, wedding_date, wedding_time, venue_name, venue_address, venue_phone,
           groom_father, groom_mother, bride_father, bride_mother, groom_phone, bride_phone, greeting_message)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        stmt.run([
          sampleData.groom_name, sampleData.bride_name, sampleData.wedding_date, sampleData.wedding_time,
          sampleData.venue_name, sampleData.venue_address, sampleData.venue_phone,
          sampleData.groom_father, sampleData.groom_mother, sampleData.bride_father, sampleData.bride_mother,
          sampleData.groom_phone, sampleData.bride_phone, sampleData.greeting_message
        ]);
        stmt.finalize();
        console.log('샘플 결혼 정보가 추가되었습니다.');
      }
    });
  });
}

app.get('/api/wedding-info', (req, res) => {
  db.get("SELECT * FROM wedding_info ORDER BY id DESC LIMIT 1", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || {});
  });
});

app.put('/api/wedding-info', (req, res) => {
  const {
    groom_name, bride_name, wedding_date, wedding_time, venue_name, venue_address, venue_phone,
    groom_father, groom_mother, bride_father, bride_mother, groom_phone, bride_phone, greeting_message
  } = req.body;

  db.get("SELECT id FROM wedding_info LIMIT 1", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (row) {
      const stmt = db.prepare(`UPDATE wedding_info SET
        groom_name = ?, bride_name = ?, wedding_date = ?, wedding_time = ?, venue_name = ?, venue_address = ?, venue_phone = ?,
        groom_father = ?, groom_mother = ?, bride_father = ?, bride_mother = ?, groom_phone = ?, bride_phone = ?, greeting_message = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`);
      
      stmt.run([
        groom_name, bride_name, wedding_date, wedding_time, venue_name, venue_address, venue_phone,
        groom_father, groom_mother, bride_father, bride_mother, groom_phone, bride_phone, greeting_message, row.id
      ], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: '결혼 정보가 업데이트되었습니다.' });
      });
      stmt.finalize();
    } else {
      const stmt = db.prepare(`INSERT INTO wedding_info 
        (groom_name, bride_name, wedding_date, wedding_time, venue_name, venue_address, venue_phone,
         groom_father, groom_mother, bride_father, bride_mother, groom_phone, bride_phone, greeting_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      stmt.run([
        groom_name, bride_name, wedding_date, wedding_time, venue_name, venue_address, venue_phone,
        groom_father, groom_mother, bride_father, bride_mother, groom_phone, bride_phone, greeting_message
      ], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: '결혼 정보가 생성되었습니다.', id: this.lastID });
      });
      stmt.finalize();
    }
  });
});

app.get('/api/guests', (req, res) => {
  db.all("SELECT * FROM guests ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/guests', (req, res) => {
  const { name, phone, attendance, guest_count, message } = req.body;
  
  if (!name) {
    res.status(400).json({ error: '이름은 필수입니다.' });
    return;
  }

  const stmt = db.prepare("INSERT INTO guests (name, phone, attendance, guest_count, message) VALUES (?, ?, ?, ?, ?)");
  stmt.run([name, phone, attendance || '미정', guest_count || 1, message], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      message: '참석 정보가 등록되었습니다.',
      id: this.lastID 
    });
  });
  stmt.finalize();
});

app.put('/api/guests/:id', (req, res) => {
  const { id } = req.params;
  const { name, phone, attendance, guest_count, message } = req.body;

  const stmt = db.prepare("UPDATE guests SET name = ?, phone = ?, attendance = ?, guest_count = ?, message = ? WHERE id = ?");
  stmt.run([name, phone, attendance, guest_count, message, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '참석 정보가 업데이트되었습니다.' });
  });
  stmt.finalize();
});

app.get('/api/guestbook', (req, res) => {
  db.all("SELECT * FROM guestbook ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/guestbook', (req, res) => {
  const { name, message } = req.body;
  
  if (!name || !message) {
    res.status(400).json({ error: '이름과 메시지는 필수입니다.' });
    return;
  }

  const stmt = db.prepare("INSERT INTO guestbook (name, message) VALUES (?, ?)");
  stmt.run([name, message], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      message: '방명록이 등록되었습니다.',
      id: this.lastID 
    });
  });
  stmt.finalize();
});

app.get('/api/stats', (req, res) => {
  db.serialize(() => {
    let stats = {};
    
    db.get("SELECT COUNT(*) as total, SUM(guest_count) as total_guests FROM guests", (err, guestStats) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      stats.guests = guestStats;
      
      db.get("SELECT COUNT(*) as total FROM guests WHERE attendance = '참석'", (err, attendingStats) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        stats.attending = attendingStats.total;
        
        db.get("SELECT COUNT(*) as total FROM guestbook", (err, guestbookStats) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          stats.guestbook = guestbookStats.total;
          
          res.json(stats);
        });
      });
    });
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('데이터베이스 연결이 종료되었습니다.');
    process.exit(0);
  });
});