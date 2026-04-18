const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Fix type import
home = home.replace(
    'import { MappedProduct, mapApiProduct, Stars } from "./Products";',
    'import { mapApiProduct, Stars } from "./Products";\nimport type { MappedProduct } from "./Products";'
);

// Remove unused PRODUCTS constant
const start = home.indexOf('const PRODUCTS: Product[] = [');
if (start !== -1) {
    const end = home.indexOf('];\n', start);
    if (end !== -1) {
        home = home.substring(0, start) + home.substring(end + 3);
    }
}

fs.writeFileSync('src/pages/Home.tsx', home);
console.log('fixed');
