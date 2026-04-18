const fs = require('fs');

let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Remove Product type
home = home.replace(/interface Product \{[\s\S]*?\n\}/, '');

// 2. Remove PRODUCTS array
home = home.replace(/const PRODUCTS: Product\[\] = \[[\s\S]*?\];\n/, '');
// Might have failed due to type now missing, try another regex
home = home.replace(/const PRODUCTS.*? = \[[\s\S]*?\];\n/, '');

// 3. Remove ProductModal
home = home.replace(/\/\/\s*─── Product Detail Modal[\s\S]*?function ProductModal[\s\S]*?(?=\/\/\s*─── Project Detail Modal)/, '');

// 4. Remove selectedProduct state
home = home.replace(/const \[selectedProduct, setSelectedProduct\].*?\n/, '');

// 5. Remove any remaining usage of <ProductModal />
home = home.replace(/\{selectedProduct && \(\s*<ProductModal.*?onClose=\{.*?\}\s*\/>\s*\)\}/, '');

fs.writeFileSync('src/pages/Home.tsx', home);
console.log('Cleaned up Home.tsx');
