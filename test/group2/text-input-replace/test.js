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
      .click('#button3')
      .assert.value('#base64', '[0,[{"location":0,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":1,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[255,66,66,1]},{"location":2,"length":3,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":5,"length":2,"fontFamily":"Helvetica","fontSize":36,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":7,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[255,113,0,1]},{"location":8,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,255,0,1]},{"location":9,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,255,1]}]]')
      .click('#button5')
      .assert.value('#base64', '[1,"123456\\n789"]')

      .moveToElement('canvas', 80, 30)
      .doubleClick()
      .keys(browser.Keys.SHIFT)
      .keys(browser.Keys.ARROW_LEFT)
      .keys(browser.Keys.NULL)
      .keys('0')
      .keys(browser.Keys.NULL)
      .click('#button3')
      .assert.value('#base64', '[2,[{"location":0,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":1,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[255,66,66,1]},{"location":2,"length":3,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":5,"length":2,"fontFamily":"Helvetica","fontSize":36,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":7,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[255,113,0,1]},{"location":8,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,255,0,1]},{"location":9,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,255,1]}]]')
      .click('#button5')
      .assert.value('#base64', '[3,"103456\\n789"]')

      .moveToElement('canvas', 30, 30)
      .doubleClick()
      .keys(browser.Keys.SHIFT)
      .keys(browser.Keys.ARROW_RIGHT)
      .keys(browser.Keys.ARROW_RIGHT)
      .keys(browser.Keys.NULL)
      .keys('2')
      .keys(browser.Keys.NULL)
      .click('#button3')
      .assert.value('#base64', '[4,[{"location":0,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":1,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[255,66,66,1]},{"location":2,"length":2,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":4,"length":2,"fontFamily":"Helvetica","fontSize":36,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":6,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[255,113,0,1]},{"location":7,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,255,0,1]},{"location":8,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,255,1]}]]')
      .click('#button5')
      .assert.value('#base64', '[5,"12456\\n789"]')

      .moveToElement('canvas', 30, 30)
      .doubleClick()
      .keys(browser.Keys.SHIFT)
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.NULL)
      .keys('2')
      .keys(browser.Keys.NULL)
      .click('#button3')
      .assert.value('#base64', '[6,[{"location":0,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":1,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[255,66,66,1]},{"location":2,"length":2,"fontFamily":"Helvetica","fontSize":36,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":4,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[255,113,0,1]},{"location":5,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,255,0,1]},{"location":6,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,255,1]}]]')
      .click('#button5')
      .assert.value('#base64', '[7,"126\\n789"]')

      .moveToElement('canvas', 80, 130)
      .doubleClick()
      .keys(browser.Keys.SHIFT)
      .keys(browser.Keys.ARROW_UP)
      .keys(browser.Keys.NULL)
      .keys('3')
      .keys(browser.Keys.NULL)
      .click('#button3')
      .assert.value('#base64', '[8,[{"location":0,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":1,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[255,66,66,1]},{"location":2,"length":1,"fontFamily":"Helvetica","fontSize":36,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,0,1]},{"location":3,"length":1,"fontFamily":"Helvetica","fontSize":72,"fontWeight":400,"fontStyle":"normal","letterSpacing":0,"textAlign":0,"textDecoration":[],"lineHeight":0,"paragraphSpacing":0,"color":[0,0,255,1]}]]')
      .click('#button5')
      .assert.value('#base64', '[9,"1239"]')

      .end();
  }
};
