describe("VotingDevice", function () {
  beforeEach(function () {
    this.question = new Question({
      text: 'Are you okay?'
    });
  });
  it("checks text", function () {
    expect(this.question.attributes.text).toEqual('Are you okay?');
  });

});
