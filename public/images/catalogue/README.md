# Catalogue images

Drop photographs here, one file per product, named by category code:

| Prefix | Category | Example |
| --- | --- | --- |
| `R` | Gold rings | `R-001.jpg` |
| `D` | Diamond rings | `D-001.jpg` |
| `E` | Earrings | `E-001.jpg` |
| `N` | Necklaces | `N-001.jpg` |
| `P` | Pendants | `P-001.jpg` |
| `B` | Bangles | `B-001.jpg` |
| `M` | Mangalsutra | `M-001.jpg` |
| `S` | Silver | `S-001.jpg` |
| `BR` | Bracelets | `BR-001.jpg` |
| `NP` | Nose pins | `NP-001.jpg` |
| `SC` | Silver coins & idols | `SC-001.jpg` |
| `MN` | Men's | `MN-001.jpg` |
| `K` | Kids | `K-001.jpg` |

Then run:

```bash
npm run catalogue
```

The script writes `thumbs/` (400px WebP), `full/` (1000px WebP) and
`src/data/catalogue.json`. One image = one product; the name is
`[Category] [code]` unless overridden.

## Optional details

Add `products.csv` in this folder (or export a Google Sheet as CSV) to supply
facts the photograph cannot:

```csv
code,name,weight_g,purity,making_percent,subtype,occasion,status,featured
R-001,Gold Ring R-001,3.4,22K,12,solitaire,wedding,available,true
D-001,Diamond Ring D-001,2.8,18K,15,halo,gifting,available,false
```

- `weight_g` missing or 0 → the site shows **Price on request** and an Enquire
  button. It never invents a weight.
- `purity` accepts `24K`, `22K`, `18K`, `925`, `999`.
- `status` can be `available`, `made-to-order`, `sold` or `hidden`.
- `making_percent` defaults per category when absent.
