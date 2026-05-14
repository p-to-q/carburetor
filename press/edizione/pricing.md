# pricing

the full cost model for edizione I. open the spreadsheet at the end if you want to flex the inputs.

## inputs (locked or near-locked)

```
run size                  100 units
trim                      148 × 210 mm (A5)
pages                     32 interior + 4 cover
paper                     80 gsm interior, 120 gsm cover
inks                      K interior, K + brass spot cover
binding                   saddle-stitch
retail price              $25 USD per unit
distribution split        60 sold / 25 gifted / 15 archive
```

## variable costs (per unit, at 100-unit run)

```
print (interior + cover)               $4.20    Mixam quote estimate
binding + trim                         $0.40
brass serial stamp (page 2)            $0.10    ink + labor amortized
brass corner stamp (cover)             $0.20    one stamp per cover
packaging
  · kraft mailer 5x7                   $0.50
  · cardboard stiffener (chipboard)    $0.30
  · brass-paper-tape seal              $0.40    aesthetic, not functional
shipping
  · domestic (USPS Media Mail)         $4.50    7-14 day delivery
  · international (USPS First-Class)   $14.00   per-region varies
─────────────────────────────────────────────────────────────────────
total per-unit, domestic               $10.60
total per-unit, international          $20.10
```

## fixed costs (one-time)

```
typeface licensing                     $0      IBM Plex is OFL (free)
PDF prepress check (PDFtoolbox)        $0      done in-house
vendor proof (physical, 1 unit)        $50     paid once
brass stamp custom die                 $30     one-time
serial stamp + ink pad                 $25     reusable across editions
pre-order page (carburetor.wtf/edizione)  $0   on existing hosting
─────────────────────────────────────────────────────────────────────
fixed costs total                      $105
```

## the budget

```
INCOME (100 units)

  60 sold @ $25                        $1,500.00
  25 gifted (contributors)             $    0.00
  15 archive                           $    0.00
                                       ─────────
  total income                         $1,500.00


COST (100 units)

  100 units × $4.20 print               $   420
  100 units × $0.40 bind                $    40
  100 units × $0.30 stamps              $    30
  100 units × $0.80 packaging           $    80
  60 units  × $4.50 dom. shipping       $   270
  fixed costs                           $   105
                                        ─────────
  total cost                            $   945


SURPLUS                                 $   555 (≈$5.55/unit sold)
```

surplus is held in a "edizione II print fund" line item. no one is paid from it. when it crosses ~$1,000 we order edizione II.

## sensitivity

what moves the surplus?

```
                                       Δ SURPLUS    NOTES
unit cost down $1                      +$100        better vendor quote
shipping up $1                         −$60         postal rate hike
brass treatment expensive (foil)       −$150        if Mixam can't do spot
run size up to 200                     +$400        if pre-orders justify
retail price down to $20               −$300        if 60 sales is hard
retail price up to $30                 +$300        if waitlist is healthy
```

base case is conservative. if pre-order signal is strong we move to 200-unit run and price stays at $25.

## price discipline

three things we will never do:

1. **never sell at a loss.** if the unit cost rises above $12 domestic, we raise retail before we shrink the run.
2. **never sell at a margin > 100 % of cost.** $25 retail vs $10.60 cost ≈ 2.36× — that is the ceiling. we are not running a startup.
3. **never charge for the digital PDF.** the print is paid; the PDF is free under CC-BY-SA 4.0.

## the spreadsheet (csv form, copy-paste into Numbers/Sheets)

```csv
item,unit_cost_usd,qty,total_usd,notes
print,4.20,100,420.00,Mixam estimate
bind,0.40,100,40.00,saddle stitch + trim
stamps,0.30,100,30.00,serial + cover
packaging,0.80,100,80.00,kraft + chipboard + tape
shipping_dom,4.50,60,270.00,usps media mail
proof,50.00,1,50.00,physical proof
stamp_die,30.00,1,30.00,one-time
stamp_kit,25.00,1,25.00,reusable
TOTAL_COST,,,945.00,
,,,,
retail_dom,25.00,60,1500.00,
TOTAL_INCOME,,,1500.00,
,,,,
SURPLUS,,,555.00,returns to edizione II
```

`Q.E.D.`
