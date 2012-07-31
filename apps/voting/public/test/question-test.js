var Question = require('../question.js');
var expect = require('expect.js');

describe("Test for Question", function () { 
  it("Saves question", function () {
     var q = new Question();
     q.id = 0;
     q.text = 'Are older than 60?';
     q.name = 'q0';     
     q.value = true;
     var success = q.save();
     expect(success).to.be(true);     
  });
});
