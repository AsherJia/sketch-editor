const path = require('path');
const fs = require('fs');

module.exports = {
  'init': function(browser) {
    browser
      .url('file://' + path.join(__dirname, 'index.html'))
      .waitForElementVisible('body', 1000)
      .pause(20)
      .mouseButtonClick(2)
      .assert.value('input', '[{"v":10,"u":2},{"v":-110,"u":2},{"v":10,"u":2},{"v":-110,"u":2},{"v":0,"u":1},{"v":0,"u":1},10,-110,10,-110,0,0]')
      .moveToElement('canvas', 20, 20)
      .mouseButtonDown(0)
      .moveToElement('canvas', 40, 30)
      .mouseButtonUp(0)
      .mouseButtonClick(2)
      .assert.value('input', '[{"v":30,"u":2},{"v":-130,"u":2},{"v":20,"u":2},{"v":-120,"u":2},{"v":0,"u":1},{"v":0,"u":1},30,-130,20,-120,0,0]')
      .moveToElement('canvas', 20, 20)
      .mouseButtonDown(0)
      .moveToElement('canvas', 40, 30)
      .mouseButtonUp(0)
      .mouseButtonClick(2)
      .assert.value('input', '[{"v":50,"u":2},{"v":-150,"u":2},{"v":30,"u":2},{"v":-130,"u":2},{"v":0,"u":1},{"v":0,"u":1},50,-150,30,-130,0,0]]')
      .keys(browser.Keys.COMMAND)
      .keys('Z')
      .keys(browser.Keys.NULL)
      .mouseButtonClick(2)
      .assert.value('input', '[{"v":30,"u":2},{"v":-130,"u":2},{"v":20,"u":2},{"v":-120,"u":2},{"v":0,"u":1},{"v":0,"u":1},30,-130,20,-120,0,0]]')
      .keys(browser.Keys.COMMAND)
      .keys('Z')
      .keys(browser.Keys.NULL)
      .mouseButtonClick(2)
      .assert.value('input', '[{"v":10,"u":2},{"v":-110,"u":2},{"v":10,"u":2},{"v":-110,"u":2},{"v":0,"u":1},{"v":0,"u":1},10,-110,10,-110,0,0]')
      .keys(browser.Keys.COMMAND)
      .keys(browser.Keys.SHIFT)
      .keys('Z')
      .keys(browser.Keys.NULL)
      .mouseButtonClick(2)
      .assert.value('input', '[{"v":30,"u":2},{"v":-130,"u":2},{"v":20,"u":2},{"v":-120,"u":2},{"v":0,"u":1},{"v":0,"u":1},30,-130,20,-120,0,0]]')
      .keys(browser.Keys.COMMAND)
      .keys(browser.Keys.SHIFT)
      .keys('Z')
      .keys(browser.Keys.NULL)
      .mouseButtonClick(2)
      .assert.value('input', '[{"v":50,"u":2},{"v":-150,"u":2},{"v":30,"u":2},{"v":-130,"u":2},{"v":0,"u":1},{"v":0,"u":1},50,-150,30,-130,0,0]]')
      .end();
  }
};
