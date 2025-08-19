import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';

// 업로드 디렉토리 설정
const uploadDir = path.join(process.cwd(), 'uploads');
const photoDir = path.join(uploadDir, 'photos');
const thumbnailDir = path.join(uploadDir, 'thumbnails');

// 디렉토리 생성
const ensureDirectories = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(photoDir, { recursive: true });
    await fs.mkdir(thumbnailDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
};

ensureDirectories();

// Multer 설정
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 이미지 파일만 허용
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
    files: 10 // 최대 10개 파일
  }
});

// 이미지 처리 미들웨어
export const processImages = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files)) {
    return next();
  }

  try {
    const processedFiles: Array<{
      filename: string;
      originalName: string;
      size: number;
      mimetype: string;
    }> = [];

    for (const file of req.files) {
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1E9);
      const filename = `${timestamp}-${randomSuffix}.webp`;
      const thumbnailFilename = `thumb-${filename}`;

      // 원본 이미지 처리 (WebP 포맷으로 변환, 품질 최적화)
      await sharp(file.buffer)
        .resize(1920, 1080, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: 85 })
        .toFile(path.join(photoDir, filename));

      // 썸네일 생성
      await sharp(file.buffer)
        .resize(300, 300, { 
          fit: 'cover' 
        })
        .webp({ quality: 70 })
        .toFile(path.join(thumbnailDir, thumbnailFilename));

      // 파일 크기 계산
      const stats = await fs.stat(path.join(photoDir, filename));

      processedFiles.push({
        filename,
        originalName: file.originalname,
        size: stats.size,
        mimetype: 'image/webp'
      });
    }

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ message: '이미지 처리 중 오류가 발생했습니다.' });
  }
};

// 타입 확장
declare global {
  namespace Express {
    interface Request {
      processedFiles?: Array<{
        filename: string;
        originalName: string;
        size: number;
        mimetype: string;
      }>;
    }
  }
}