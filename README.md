# valintojen-toteuttaminen

Valintojen toteuttamisen käyttöliittymä

## Deploy

Asenna ensin sovelluksen riippuvuudet ja buildaa next.js sovellus:

    npm ci
    npm run build

Deploy untuvalle onnistuu komennolla:

    ./deploy.sh untuva deploy -d
