const HAKUTAPA_CODES = [{"koodiUri":"hakutapa_01","metadata":[{"nimi":"Yhteishaku","lyhytNimi":"YH","kieli":"FI"},{"nimi":"Gemensam ansökan","lyhytNimi":"GA","kieli":"SV"},{"nimi":"Joint application","lyhytNimi":"","kieli":"EN"}],"versio":1,"koodiArvo":"01"},{"koodiUri":"hakutapa_04","metadata":[{"nimi":"Joustava haku","lyhytNimi":"","kieli":"FI"},{"nimi":"Rolling admission (higher education)","lyhytNimi":"","kieli":"EN"},{"nimi":"Flexibel ansökan","lyhytNimi":"","kieli":"SV"}],"versio":1,"koodiArvo":"04"},{"koodiUri":"hakutapa_05","metadata":[{"nimi":"Siirtohaku","lyhytNimi":"","kieli":"FI"},{"nimi":"Ansökan om överflyttning","lyhytNimi":"","kieli":"SV"},{"nimi":"Transfer application","lyhytNimi":"","kieli":"EN"}],"versio":1,"koodiArvo":"05"},{"koodiUri":"hakutapa_02","metadata":[{"nimi":"Separata antagningar","lyhytNimi":"SA","kieli":"SV"},{"nimi":"Separate application","lyhytNimi":"","kieli":"EN"},{"nimi":"Erillishaku","lyhytNimi":"EH","kieli":"FI"}],"versio":1,"koodiArvo":"02"},{"koodiUri":"hakutapa_03","metadata":[{"nimi":"Rolling admission (upper secondary level)","lyhytNimi":"","kieli":"EN"},{"nimi":"Jatkuva haku","lyhytNimi":"JH","kieli":"FI"},{"nimi":"Kontinuerlig ansökan","lyhytNimi":"FA","kieli":"SV"}],"versio":1,"koodiArvo":"03"},{"koodiUri":"hakutapa_06","metadata":[{"nimi":"Lisähaku","lyhytNimi":"","kieli":"FI"},{"nimi":"Tilläggsansökan","lyhytNimi":"","kieli":"SV"},{"nimi":"Supplementary application","lyhytNimi":"","kieli":"EN"}],"versio":1,"koodiArvo":"06"}];

module.exports = [
  {
    id: "get-hakutapa-codes",
    url: "/koodisto-service/rest/codeelement/codes/hakutapa",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: HAKUTAPA_CODES,
        },
      },
    ],
  }];