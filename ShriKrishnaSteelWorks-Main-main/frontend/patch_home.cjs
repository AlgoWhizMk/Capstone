const fs = require('fs');

let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Add imports
const imports = `import { MappedProduct, mapApiProduct, Stars } from "./Products";\n`;
home = home.replace('import { Link } from "react-router-dom";', 'import { Link } from "react-router-dom";\n' + imports);

// 2. Modify liveProducts definition
home = home.replace(
    'const [liveProducts, setLiveProducts] = useState<Product[]>(PRODUCTS);',
    'const [liveProducts, setLiveProducts] = useState<MappedProduct[]>([]);\n  const [hoveredCard, setHoveredCard] = useState<string | null>(null);'
);

// 3. Update the useEffect logic
const oldFetchEffectMatch = home.match(/useEffect\(\(\) => \{\s*fetch\(`\$\{API\}\/api\/products\?limit=6`\).*?\}, \[\]\);/s);
if (oldFetchEffectMatch) {
    const newFetchEffect = `useEffect(() => {
    fetch(\`\$\{API\}\/api\/products?limit=6\`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data?.products;
        if (list && list.length > 0) {
          setLiveProducts(list.slice(0, 6).map(mapApiProduct));
        }
      })
      .catch(() => {});
  }, []);`;
    home = home.replace(oldFetchEffectMatch[0], newFetchEffect);
}

// 4. Update JSX grid
const oldGridMatch = home.match(/<div className="skw-products-grid">.*?<div className="skw-products-cta">/s);
if (oldGridMatch) {
    const newGrid = `<div className="xgrid" style={{ marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.6rem" }}>
          {liveProducts.map((product, i) => {
            const avClass = product.stock === "In Stock" ? "av-in" : product.stock === "Low Stock" ? "av-low" : "av-mto";
            return (
              <div
                key={product.id}
                className={\`xcard vis \${hoveredCard === product.id ? "hov" : ""}\`}
                style={{ "--ca": product.accentColor, "--cg": product.glowColor, animationDelay: \`\${Math.min(i, 8) * 0.055}s\` } as React.CSSProperties}
                onMouseEnter={() => setHoveredCard(product.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="xcard-ring" />
                <div className="xcard-img">
                  <img
                    className="ximg-main"
                    src={product.images[0]}
                    alt={product.name} loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = \`https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=70&sig=\${i % 12}\`; }}
                  />
                  {product.images[1] && (
                    <img
                      className="ximg-hover"
                      src={product.images[1]}
                      alt={\`\${product.name} alternate\`} loading="lazy"
                    />
                  )}
                  <div className="xcard-shade" />
                  <span className="xtag" style={{ background: product.accentColor }}>{product.tag}</span>
                  <div className={\`xav \${avClass}\`}><span className="xav-dot" />{product.stock}</div>
                </div>

                <div className="xcard-body">
                  <div className="xcard-cat" style={{ color: product.accentColor }}>{product.category}</div>
                  <h3 className="xcard-name">{product.name}</h3>
                  <div className="xcard-grade">
                    <span className="xgdot" style={{ background: product.accentColor }} />
                    {product.grade}
                    <span style={{ marginLeft: "auto" }}><Stars rating={product.rating} /></span>
                  </div>
                  <p className="xcard-desc">{product.shortDesc}</p>
                  <div className="xspec-pills">
                    {Object.entries(product.cardSpecs).map(([k, v]) => (
                      <div key={k} className="xspec-pill">
                        <span className="xspk">{k}</span>
                        <span className="xspv" style={{ color: product.accentColor }}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="xprice-row">
                    <div className="xprice-main">
                      <span className="xprice-v" style={{ color: product.accentColor }}>{product.price}</span>
                      <span className="xprice-u">{product.unit}</span>
                    </div>
                    <div className="xprice-meta">
                      <span className="xmchip">⏱ {product.lead}</span>
                      <span className="xmchip">🛡 {product.warranty}</span>
                    </div>
                  </div>
                  <div className="xcard-acts">
                    <Link to="/products" className="xbtn-detail" style={{ "--ca": product.accentColor } as React.CSSProperties}>
                      Buy Now
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <style>{CARD_CSS}</style>
        <div className="skw-products-cta">`;
    home = home.replace(oldGridMatch[0], newGrid);
} else { console.log('Old grid not matched'); }

const cardCss = fs.readFileSync('card_styles.css', 'utf8');

home += '\nconst CARD_CSS = ' + JSON.stringify(cardCss + `
@media(max-width:1100px) { .skw-home .xgrid { grid-template-columns: repeat(2, 1fr) !important; } }
@media(max-width:640px) { .skw-home .xgrid { grid-template-columns: 1fr !important; } }
`) + ';\n';

fs.writeFileSync('src/pages/Home.tsx', home);
console.log('patched');
