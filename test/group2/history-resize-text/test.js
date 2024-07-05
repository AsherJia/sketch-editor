const path = require('path');
const fs = require('fs');

module.exports = {
  'init': function(browser) {
    browser
      .url('file://' + path.join(__dirname, 'index.html'))
      .waitForElementVisible('body', 1000)
      .pause(20)
      .moveToElement('canvas', 20, 20)
      .mouseButtonDown(0)
      .mouseButtonUp(0)
      .click('#button2')
      .assert.value('#base64', '[0,{"v":53,"u":2},{"v":0,"u":0},{"v":24.5,"u":2},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":0},{"v":-50,"u":2},{"v":-50,"u":2},53,-38.40625,24.5,47.90234375,85.40625,27.59765625,-42.703125,-13.798828125]')
      .moveToElement('.br', 1, 1)
      .mouseButtonDown(0)
      .moveToElement('.br', 21, 11)
      .pause(20)
      .mouseButtonUp(0)
      .click('#button2')
      .assert.value('#base64', '[1,{"v":63,"u":2},{"v":0,"u":0},{"v":29.5,"u":2},{"v":0,"u":0},{"v":105.40625,"u":1},{"v":37.59765625,"u":1},{"v":-50,"u":2},{"v":-50,"u":2},63,-68.40625,29.5,32.90234375,105.40625,37.59765625,-52.703125,-18.798828125]')
      .moveToElement('.br', 1, 1)
      .mouseButtonDown(0)
      .moveToElement('.br', 21, 11)
      .pause(20)
      .mouseButtonUp(0)
      .click('#button2')
      .assert.value('#base64', '[2,{"v":73,"u":2},{"v":0,"u":0},{"v":34.5,"u":2},{"v":0,"u":0},{"v":125.40625,"u":1},{"v":47.59765625,"u":1},{"v":-50,"u":2},{"v":-50,"u":2},73,-98.40625,34.5,17.90234375,125.40625,47.59765625,-62.703125,-23.798828125]')
      .keys(browser.Keys.META)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[3,{"v":63,"u":2},{"v":0,"u":0},{"v":29.5,"u":2},{"v":0,"u":0},{"v":105.40625,"u":1},{"v":37.59765625,"u":1},{"v":-50,"u":2},{"v":-50,"u":2},63,-68.40625,29.5,32.90234375,105.40625,37.59765625,-52.703125,-18.798828125]')
      .keys(browser.Keys.META)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[4,{"v":53,"u":2},{"v":0,"u":0},{"v":24.5,"u":2},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":0},{"v":-50,"u":2},{"v":-50,"u":2},53,-38.40625,24.5,47.90234375,85.40625,27.59765625,-42.703125,-13.798828125]')
      .keys(browser.Keys.META)
      .keys(browser.Keys.SHIFT)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[5,{"v":63,"u":2},{"v":0,"u":0},{"v":29.5,"u":2},{"v":0,"u":0},{"v":105.40625,"u":1},{"v":37.59765625,"u":1},{"v":-50,"u":2},{"v":-50,"u":2},63,-68.40625,29.5,32.90234375,105.40625,37.59765625,-52.703125,-18.798828125]')
      .keys(browser.Keys.META)
      .keys(browser.Keys.SHIFT)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[6,{"v":73,"u":2},{"v":0,"u":0},{"v":34.5,"u":2},{"v":0,"u":0},{"v":125.40625,"u":1},{"v":47.59765625,"u":1},{"v":-50,"u":2},{"v":-50,"u":2},73,-98.40625,34.5,17.90234375,125.40625,47.59765625,-62.703125,-23.798828125]')
      .moveToElement('.tl', 1, 1)
      .mouseButtonDown(0)
      .moveToElement('.tl', 21, 11)
      .pause(20)
      .mouseButtonUp(0)
      .click('#button2')
      .assert.value('#base64', '[7,{"v":83,"u":2},{"v":0,"u":0},{"v":39.5,"u":2},{"v":0,"u":0},{"v":105.40625,"u":1},{"v":37.59765625,"u":1},{"v":-50,"u":2},{"v":-50,"u":2},83,-88.40625,39.5,22.90234375,105.40625,37.59765625,-52.703125,-18.798828125]')
      .keys(browser.Keys.META)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .mouseButtonUp(0)
      .click('#button2')
      .assert.value('#base64', '[8,{"v":73,"u":2},{"v":0,"u":0},{"v":34.5,"u":2},{"v":0,"u":0},{"v":125.40625,"u":1},{"v":47.59765625,"u":1},{"v":-50,"u":2},{"v":-50,"u":2},73,-98.40625,34.5,17.90234375,125.40625,47.59765625,-62.703125,-23.798828125]')
      .end();
  }
};
