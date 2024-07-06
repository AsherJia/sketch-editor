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
      .assert.value('#base64', '[0,{"v":10,"u":1},{"v":190,"u":1},{"v":10,"u":1},{"v":190,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},10,190,10,190,200,200,0,0]')

      .moveToElement('.br', 1, 1)
      .mouseButtonDown(0)
      .moveToElement('.br', 21, 11)
      .mouseButtonUp(0)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[1,{"v":10,"u":1},{"v":170,"u":1},{"v":10,"u":1},{"v":180,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},10,170,10,180,220,210,0,0]')

      .keys(browser.Keys.META)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[2,{"v":10,"u":1},{"v":190,"u":1},{"v":10,"u":1},{"v":190,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},10,190,10,190,200,200,0,0]')

      .keys(browser.Keys.META)
      .keys(browser.Keys.SHIFT)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[3,{"v":10,"u":1},{"v":170,"u":1},{"v":10,"u":1},{"v":180,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},10,170,10,180,220,210,0,0]')

      .moveToElement('.tl', 1, 1)
      .mouseButtonDown(0)
      .moveToElement('.tl', 21, 11)
      .mouseButtonUp(0)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[4,{"v":30,"u":1},{"v":170,"u":1},{"v":20,"u":1},{"v":180,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},30,170,20,180,200,200,0,0]')

      .keys(browser.Keys.META)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[5,{"v":10,"u":1},{"v":170,"u":1},{"v":10,"u":1},{"v":180,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},10,170,10,180,220,210,0,0]')

      .keys(browser.Keys.META)
      .keys(browser.Keys.SHIFT)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[6,{"v":30,"u":1},{"v":170,"u":1},{"v":20,"u":1},{"v":180,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},30,170,20,180,200,200,0,0]')

      .moveToElement('.tr', 1, 1)
      .mouseButtonDown(0)
      .moveToElement('.tr', 21, 11)
      .mouseButtonUp(0)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[7,{"v":30,"u":1},{"v":150,"u":1},{"v":30,"u":1},{"v":180,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},30,150,30,180,220,190,0,0]')

      .keys(browser.Keys.META)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[8,{"v":30,"u":1},{"v":170,"u":1},{"v":20,"u":1},{"v":180,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},30,170,20,180,200,200,0,0]')

      .keys(browser.Keys.META)
      .keys(browser.Keys.SHIFT)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[9,{"v":30,"u":1},{"v":150,"u":1},{"v":30,"u":1},{"v":180,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},30,150,30,180,220,190,0,0]')

      .moveToElement('.bl', 1, 1)
      .mouseButtonDown(0)
      .moveToElement('.bl', 21, 11)
      .mouseButtonUp(0)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[10,{"v":50,"u":1},{"v":150,"u":1},{"v":30,"u":1},{"v":170,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},50,150,30,170,200,200,0,0]')

      .keys(browser.Keys.META)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[11,{"v":30,"u":1},{"v":150,"u":1},{"v":30,"u":1},{"v":180,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},30,150,30,180,220,190,0,0]')

      .keys(browser.Keys.META)
      .keys(browser.Keys.SHIFT)
      .keys('z')
      .keys(browser.Keys.NULL)
      .pause(20)
      .click('#button2')
      .assert.value('#base64', '[12,{"v":50,"u":1},{"v":150,"u":1},{"v":30,"u":1},{"v":170,"u":1},{"v":0,"u":0},{"v":0,"u":0},{"v":0,"u":1},{"v":0,"u":1},50,150,30,170,200,200,0,0]')

      .end();
  }
};
