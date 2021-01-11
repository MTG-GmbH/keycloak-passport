const util = require('util');
const OAuth2Strategy = require('passport-oauth2');

function Strategy(options, verify) {
  [
    'host',
    'realm',
    'clientID',
    'clientSecret',
    'callbackURL',
    'authorizationURL',
    'tokenURL',
    'userInfoURL'
  ].forEach((k) => {
    if (!options[k]) {
      throw new Error(`${k} is required`);
    }
  });

  this.options = options;
  this._base = Object.getPrototypeOf(Strategy.prototype);
  this._base.constructor.call(this, this.options, verify);
  this.name = 'Keycloak';
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2._useAuthorizationHeaderForGET = true;
  this._oauth2.get(this.options.userInfoURL, accessToken, (err, body) => {
    if (err) {
      return done(err);
    }

    try {
      const json = JSON.parse(body);

      const keycloakId = json.sub;
      const fullName = json.name;
      const firstName = json.given_name;
      const lastName = json.family_name;
      const username = json.preferred_username;
      const email = json.email;
      const avatar = json.avatar;
      const realm = this.options.realm;

      let addressStreet = undefined;
      let addressHouseNumber = undefined;
      let addressPostalCode = undefined;
      let addressCity = undefined;
      let addressCountry = undefined;
      let phoneBusinessMobile = undefined;
      let phoneBusinessInternal = undefined;
      let phoneBusinessLandline = undefined;
      let phonePrivateMobile = undefined;
      let phonePrivateHome = undefined;

      let hasAddress = 'address' in json;
      let hasPhone = 'phone' in json;
      let hasPhoneBusiness = hasPhone && 'business' in json.phone;
      let hasPhonePrivate = hasPhone && 'private' in json.phone;


      if(hasAddress && 'street' in json.address) {
        addressStreet = json.address.street;
      }

      if(hasAddress && 'house_number' in json.address) {
        addressHouseNumber = json.address.house_number;
      }

      if(hasAddress && 'postal_code' in json.address) {
        addressPostalCode = json.address.postal_code;
      }

      if(hasAddress && 'city' in json.address) {
        addressCity = json.address.city;
      }

      if(hasAddress && 'country' in json.address) {
        addressCountry = json.address.country;
      }

      if(hasPhoneBusiness && 'mobile' in json.phone.business) {
        phoneBusinessMobile = json.phone.business.mobile;
      }

      if(hasPhoneBusiness && 'internal' in json.phone.business) {
        phoneBusinessInternal = json.phone.business.internal;
      }

      if(hasPhoneBusiness && 'landline' in json.phone.business) {
        phoneBusinessLandline = json.phone.business.landline;
      }

      if(hasPhonePrivate && 'mobile' in json.phone.private) {
        phonePrivateMobile = json.phone.private.mobile;
      }

      if(hasPhonePrivate && 'home' in json.phone.private) {
        phonePrivateHome = json.phone.private.home;
      }

      
      const userInfo = {
        keycloakId,
        fullName,
        firstName,
        lastName,
        username,
        email,
        avatar,
        realm,
        addressStreet,
        addressHouseNumber,
        addressPostalCode,
        addressCity,
        addressCountry,
        phoneBusinessMobile,
        phoneBusinessInternal,
        phoneBusinessLandline,
        phonePrivateMobile,
        phonePrivateHome,
      };


      done(null, userInfo);
    } catch (e) {
      done(e);
    }
  });
};

module.exports = Strategy;