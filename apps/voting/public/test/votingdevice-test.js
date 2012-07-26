describe("Tests for Voting Device", function () {
  describe("Question", function () {    
    it("checks #text after initialization", function () {
      var q = new window.Question({
        id: 3434,
        text: 'Are you okay?',
        name: 'q12',
        value: true
      });
      expect(q.attributes.text).to.be.eql('Are you okay?');
    });
    it("checks #url()", function () {
       var q = new window.Question({
        id: 3434,
        text: 'Are you okay?',
        name: 'q12',
        value: true
      });      
      var ex = '/votingdevice/question/' + q.attributes.id;
      expect(q.url()).to.be.eql(ex);
    });
   it("checks #update()", function () {
       var q = new window.Question({
        id: 3434,
        text: 'Are you okay?',
        name: 'q12',
        value: true
      });      
      q.update(false);
      expect(q.attributes.value).to.be.eql(false);
    });
     it("checks #isFalse()", function () {
       var q = new window.Question({
        id: 3434,
        text: 'Are you okay?',
        name: 'q12',
        value: false
      });    
      expect(q.isFalse()).to.be.eql(true);
    });
  });
});
