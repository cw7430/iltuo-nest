import { Injectable } from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import { randomUUID } from 'crypto';
import { pipeline } from 'stream/promises';
import * as fs from 'fs';
import * as path from 'path';
import { Transform } from 'stream';

import { CustomException } from '@/common/api/exception';

@Injectable()
export class FileUtil {
  getFileInfo(file: MultipartFile | undefined) {
    if (!file) {
      throw new CustomException('RESOURCE_NOT_FOUND');
    }

    const mimeType = file.mimetype;

    const uuid = randomUUID();
    const originalName = file.filename;

    const ext = path.extname(originalName);
    const fileName = `${uuid}${ext}`;

    return { file, fileName, originalName, mimeType };
  }

  async uploadImage(
    info: {
      file: MultipartFile;
      fileName: string;
      originalName: string;
      mimeType: string;
    },
    dir: string,
  ) {
    const mimeType = info.file.mimetype;

    if (!mimeType.startsWith('image/')) {
      throw new CustomException('CONFLICT');
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'img', dir);
    const filePath = path.join(uploadDir, info.fileName);

    await fs.promises.mkdir(uploadDir, { recursive: true });

    let totalSize = 0;

    const sizeTracker = new Transform({
      transform(chunk: Buffer, _, callback) {
        totalSize += chunk.length;
        callback(null, chunk);
      },
    });

    await pipeline(info.file.file, sizeTracker, fs.createWriteStream(filePath));

    const fileSize = BigInt(totalSize);

    return { fileSize };
  }

  async unlinkFile(type: 'img' | 'vid', dir: string, fileName: string) {
    await fs.promises.unlink(
      path.join(process.cwd(), 'uploads', type, dir, fileName),
    );
  }
}
