const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5002;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./wedding.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
    initDatabase();
  }
});

// 데이터베이스 테이블 초기화
function initDatabase() {
  // 방명록 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 갤러리 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      caption TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 결혼 정보 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS wedding_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bride_name TEXT DEFAULT '신부',
      groom_name TEXT DEFAULT '신랑',
      wedding_date TEXT DEFAULT '2024-04-15',
      wedding_time TEXT DEFAULT '오후 2시',
      venue_name TEXT DEFAULT '벚꽃 컨벤션 웨딩홀',
      venue_address TEXT DEFAULT '서울시 강남구 벚꽃길 123',
      contact_bride TEXT DEFAULT '010-1234-5678',
      contact_groom TEXT DEFAULT '010-9876-5432'
    )
  `);

  // 기본 결혼 정보 삽입
  db.get("SELECT COUNT(*) as count FROM wedding_info", (err, row) => {
    if (err) {
      console.error('결혼 정보 조회 오류:', err.message);
      return;
    }
    if (row && row.count === 0) {
      db.run(`
        INSERT INTO wedding_info (bride_name, groom_name, wedding_date, wedding_time, venue_name, venue_address)
        VALUES ('지은', '민수', '2024-05-18', '오후 2시 30분', '벚꽃가든 웨딩홀', '서울시 서초구 벚꽃로 456')
      `);
    }
  });
}

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// API 라우트

// 결혼 정보 조회
app.get('/api/wedding-info', (req, res) => {
  db.get("SELECT * FROM wedding_info LIMIT 1", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(row);
    }
  });
});

// 방명록 조회
app.get('/api/guestbook', (req, res) => {
  db.all("SELECT * FROM guestbook ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// 방명록 작성
app.post('/api/guestbook', (req, res) => {
  const { name, message } = req.body;
  
  if (!name || !message) {
    return res.status(400).json({ error: '이름과 메시지를 모두 입력해주세요.' });
  }

  db.run(
    "INSERT INTO guestbook (name, message) VALUES (?, ?)",
    [name, message],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ 
          id: this.lastID,
          message: '방명록이 성공적으로 작성되었습니다.'
        });
      }
    }
  );
});

// 갤러리 조회
app.get('/api/gallery', (req, res) => {
  db.all("SELECT * FROM gallery ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// 갤러리 이미지 업로드
app.post('/api/gallery', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '이미지 파일을 선택해주세요.' });
  }

  const { caption } = req.body;
  
  db.run(
    "INSERT INTO gallery (filename, original_name, caption) VALUES (?, ?, ?)",
    [req.file.filename, req.file.originalname, caption || ''],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ 
          id: this.lastID,
          filename: req.file.filename,
          message: '이미지가 성공적으로 업로드되었습니다.'
        });
      }
    }
  );
});

// Vue.js 앱 서빙 (프로덕션용)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`🌸 벚꽃 청첩장 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 프로세스 종료 시 데이터베이스 연결 종료
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('데이터베이스 연결이 종료되었습니다.');
    process.exit(0);
  });
});