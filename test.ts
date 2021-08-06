import path from 'path';
import fs from 'fs';
import { stubImage } from "./index";

(async () => {
    const entries = fs.readdirSync(path.join(__dirname, 'images'));

    for (let entry of entries) {
        if (['.', '..'].includes(entry)) {
            continue;
        }

        const image = await stubImage(fs.readFileSync(path.join(__dirname, 'images', entry)), entry);

        if (!fs.existsSync(path.join(__dirname, 'stub-images'))) {
            fs.mkdirSync(path.join(__dirname, 'stub-images'));
        }

        fs.writeFileSync(path.join(__dirname, 'stub-images', entry), image);
    }
})();
