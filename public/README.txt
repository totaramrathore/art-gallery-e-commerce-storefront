OCHRE & ASH GALLERY — IMAGE ASSETS
==================================

37 unique image files, 8.6 MB total.
Every image the storefront uses is in this archive.

FOLDERS
-------
  art/           10 original artwork images — hero, collection covers,
                 artist portraits and the primary photograph of each work.
                 These were generated for this project and ship with it.
  art/gallery/   27 gallery, detail and in-situ photographs used as the
                 secondary images in each product's gallery.

WHERE THEY LIVE IN THE PROJECT
------------------------------
  public/art/*.jpg            primary images
  public/art/gallery/*.jpg    gallery / detail images
Paths in the database are root-relative (e.g. "/art/gallery/pexels-24345753.jpg"),
which maps onto the "public" folder.

HOW THEY ARE WIRED UP
---------------------
  src/db/seed.ts   the P object maps each slot to one of these files
  products.image           primary image
  product_images.url       gallery images (position 0 is the primary)
  collections.image        the five collection covers
  artists.image            the six artist portraits
Re-run  npm run seed  after changing any of them.

MANIFEST
--------
  MANIFEST.csv lists, for every file: its size, its type, the Pexels photo id
  and page it came from, the photographer where recorded, and exactly which
  product, collection or artist page it appears on.

LICENSING
---------
  art/           Generated for this project — use freely.
  art/gallery/   Pexels license: free for commercial use, no attribution
                 required. Photographer credits and the source page for each
                 image are recorded in MANIFEST.csv as a courtesy.
