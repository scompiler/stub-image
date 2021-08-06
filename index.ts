import path from 'path';
import Jimp from 'jimp';
import { Font } from '@jimp/plugin-print';

const loadFont = Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);

function getMimeType(extension: string) {
    extension = extension.substr(1).toLowerCase();

    switch (extension) {
        case 'jpeg':
        case 'jpg':
            return Jimp.MIME_JPEG;
        case 'png':
            return Jimp.MIME_PNG;
    }

    throw new Error();
}

function fillImage(image: Jimp, color: number) {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, offset) {
        this.bitmap.data.writeUInt32BE(color, offset);
    });
}


/**
 * @param font
 * @param {string} text
 */
function measureText(font: Font, text: string) {
    const w = Jimp.measureText(font, text);
    const h = Jimp.measureTextHeight(font, text, w + 10);

    return [w, h];
}

export async function stubImage(image: Buffer, imagePath: string): Promise<Buffer> {
    const extension = path.extname(path.basename(imagePath));
    const mimeType = getMimeType(extension);
    const jimpImage = await Jimp.read(image);

    const w = jimpImage.bitmap.width;
    const h = jimpImage.bitmap.height;

    fillImage(jimpImage, 0xE5E5E5FF);

    if (w >= 32 && h >= 16) {
        const text = `${w}x${h}`;
        const font = await loadFont;
        const [textW, textH] = measureText(font, text);

        const textImage = new Jimp(textW, textH) as unknown as Jimp;

        textImage.print(font, 0, 0, text);
        textImage.color([
            {apply: 'red', params: [128]},
            {apply: 'green', params: [128]},
            {apply: 'blue', params: [128]}
        ]);

        const scaleFactor = Math.min(1, (w * .8) / textW, (h * .8) / textH);
        const textNewW = Math.round(textW * scaleFactor);
        const textNewH = Math.round(textH * scaleFactor);

        textImage.resize(textNewW, textNewH);

        jimpImage.composite(
            textImage,
            Math.round(w / 2 - textNewW / 2),
            Math.round(h / 2 - textNewH / 2)
        );
    }

    return new Promise<Buffer>(resolve => jimpImage.getBuffer(mimeType, (error, buffer) => {
        if (error) {
            throw error;
        }

        resolve(buffer);
    }));
}
